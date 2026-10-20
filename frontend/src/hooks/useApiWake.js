import { useCallback, useEffect, useState } from 'react';
import { systemAPI } from '../services/api';

// The free demo server sleeps when idle and needs up to about a minute to start
export const WAKE_AFTER_MS = 3000; // show "Waking up" when the API has not answered by then
const RETRY_MS = 3000; // ask /api/health again every 3 s
export const GIVE_UP_MS = 90000; // then show the error with "Try again"

/**
 * Wait for the API to be ready (GET /api/health answers 200).
 * @param {boolean} enabled check only when true (the demo)
 * @returns {{ state: 'checking' | 'ready' | 'waking' | 'failed', elapsed: number, retry: () => void }}
 *   checking: the first 3 s; waking: still asleep after that; failed: not ready after about 90 s
 */
export const useApiWake = (enabled) => {
  const [state, setState] = useState(enabled ? 'checking' : 'ready');
  const [elapsed, setElapsed] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setState('ready');
      return undefined;
    }
    let cancelled = false;
    const started = Date.now();
    setState('checking');
    setElapsed(0);
    const showWaking = setTimeout(() => setState((s) => (s === 'checking' ? 'waking' : s)), WAKE_AFTER_MS);
    const tick = setInterval(() => setElapsed(Date.now() - started), 250);
    const stop = () => { clearTimeout(showWaking); clearInterval(tick); };

    (async () => {
      while (!cancelled) {
        const attemptStarted = Date.now();
        try {
          await systemAPI.health(RETRY_MS);
          if (!cancelled) setState('ready');
          break;
        } catch (e) {
          /* asleep, starting or unreachable: ask again */
        }
        if (Date.now() - started >= GIVE_UP_MS) {
          if (!cancelled) setState('failed');
          break;
        }
        await new Promise((r) => setTimeout(r, Math.max(0, RETRY_MS - (Date.now() - attemptStarted))));
      }
      stop();
    })();

    return () => { cancelled = true; stop(); };
  }, [enabled, round]);

  const retry = useCallback(() => setRound((r) => r + 1), []);
  return { state, elapsed, retry };
};
