import React, { useEffect, useRef, useState } from 'react';
import { LogoMark } from './LogoMark';
import { SPLASH_TILES, readySplashTiles } from '../utils/splashTiles';

// One clock drives the whole timeline: the keyframes in index.css are percentages of this duration
// (desktop: hero in at 0.2 s, out at 2.2 s, logo at 2.4 s, reveal at 3.5 s; phones play it a bit faster)
const TOTAL_MS = 4000;
const TOTAL_MS_PHONE = 3400;
// A tile that is not decoded when the hero appears is left out, never shown half loaded
const TILE_DEADLINE_MS = 200;
const REDUCED_MS = 400;
const SKIP_MS = 220;

const CHIPS = ['React + Vite', 'Node + MongoDB', 'Python TF-IDF'];

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 3) % 100}%`,
  delay: `${(i * 0.7) % 8}s`,
  duration: `${7 + (i % 5)}s`,
  opacity: 0.25 + ((i % 4) * 0.12),
}));

const matches = (query) => typeof window !== 'undefined' && window.matchMedia?.(query).matches;

/**
 * Opening splash: the hero (text + tilted screens) appears together with gentle motion, fades back,
 * the logo spins in the centre, then the page underneath is revealed. It is an overlay: the app is
 * already mounted and loading below, and onDone fires when the overlay is gone.
 */
export const SplashScreen = ({ onDone }) => {
  const [reduced] = useState(() => matches('(prefers-reduced-motion: reduce)'));
  const [total] = useState(() => (matches('(max-width: 640px)') ? TOTAL_MS_PHONE : TOTAL_MS));
  const [skipping, setSkipping] = useState(false);
  const [dropped, setDropped] = useState(() => new Set());
  const skipRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true });
    const finish = setTimeout(() => doneRef.current(), reduced ? REDUCED_MS : total);
    const deadline = setTimeout(() => {
      const ready = readySplashTiles();
      setDropped(new Set(SPLASH_TILES.filter((t) => !ready.has(t.key)).map((t) => t.key)));
    }, TILE_DEADLINE_MS);
    return () => {
      clearTimeout(finish);
      clearTimeout(deadline);
    };
  }, [reduced, total]);

  useEffect(() => {
    if (!skipping) return undefined;
    const timer = setTimeout(() => doneRef.current(), SKIP_MS);
    return () => clearTimeout(timer);
  }, [skipping]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSkipping(true); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className={`libverse-splash hero-splash ${reduced ? 'is-reduced' : ''} ${skipping ? 'is-skipping' : ''}`}
      style={{ '--hs-total': `${total}ms` }}
      role="dialog"
      aria-modal="true"
      aria-label="LibVerse"
    >
      {/* Background: floating books and particles, unchanged */}
      <span className="splash-book" style={{ top: '12%', left: '10%', '--book-color': '#7b5cff', '--rotate': '12deg', '--delay': '0s' }} />
      <span className="splash-book" style={{ top: '22%', right: '8%', '--book-color': '#2dd4bf', '--rotate': '-12deg', '--delay': '1.2s' }} />
      <span className="splash-book" style={{ bottom: '14%', left: '12%', '--book-color': '#f472b6', '--rotate': '8deg', '--delay': '2.4s' }} />
      <span className="splash-book" style={{ bottom: '18%', right: '14%', '--book-color': '#34d399', '--rotate': '-8deg', '--delay': '0.6s' }} />
      <span className="splash-book" style={{ top: '52%', right: '22%', '--book-color': '#60a5fa', '--rotate': '18deg', '--delay': '1.8s' }} />
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

      {!reduced && (
        <div className="hs-hero" aria-hidden="true">
          <div className="hs-grid" />
          <div className="hs-text">
            <div className="hs-brand">
              <LogoMark size="sm" />
              <span className="hs-wordmark font-display">Lib<span>Verse</span></span>
            </div>
            <h2 className="hs-title font-display">Smart Library Management System</h2>
            <p className="hs-desc">
              Borrowing, returns, fines, reservations, QR library cards and AI picks for students, librarians and admins.
            </p>
            <ul className="hs-chips">
              {CHIPS.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
          <div className="hs-collage">
            <div className="hs-scene">
              {SPLASH_TILES.filter((t) => !dropped.has(t.key)).map((t) => (
                <div className={`hs-tile hs-tile--${t.key}`} key={t.key}>
                  <div className="hs-float">
                    <img
                      src={t.src}
                      alt=""
                      draggable="false"
                      decoding="async"
                      onError={() => setDropped((prev) => new Set(prev).add(t.key))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="hs-logo" aria-hidden="true">
        <span className="splash-logo-glow-wrap">
          <span className="splash-logo-glow" />
          <LogoMark size="lg" />
        </span>
      </div>

      <button ref={skipRef} type="button" className="hs-skip" onClick={() => setSkipping(true)}>
        Skip<span className="sr-only"> intro</span>
      </button>
    </div>
  );
};
