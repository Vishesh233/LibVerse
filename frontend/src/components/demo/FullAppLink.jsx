import React from 'react';
import { fullAppLoginUrl } from '../../utils/siteConfig';

/**
 * Demo site: "Sign in / Create your own account", to the full app's sign-in page
 * (VITE_FULL_APP_URL/login). Renders nothing when VITE_FULL_APP_URL is not set.
 * @param {{ className?: string }} props
 */
export const FullAppLink = ({ className = '' }) => {
  const href = fullAppLoginUrl();
  if (!href) return null;
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-indigo-300/30 bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-100 transition-colors hover:border-indigo-200/60 hover:bg-indigo-500/25 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 ${className}`}
    >
      Sign in / Create your own account
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </a>
  );
};
