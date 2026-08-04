import React, { useEffect, useRef, useState } from 'react';

const LOADING_MESSAGES = [
  'Initializing...',
  'Loading Library...',
  'Preparing Dashboard...',
  'Almost Ready...',
];

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 3) % 100}%`,
  delay: `${(i * 0.7) % 8}s`,
  duration: `${7 + (i % 5)}s`,
  opacity: 0.25 + ((i % 4) * 0.12),
}));

export const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 3200; // ~3.2s total

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

      <div className="splash-inner">
        <div className="splash-logo-card">
          <div className="splash-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
              <path d="M6 18.5V6.75A2.75 2.75 0 0 1 8.75 4H14a2.75 2.75 0 0 1 2.75 2.75V18.5" />
              <path d="M6 18.5C6 19.328 6.672 20 7.5 20H14a2 2 0 0 0 2-2V6.75" />
              <path d="M6 6.75C6 5.922 6.672 5.25 7.5 5.25H14" />
            </svg>
          </div>
          <div className="splash-logo-text">
            <h1>
              Lib<span className="brand-verse">Verse</span>
            </h1>
            <p>Library Management System</p>
          </div>
        </div>

        <div className="splash-progress-card">
          <div className="progress-labels">
            <span className="progress-message">{LOADING_MESSAGES[messageIndex]}</span>
            <span className="progress-percent">{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="splash-stats-grid">
          <div className="stat-card">
            <strong>5000+</strong>
            <span>Books</span>
          </div>
          <div className="stat-card">
            <strong>500+</strong>
            <span>Members</span>
          </div>
          <div className="stat-card">
            <strong>24/7</strong>
            <span>Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};