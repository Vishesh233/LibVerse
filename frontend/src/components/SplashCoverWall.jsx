import React, { useEffect, useMemo, useState } from 'react';
import { booksAPI } from '../services/api';
import { withCoverSize } from '../utils/bookCover';
import { assetUrl } from '../utils/assetUrl';
import BUNDLED_COVERS from '../data/splashCovers.json';

/**
 * Decorative wall of real book covers behind the splash: columns on a tilted plane,
 * each scrolling endlessly (the column's covers are rendered twice for a seamless loop).
 * Which covers: the localStorage cache when there is one, else a bundled list of 24 top-rated
 * Open Library covers (src/data/splashCovers.json, made by scripts/buildSplashCovers.js), so a
 * first-time visitor sees covers at once even while the free API is asleep. The API refresh runs in
 * the background and only updates the cache for the next session: it never delays or reshuffles
 * the splash. Covers fade in as they load, a cover that fails is dropped, and with nothing loaded
 * the layer stays invisible (plain splash).
 */
const CACHE_KEY = 'libverse:splash-covers';
const MAX_IMAGES = 30; // DOM images, duplicates included
const COVER_REQUEST = { sort: 'rating', limit: 24 };

// Speed (seconds per loop) and direction per column; alternate up/down
const COLUMN_MOTION = [
  { duration: 46, reverse: false },
  { duration: 38, reverse: true },
  { duration: 52, reverse: false },
  { duration: 42, reverse: true },
  { duration: 49, reverse: false },
];

const bundledCovers = () => (Array.isArray(BUNDLED_COVERS)
  ? BUNDLED_COVERS.filter((u) => typeof u === 'string' && /^https:\/\//i.test(u))
  : []);

const readCache = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    return Array.isArray(parsed?.urls) ? parsed.urls.filter((u) => typeof u === 'string') : [];
  } catch (e) {
    return [];
  }
};

const writeCache = (urls) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ urls, savedAt: Date.now() }));
  } catch (e) {
    /* storage unavailable or full: the next splash just fetches again */
  }
};

/** Real, absolute cover URLs at the Open Library -M size; books without a cover are skipped */
const coverUrlsFrom = (books) => {
  const seen = new Set();
  return (books || [])
    .map((b) => withCoverSize(assetUrl(b?.imageUrl || b?.coverImage || ''), 'M'))
    .filter((url) => /^https?:\/\//i.test(url) && !seen.has(url) && seen.add(url));
};

const columnCountFor = (width) => (width < 640 ? 3 : width < 1024 ? 4 : 5);

export const SplashCoverWall = ({ exiting = false }) => {
  // Cache if present, else the bundled list: never empty, never waits for the network
  const [urls] = useState(() => {
    const cached = readCache();
    return cached.length > 0 ? cached : bundledCovers();
  });
  const [loaded, setLoaded] = useState(() => new Set());
  const [failed, setFailed] = useState(() => new Set());
  const [columnCount] = useState(() => columnCountFor(typeof window === 'undefined' ? 1280 : window.innerWidth));

  // Background refresh: only updates the cache for the next session (no reshuffle mid-splash).
  // It is not tied to this component, so it still finishes after the splash is gone.
  useEffect(() => {
    booksAPI
      .getBooks(COVER_REQUEST)
      .then((res) => {
        const fresh = coverUrlsFrom(res.data?.books);
        if (fresh.length > 0) writeCache(fresh);
      })
      .catch(() => {
        /* offline or asleep: the cache (or the bundled list) is used next time too */
      });
  }, []);

  // Split the covers into columns; each column is shown twice, so at most MAX_IMAGES / 2 unique covers
  const columns = useMemo(() => {
    const perColumn = Math.floor(MAX_IMAGES / 2 / columnCount);
    const pool = urls.slice(0, perColumn * columnCount);
    return Array.from({ length: columnCount }, (_, c) => pool.filter((_, i) => i % columnCount === c));
  }, [urls, columnCount]);

  const markLoaded = (url) => setLoaded((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));
  const markFailed = (url) => setFailed((prev) => (prev.has(url) ? prev : new Set(prev).add(url)));

  if (urls.length === 0) return null;

  return (
    <div
      className={`splash-cover-wall ${loaded.size > 0 ? 'has-covers' : ''} ${exiting ? 'is-exiting' : ''}`}
      aria-hidden="true"
    >
      <div className="splash-cover-plane">
        {columns.map((column, c) => {
          const motion = COLUMN_MOTION[c % COLUMN_MOTION.length];
          const visible = column.filter((url) => !failed.has(url));
          return (
            <div className="splash-cover-column" key={c}>
              <div
                className={`splash-cover-track ${motion.reverse ? 'is-reverse' : ''}`}
                style={{ '--cover-duration': `${motion.duration}s`, '--cover-delay': `-${(c * 7.3) % motion.duration}s` }}
              >
                {[0, 1].map((copy) =>
                  visible.map((url) => (
                    <img
                      key={`${copy}-${url}`}
                      src={url}
                      alt=""
                      draggable="false"
                      decoding="async"
                      className={`splash-cover ${loaded.has(url) ? 'is-loaded' : ''}`}
                      // Open Library answers a missing cover with a 1x1 image: treat it as failed
                      onLoad={(e) => (e.currentTarget.naturalWidth > 10 ? markLoaded(url) : markFailed(url))}
                      onError={() => markFailed(url)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="splash-cover-shade" />
    </div>
  );
};
