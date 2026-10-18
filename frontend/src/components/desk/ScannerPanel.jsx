import React, { useEffect, useId, useRef, useState } from 'react';
import { useQrScanner } from '../../hooks/useQrScanner';
import { isSoundMuted, setSoundMuted } from '../../utils/deskFeedback';

const IconCamera = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.83 6.18A2.31 2.31 0 0 1 5.18 7.23c-.38.05-.76.11-1.13.18C3 7.58 2.25 8.5 2.25 9.57V18A2.25 2.25 0 0 0 4.5 20.25h15A2.25 2.25 0 0 0 21.75 18V9.57c0-1.07-.75-1.99-1.8-2.16a47.9 47.9 0 0 0-1.13-.18 2.31 2.31 0 0 1-1.64-1.06l-.82-1.31a2.19 2.19 0 0 0-1.74-1.03 48.8 48.8 0 0 0-5.24 0 2.19 2.19 0 0 0-1.74 1.03l-.82 1.31Z" />
    <path d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
  </svg>
);

/**
 * Camera preview + manual entry for the scan desk.
 * Manual entry also serves USB barcode scanners, which type the code and press Enter.
 * @param {object} props
 * @param {boolean} props.cameraOn
 * @param {(on: boolean) => void} props.onCameraChange
 * @param {(code: string, source: 'camera'|'manual') => void} props.onCode
 * @param {string} props.prompt - what to scan next ("Scan the student's library card")
 * @param {boolean} [props.busy]
 */
export const ScannerPanel = ({ cameraOn, onCameraChange, onCode, prompt, busy = false }) => {
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef(null);
  const [manual, setManual] = useState('');
  const [muted, setMuted] = useState(isSoundMuted);
  const { videoRef, status, error, engine, torch, toggleTorch, retry } = useQrScanner({
    active: cameraOn,
    onCode: (text) => onCode(text, 'camera'),
  });

  // Desktop: keep the entry box focused so a USB scanner can type into it (not on touch screens)
  useEffect(() => {
    if (window.matchMedia?.('(pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true });
  }, [prompt]);

  const submit = (e) => {
    e.preventDefault();
    const code = manual.trim();
    if (!code) return;
    setManual('');
    onCode(code, 'manual');
  };

  const toggleMute = () => {
    setSoundMuted(!muted);
    setMuted(!muted);
  };

  return (
    <section className="card-glass flex flex-col gap-4 !p-4 sm:!p-5" aria-labelledby={`${inputId}-title`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`${inputId}-title`} className="font-display text-lg font-semibold text-slate-100">Scanner</h2>
        <div className="flex flex-wrap items-center justify-end gap-1.5 whitespace-nowrap">
          {cameraOn && torch.supported && (
            <button type="button" onClick={toggleTorch} aria-pressed={torch.on} className="btn-secondary min-h-[36px] px-3 text-xs">
              {torch.on ? 'Torch off' : 'Torch on'}
            </button>
          )}
          <button type="button" onClick={toggleMute} aria-pressed={!muted} className="btn-ghost min-h-[36px] px-2.5 text-xs" title={muted ? 'Turn scan sounds on' : 'Turn scan sounds off'}>
            {muted ? 'Sound off' : 'Sound on'}
          </button>
          <button type="button" onClick={() => onCameraChange(!cameraOn)} className={`${cameraOn ? 'btn-secondary' : 'btn-primary'} min-h-[36px] px-3 text-xs`}>
            <IconCamera />
            {cameraOn ? 'Stop camera' : 'Start camera'}
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-black/60" style={{ aspectRatio: '4 / 3' }}>
        <video ref={videoRef} muted playsInline className={`h-full w-full object-cover ${status === 'scanning' ? '' : 'opacity-0'}`} aria-label="Camera preview" />
        {status === 'scanning' && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
            <div className="desk-scan-frame h-[62%] w-[62%] max-w-[300px] rounded-2xl" />
          </div>
        )}
        {status !== 'scanning' && (
          <div className="absolute inset-0 grid place-items-center p-5 text-center">
            {status === 'starting' ? (
              <p className="text-sm text-slate-300" role="status">Starting the camera…</p>
            ) : error ? (
              <div className="max-w-sm space-y-3" role="alert">
                <p className="text-sm text-amber-200">{error.message}</p>
                {!['insecure', 'unsupported'].includes(error.kind) && (
                  <button type="button" onClick={retry} className="btn-secondary min-h-[36px] px-3 text-xs">Try again</button>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-slate-400">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300"><IconCamera /></span>
                <p className="text-sm">Camera is off. Start it to scan, or type a code below.</p>
              </div>
            )}
          </div>
        )}
        {status === 'scanning' && (
          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-6 text-center text-xs text-slate-200" aria-live="polite">
            {busy ? 'Checking…' : prompt}
          </p>
        )}
      </div>

      <form onSubmit={submit} className="space-y-1.5" aria-label="Enter a code manually">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-200">Enter code manually</label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id={inputId}
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Library ID, ISBN or code"
            autoComplete="off"
            spellCheck="false"
            className="input-amo min-w-0 flex-1"
            aria-describedby={hintId}
          />
          <button type="submit" disabled={busy || !manual.trim()} className="btn-primary min-h-[44px] px-4 text-sm">Look up</button>
        </div>
        <p id={hintId} className="text-xs text-slate-500">
          {prompt}. USB barcode scanners type here and press Enter.{engine ? ` Scanning with ${engine === 'native' ? 'the built-in detector' : 'jsQR'}.` : ''}
        </p>
      </form>
    </section>
  );
};
