import React from 'react';
import { GIVE_UP_MS } from '../../hooks/useApiWake';

/**
 * Demo cold start: the free server is asleep. A progress bar while it starts (it asks again every
 * 3 s), then a friendly error with "Try again" after about 90 s.
 * @param {{ state: 'waking' | 'failed', elapsed: number, onRetry: () => void }} props
 */
export const DemoWakeScreen = ({ state, elapsed, onRetry }) => {
  if (state === 'failed') {
    return (
      <div className="auth-form" role="alert">
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-50">
          <p className="font-semibold text-white">The demo library didn&apos;t wake up this time.</p>
          <p className="mt-1 text-amber-100/90">The free server can be slow to start. Give it another go in a moment.</p>
        </div>
        <button type="button" className="login-button" onClick={onRetry}>Try again</button>
      </div>
    );
  }
  // Fills over the 90 s (most starts take 30-60 s); never reaches 100 % before the server answers
  const percent = Math.min(95, Math.round((elapsed / GIVE_UP_MS) * 100) + 5);
  const seconds = Math.floor(elapsed / 1000);
  return (
    <div className="auth-form" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="login-spinner" aria-hidden="true" />
        <p className="font-display text-lg font-semibold text-white">Waking up the demo library…</p>
        <p className="text-sm text-slate-400">The free server sleeps when nobody is using it. Starting it usually takes 30 to 60 seconds.</p>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label="Starting the demo server"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-[width] duration-300 ease-out" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-center text-xs text-muted">{seconds}s · checking every 3 seconds</p>
    </div>
  );
};
