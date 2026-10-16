import React from 'react';

/**
 * LibVerse logo mark: glass tile with a cyan open-book icon.
 * - size 'sm' (32px tile) and 'md' (44px tile): tile only
 * - size 'lg' (92px tile in a 168px frame): adds an outer cyan ring with an orbiting dot
 *   and an inner dashed violet ring rotating the other way (both stop under prefers-reduced-motion)
 * - label: when given, the mark is announced as an image with that name; otherwise it is decorative
 */
const BookIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M2 4.5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
    <path d="M22 4.5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const LogoMark = ({ size = 'md', label, className = '' }) => {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };

  if (size === 'lg') {
    return (
      <div className={`logo-mark logo-mark--lg ${className}`} {...a11y}>
        <span className="logo-mark__ring-outer" />
        <span className="logo-mark__ring-inner" />
        <span className="logo-mark__orbit">
          <span className="logo-mark__dot" />
        </span>
        <span className="logo-mark__tile">
          <BookIcon className="logo-mark__icon" />
        </span>
      </div>
    );
  }

  return (
    <span className={`logo-mark logo-mark--${size === 'sm' ? 'sm' : 'md'} ${className}`} {...a11y}>
      <span className="logo-mark__tile">
        <BookIcon className="logo-mark__icon" />
      </span>
    </span>
  );
};

export default LogoMark;
