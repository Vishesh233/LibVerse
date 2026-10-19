import React, { useState } from 'react';
import { getBookCover, withCoverSize, DEFAULT_BOOK_COVER } from '../../utils/bookCover';

/**
 * Dashboard hero banner. With `covers`, a tilted collage of real catalogue covers (-M size) sits
 * behind a dark gradient (decorative, aria-hidden). Text stays on the darkest part of the shade:
 * >= 0.75 opacity of the page background over any cover, so white / slate-300 text is >= 6:1.
 */
export const DashboardHero = ({ covers = [], titleId, children, compact = false, className = '' }) => {
  const [failed, setFailed] = useState(() => new Set());
  const urls = covers
    .map((book) => withCoverSize(getBookCover(book), 'M'))
    .filter((url, i) => url && url !== DEFAULT_BOOK_COVER && !failed.has(i));

  return (
    <section
      aria-labelledby={titleId}
      className={`dash-hero relative isolate overflow-hidden rounded-[24px] border border-white/10 bg-surface ${compact ? 'dash-hero--compact' : ''} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        {urls.length > 0 && (
          <div className="dash-hero__collage">
            {urls.slice(0, 8).map((url, i) => (
              <img
                key={url}
                src={url}
                alt=""
                loading="lazy"
                decoding="async"
                onError={() => setFailed((prev) => new Set(prev).add(i))}
              />
            ))}
          </div>
        )}
        <div className="dash-hero__shade" />
      </div>
      <div className="dash-hero__content">{children}</div>
    </section>
  );
};
