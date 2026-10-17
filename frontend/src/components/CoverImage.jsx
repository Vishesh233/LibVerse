import React, { useState, useMemo, useEffect, useRef } from 'react';
import { getBookCoverCandidates, withCoverSize, DEFAULT_BOOK_COVER } from '../utils/bookCover';

/**
 * Reusable book cover image with fallback chain:
 * 1. uploaded coverImage
 * 2. imageUrl
 * 3. OpenLibrary ISBN cover
 * 4. default placeholder
 *
 * Features: onError fallback, lazy loading, never blocks rendering.
 *
 * Performance: candidates are derived from primitive values
 * (coverImage, imageUrl, isbn) so parent re-renders with the same
 * underlying data do NOT cause the fallback state to reset.
 *
 * The fallback index only resets when the actual candidate list changes
 * (via useEffect), preventing flicker from parent re-renders.
 *
 * - size: Open Library cover size, 'M' for cards (default) and 'L' for the details page
 * - backdrop: cover cards - the whole cover is shown (object-fit: contain) over a blurred,
 *   darkened copy of the same image that fills the frame. The parent must be position: relative.
 */
export const CoverImage = React.memo(function CoverImage({
  book,
  src,
  alt = 'Book cover',
  className = '',
  eager = false,
  iconClassName = 'text-slate-500',
  size = 'M',
  backdrop = false,
}) {
  const [candidateIndex, setCandidateIndex] = useState(0);

  // Derive candidates from primitive values so the memo stays stable even
  // when the parent passes a new `book` object reference.
  const coverImage = book?.coverImage;
  const imageUrl = book?.imageUrl;
  const isbn = book?.isbn;

  const candidates = useMemo(() => {
    const list = src
      ? [src, ...getBookCoverCandidates({ coverImage, imageUrl, isbn }).filter((c) => c !== src), DEFAULT_BOOK_COVER]
      : getBookCoverCandidates({ coverImage, imageUrl, isbn });
    // Same fallback order, with Open Library URLs at the requested size (duplicates removed)
    return [...new Set(list.map((c) => withCoverSize(c, size)))];
  }, [src, coverImage, imageUrl, isbn, size]);

  // Reset the fallback index only when candidates actually change.
  // Using useEffect (not setState during render) to avoid render-phase side effects.
  const candidateKeyRef = useRef(candidates.join('|'));
  useEffect(() => {
    const key = candidates.join('|');
    if (candidateKeyRef.current !== key) {
      candidateKeyRef.current = key;
      setCandidateIndex(0);
    }
  }, [candidates]);

  const currentSrc = candidates[candidateIndex] || DEFAULT_BOOK_COVER;
  const isDefault = currentSrc === DEFAULT_BOOK_COVER;

  // If we've fallen to the default inline placeholder, render it directly (never fails)
  if (isDefault) {
    return (
      <div className={`h-full w-full flex items-center justify-center bg-input ${className}`}>
        <svg className={`w-10 h-10 ${iconClassName}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
    );
  }

  const handleError = () => {
    // Only advance if there is a next candidate (prevents infinite loop)
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex((i) => i + 1);
    }
  };

  if (backdrop) {
    return (
      <>
        <img src={currentSrc} alt="" aria-hidden="true" loading={eager ? 'eager' : 'lazy'} decoding="async" className="cover-backdrop" />
        <img
          src={currentSrc}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={handleError}
          className={`cover-contain ${className}`}
        />
      </>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={handleError}
      className={`h-full w-full object-cover ${className}`}
    />
  );
});

export default CoverImage;
