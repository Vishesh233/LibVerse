import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { DEMO_APP_URL, IS_DEMO_BUILD } from '../utils/siteConfig';
import { LogoMark } from '../components/LogoMark';
import { LegalLinks } from '../components/legal/LegalLinks';

/**
 * /demo on the full app: off to the live demo site (VITE_DEMO_APP_URL). Without it, a short
 * "Demo not configured" page. On the demo site itself, /demo is the role picker.
 */
export const DemoRedirect = () => {
  useEffect(() => {
    if (!IS_DEMO_BUILD && DEMO_APP_URL) window.location.replace(DEMO_APP_URL);
  }, []);

  if (IS_DEMO_BUILD) return <Navigate to="/login" replace />;

  return (
    <div className="login-background">
      <div className="login-bg-gradient login-bg-gradient-1" />
      <div className="login-bg-gradient login-bg-gradient-2" />
      <div className="auth-scroll">
        <div className="auth-center">
          <main className="login-card auth-card text-center">
            <div className="mb-4 flex justify-center"><LogoMark size="md" /></div>
            {DEMO_APP_URL ? (
              <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 py-4 text-sm text-slate-400">
                <span className="login-spinner" />
                Opening the live demo…
                <a href={DEMO_APP_URL} className="font-medium text-indigo-300 hover:text-white">Continue to the demo</a>
              </div>
            ) : (
              <>
                <h1 className="auth-heading font-display font-bold text-white">Demo not configured</h1>
                <p className="mt-2 text-sm text-slate-400">The live demo isn&apos;t set up on this site yet.</p>
                <Link to="/login" className="login-button mt-6 flex items-center justify-center">Go to sign in</Link>
              </>
            )}
            <LegalLinks className="mt-6" />
          </main>
        </div>
      </div>
    </div>
  );
};
