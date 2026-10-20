import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogoMark } from '../LogoMark';
import { useAuth } from '../../hooks/useAuth';
import { LegalLinks } from './LegalLinks';

export const LEGAL_UPDATED = '20 October 2026';
export const CONTACT_EMAIL = 'visheshkhanna2345@gmail.com';

/** A section of a legal page: heading + body */
export const LegalSection = ({ title, children }) => (
  <section className="mt-9 first:mt-0">
    <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
    <div className="mt-3 space-y-3 text-[15px] leading-7 text-slate-300 [&_a]:font-medium [&_a]:text-indigo-300 [&_a:hover]:text-white [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-slate-100 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
      {children}
    </div>
  </section>
);

/**
 * The shared layout of /privacy and /terms: public (no sign-in), on both the Full App and the demo.
 * @param {{ title: string, intro: React.ReactNode, children: React.ReactNode }} props
 */
export const LegalPage = ({ title, intro, children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · LibVerse`;
    window.scrollTo(0, 0);
    return () => { document.title = previous; };
  }, [title]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02040f] via-[#040813] to-[#0b1534] px-4 py-8 text-slate-100 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-300">
            <LogoMark size="sm" />
            <span className="brand-wordmark text-xl font-bold leading-none">
              Lib<span className="brand-wordmark-accent">Verse</span>
            </span>
          </Link>
          <Link to={isAuthenticated ? '/' : '/login'} className="text-sm font-medium text-indigo-300 transition-colors hover:text-white">
            {isAuthenticated ? '← Back to the app' : '← Back to sign in'}
          </Link>
        </header>

        <main className="card-glass !rounded-3xl !p-6 sm:!p-10">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-400">Last updated: {LEGAL_UPDATED}</p>
          <div className="mt-5 rounded-xl border border-indigo-400/20 bg-indigo-500/[0.07] p-4 text-[15px] leading-7 text-slate-200">
            {intro}
          </div>
          <div className="mt-9">{children}</div>
        </main>

        <footer className="mt-6 space-y-2 pb-4 text-center">
          <LegalLinks />
          <p className="text-xs text-muted">© 2026 LibVerse · a student portfolio project</p>
        </footer>
      </div>
    </div>
  );
};
