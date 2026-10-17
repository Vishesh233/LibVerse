/**
 * Default book cover placeholder (inline SVG to avoid broken image icons)
 */
export const DEFAULT_BOOK_COVER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
  <rect width="400" height="600" fill="#1e293b"/>
  <rect x="20" y="20" width="360" height="560" rx="12" fill="none" stroke="#334155" stroke-width="4"/>
  <text x="200" y="250" font-family="Arial, sans-serif" font-size="80" text-anchor="middle">📚</text>
  <text x="200" y="380" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#64748b" text-anchor="middle">No Cover</text>
  <text x="200" y="430" font-family="Arial, sans-serif" font-size="22" fill="#475569" text-anchor="middle">Available</text>
</svg>
`);

// covers.openlibrary.org/b/{isbn|id|olid}/<key>-S|M|L.jpg
const OPEN_LIBRARY_COVER = /^(https?:\/\/covers\.openlibrary\.org\/b\/(?:isbn|id|olid)\/[^/?#]+?)-[SML](\.jpg)((?:[?#].*)?)$/i;

/**
 * Point an Open Library cover URL at the requested size: 'M' (~180px wide) for cards,
 * 'L' (full size) for the book details page. Any other URL is returned unchanged.
 * @param {string} url
 * @param {'S'|'M'|'L'} size
 */
export const withCoverSize = (url, size = 'M') => {
  if (typeof url !== 'string' || !/^[SML]$/.test(size)) return url;
  return url.replace(OPEN_LIBRARY_COVER, `$1-${size}$2$3`);
};

/**
 * Get candidate cover URL list in priority order:
 * 1. imageUrl (reliable persisted source)
 * 2. uploaded coverImage
 * 3. OpenLibrary ISBN cover
 * 4. default placeholder
 *
 * Candidates are de-duplicated so the same URL is never tried twice
 * (prevents flicker when coverImage and imageUrl are identical).
 *
 * @param {object} book - Book object
 * @returns {string[]} Ordered list of unique cover URL candidates
 */
export const getBookCoverCandidates = (book) => {
  if (!book) return [DEFAULT_BOOK_COVER];

  const candidates = [];

  // 1. imageUrl (reliable persisted cover source)
  if (book.imageUrl) candidates.push(book.imageUrl);

  // 2. Uploaded cover image (legacy / alternate field)
  if (book.coverImage) candidates.push(book.coverImage);

  // 3. OpenLibrary ISBN cover
  if (book.isbn) {
    // Clean ISBN (digits + X only) for OpenLibrary lookup
    const cleanIsbn = String(book.isbn).replace(/[^\dXx]/g, '').toUpperCase();
    if (cleanIsbn) {
      candidates.push(`https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`);
    }
  }

  // 4. Default placeholder (always last)
  candidates.push(DEFAULT_BOOK_COVER);

  // De-duplicate while preserving order (first occurrence wins)
  const seen = new Set();
  return candidates.filter((c) => {
    if (seen.has(c)) return false;
    seen.add(c);
    return true;
  });
};

/**
 * Get the primary cover URL for a book.
 * @param {object} book - Book object
 * @returns {string} Best available cover URL
 */
export const getBookCover = (book) => {
  const candidates = getBookCoverCandidates(book);
  return candidates[0] || DEFAULT_BOOK_COVER;
};
