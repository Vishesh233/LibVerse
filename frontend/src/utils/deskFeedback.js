/**
 * Short confirmation for desk scans: a soft beep and a vibration.
 * - Sound only after the first user interaction on the page (no autoplay) and only when not muted.
 * - Vibration is skipped when the user prefers reduced motion.
 */
const MUTE_KEY = 'libverse:desk-sound-off';
let audioContext = null;
let unlocked = false;

export const isSoundMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
};

export const setSoundMuted = (muted) => {
  try {
    if (muted) localStorage.setItem(MUTE_KEY, '1');
    else localStorage.removeItem(MUTE_KEY);
  } catch {
    /* storage unavailable: the choice lasts for this page only */
  }
};

/** Call from a click/keydown handler: allows sound from now on */
export const unlockSound = () => {
  unlocked = true;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const beep = (frequency, duration) => {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audioContext = audioContext || new Ctx();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration / 1000);
  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration / 1000 + 0.02);
};

/**
 * @param {'success'|'error'} kind
 */
export const deskFeedback = (kind) => {
  try {
    if (!prefersReducedMotion() && navigator.vibrate) navigator.vibrate(kind === 'error' ? [70, 50, 70] : 40);
    if (unlocked && !isSoundMuted()) {
      if (kind === 'error') beep(220, 220);
      else beep(880, 90);
    }
  } catch {
    /* feedback is optional */
  }
};
