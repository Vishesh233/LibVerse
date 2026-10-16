import React, { useEffect, useRef, useState } from 'react';
import { booksAPI } from '../services/api';
import { GENRES } from '../constants/genres';
import { LogoMark } from './LogoMark';

const LOADING_MESSAGES = [
  'Initializing...',
  'Loading Library...',
  'Preparing Dashboard...',
  'Almost Ready...',
];

// Stats are real or not shown at all: if the request is slow or fails, they stay hidden
const STATS_TIMEOUT_MS = 1200;

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 3) % 100}%`,
  delay: `${(i * 0.7) % 8}s`,
  duration: `${7 + (i % 5)}s`,
  opacity: 0.25 + ((i % 4) * 0.12),
}));

export const SplashScreen = ({ duration = 1800 }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [bookCount, setBookCount] = useState(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a natural feel
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));

      // Update message based on progress
      if (eased < 0.25) setMessageIndex(0);
      else if (eased < 0.5) setMessageIndex(1);
      else if (eased < 0.75) setMessageIndex(2);
      else setMessageIndex(3);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration]);

  // Real catalogue size from the public books endpoint (pagination total)
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), STATS_TIMEOUT_MS);

    booksAPI
      .getBooks({ limit: 1 }, { signal: controller.signal })
      .then((res) => {
        const total = res.data?.total;
        if (!cancelled && Number.isFinite(total) && total > 0) setBookCount(total);
      })
      .catch(() => {
        /* slow or failed: keep stats hidden rather than show made-up numbers */
      })
      .finally(() => clearTimeout(timer));

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  return (
    <div className="libverse-splash">
      {/* Floating 3D books */}
      <span className="splash-book" style={{ top: '12%', left: '10%', '--book-color': '#7b5cff', '--rotate': '12deg', '--delay': '0s' }} />
      <span className="splash-book" style={{ top: '22%', right: '8%', '--book-color': '#2dd4bf', '--rotate': '-12deg', '--delay': '1.2s' }} />
      <span className="splash-book" style={{ bottom: '14%', left: '12%', '--book-color': '#f472b6', '--rotate': '8deg', '--delay': '2.4s' }} />
      <span className="splash-book" style={{ bottom: '18%', right: '14%', '--book-color': '#34d399', '--rotate': '-8deg', '--delay': '0.6s' }} />
      <span className="splash-book" style={{ top: '52%', right: '22%', '--book-color': '#60a5fa', '--rotate': '18deg', '--delay': '1.8s' }} />

      {/* Tiny particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="splash-particle"
          style={{
            left: p.left,
            '--particle-delay': p.delay,
            '--particle-duration': p.duration,
            '--particle-opacity': p.opacity,
          }}
        />
      ))}

      <div className="splash-inner splash-enter">
        <div className="splash-logo-card">
          <LogoMark size="lg" />
          <div className="splash-logo-text">
            <h1 className="font-display">
              Lib<span className="brand-verse">Verse</span>
            </h1>
            <p>Your library, beautifully organised</p>
          </div>
        </div>

        <div className="splash-progress-slim" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Loading LibVerse">
          <div className="splash-progress-slim-labels">
            <span>{LOADING_MESSAGES[messageIndex]}</span>
            <span>{progress}%</span>
          </div>
          <div className="splash-progress-slim-track">
            <div className="splash-progress-slim-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {bookCount !== null && (
          <div className="splash-stats-row">
            <div className="splash-stat">
              <strong className="font-display">{bookCount.toLocaleString()}</strong>
              <span>Books</span>
            </div>
            <div className="splash-stat">
              <strong className="font-display">{GENRES.length}</strong>
              <span>Genres</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};