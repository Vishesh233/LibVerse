import { useCallback, useEffect, useRef, useState } from 'react';
import { decodeImageData } from '../utils/qrDecode';

const SCAN_INTERVAL_MS = 120; // ~8 frames a second is plenty and keeps the CPU calm
const MAX_DECODE_WIDTH = 640; // jsqr works on a downscaled frame

const CAMERA_ERRORS = {
  insecure: 'The camera needs a secure page (HTTPS or localhost). Type or scan codes into the box below instead.',
  unsupported: 'This browser cannot use a camera here. Type or scan codes into the box below instead.',
  denied: 'Camera access was blocked. Allow the camera for this site in the browser settings, or type codes below.',
  nocamera: 'No camera was found on this device. Type codes below, or use a USB barcode scanner.',
  busy: 'The camera is being used by another app. Close it and try again.',
  failed: 'The camera could not start. Try again, or type codes below.',
};

/** Native detector when the browser has one for QR codes, else null (jsqr is used) */
const createNativeDetector = async () => {
  try {
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) return null;
    const formats = await window.BarcodeDetector.getSupportedFormats?.();
    if (formats && !formats.includes('qr_code')) return null;
    return new window.BarcodeDetector({ formats: ['qr_code'] });
  } catch {
    return null;
  }
};

/**
 * Camera QR scanner. The camera only runs while `active` is true and the page is visible.
 * @param {object} options
 * @param {boolean} options.active - start/stop the camera
 * @param {(text: string) => void} options.onCode - called for every decoded code (the caller de-duplicates)
 * @returns {{ videoRef, status: 'idle'|'starting'|'scanning'|'error', error: {kind,message}|null,
 *   engine: 'native'|'jsqr'|null, torch: {supported, on}, toggleTorch: Function, retry: Function }}
 */
export const useQrScanner = ({ active, onCode }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const detectorRef = useRef(null);
  const runRef = useRef(0); // increments on every start/stop so stale loops end
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [engine, setEngine] = useState(null);
  const [torch, setTorch] = useState({ supported: false, on: false });
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  const [attempt, setAttempt] = useState(0);

  const stop = useCallback(() => {
    runRef.current += 1;
    clearTimeout(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setTorch({ supported: false, on: false });
  }, []);

  const scanFrame = useCallback(async (run) => {
    if (run !== runRef.current) return;
    const video = videoRef.current;
    try {
      if (video && video.readyState >= 2 && video.videoWidth) {
        let text = null;
        if (detectorRef.current) {
          try {
            const codes = await detectorRef.current.detect(video);
            text = codes?.[0]?.rawValue || null;
          } catch {
            detectorRef.current = null; // native detection failed: use jsqr from now on
            setEngine('jsqr');
          }
        }
        if (!detectorRef.current && !text) {
          const scale = Math.min(1, MAX_DECODE_WIDTH / video.videoWidth);
          const w = Math.round(video.videoWidth * scale);
          const h = Math.round(video.videoHeight * scale);
          const canvas = canvasRef.current || (canvasRef.current = document.createElement('canvas'));
          if (canvas.width !== w) canvas.width = w;
          if (canvas.height !== h) canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(video, 0, 0, w, h);
          text = decodeImageData(ctx.getImageData(0, 0, w, h));
        }
        if (text && run === runRef.current) onCodeRef.current?.(text);
      }
    } catch {
      /* a bad frame: try the next one */
    }
    if (run === runRef.current) timerRef.current = setTimeout(() => scanFrame(run), SCAN_INTERVAL_MS);
  }, []);

  const start = useCallback(async () => {
    stop();
    const run = runRef.current;
    setError(null);
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setStatus('error');
      setError({ kind: 'insecure', message: CAMERA_ERRORS.insecure });
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('error');
      setError({ kind: 'unsupported', message: CAMERA_ERRORS.unsupported });
      return;
    }
    setStatus('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (run !== runRef.current) {
        stream.getTracks().forEach((t) => t.stop()); // stopped while waiting for permission
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        await video.play().catch(() => {});
      }
      const track = stream.getVideoTracks()[0];
      const caps = track?.getCapabilities?.() || {};
      setTorch({ supported: !!caps.torch, on: false });
      detectorRef.current = await createNativeDetector();
      setEngine(detectorRef.current ? 'native' : 'jsqr');
      setStatus('scanning');
      scanFrame(run);
    } catch (err) {
      if (run !== runRef.current) return;
      const kind = err?.name === 'NotAllowedError' || err?.name === 'SecurityError' ? 'denied'
        : err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError' ? 'nocamera'
          : err?.name === 'NotReadableError' ? 'busy' : 'failed';
      setStatus('error');
      setError({ kind, message: CAMERA_ERRORS[kind] });
    }
  }, [scanFrame, stop]);

  // Pause when the tab is hidden; resume when it is shown again
  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (active && visible) start();
    else {
      stop();
      setStatus('idle');
    }
    return stop;
  }, [active, visible, attempt, start, stop]);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch.on }] });
      setTorch((t) => ({ ...t, on: !t.on }));
    } catch {
      setTorch({ supported: false, on: false });
    }
  }, [torch.on]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { videoRef, status, error, engine, torch, toggleTorch, retry };
};
