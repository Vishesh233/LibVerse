import React from 'react';
import { Link } from 'react-router-dom';

/**
 * "Privacy · Terms" links for footers (sign-in, sign-up, demo, profile). Public pages that work on
 * both the Full App and the demo site.
 * @param {{ className?: string }} props
 */
export const LegalLinks = ({ className = '' }) => (
  <nav aria-label="Legal" className={`flex items-center justify-center gap-2 text-xs text-muted ${className}`}>
    <Link to="/privacy" className="rounded transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300">
      Privacy
    </Link>
    <span aria-hidden="true">·</span>
    <Link to="/terms" className="rounded transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300">
      Terms
    </Link>
  </nav>
);
