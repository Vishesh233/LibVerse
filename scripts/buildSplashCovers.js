/**
 * Build frontend/src/data/splashCovers.json: the 24 covers the splash screen shows when the API is
 * asleep and the browser has no cached covers yet. Cover URLs only (Open Library -M size): no
 * titles, ids, emails or anything else from the database.
 *
 * Picks the top-rated books whose Open Library cover really exists (a missing cover is a 1x1 image),
 * one per title, from either source:
 *   node scripts/buildSplashCovers.js                          the catalogue export
 *                                                              (backend/scripts/data/catalogue-export.json,
 *                                                              made by `npm run catalogue:export` in backend/)
 *   node scripts/buildSplashCovers.js --file path/to/export.json
 *   node scripts/buildSplashCovers.js --api https://host/api   a running API (GET /books, active books only)
 *   node scripts/buildSplashCovers.js --check                  only verify the committed list still loads
 *
 * Needs Node 20+ and internet access (it downloads each candidate cover to check it).
 */
const fs = require('fs');
const path = require('path');

const COUNT = 24;
const OUT = path.join(__dirname, '..', 'frontend', 'src', 'data', 'splashCovers.json');
const DEFAULT_EXPORT = path.join(__dirname, '..', 'backend', 'scripts', 'data', 'catalogue-export.json');
const OPEN_LIBRARY_COVER = /^https:\/\/covers\.openlibrary\.org\/b\/(isbn|id|olid)\/([^/?#]+?)-[SML]\.jpg(?:[?#].*)?$/i;
const MIN_BYTES = 2000; // Open Library answers a missing cover with a ~43 byte 1x1 gif

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

/** The -M URL of an Open Library cover URL, or '' for anything else */
const mediumUrl = (url) => {
  const m = typeof url === 'string' ? url.trim().match(OPEN_LIBRARY_COVER) : null;
  return m ? `https://covers.openlibrary.org/b/${m[1].toLowerCase()}/${m[2]}-M.jpg` : '';
};

/** true when the URL returns a real JPEG (not the 1x1 placeholder) */
const coverExists = async (url) => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok || !(res.headers.get('content-type') || '').startsWith('image/')) return false;
    return (await res.arrayBuffer()).byteLength >= MIN_BYTES;
  } catch (error) {
    return false;
  }
};

const loadBooks = async () => {
  const api = arg('--api');
  if (api) {
    const res = await fetch(`${api.replace(/\/+$/, '')}/books?sort=rating&limit=100`, { signal: AbortSignal.timeout(90000) });
    if (!res.ok) throw new Error(`The API answered ${res.status}`);
    return (await res.json()).books || [];
  }
  const file = arg('--file') || DEFAULT_EXPORT;
  if (!fs.existsSync(file)) throw new Error(`No catalogue export at ${file}: run "npm run catalogue:export" in backend/ or pass --api`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return Array.isArray(data) ? data : data.books || [];
};

const main = async () => {
  if (process.argv.includes('--check')) {
    const urls = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    const bad = [];
    for (const url of urls) if (!(await coverExists(url))) bad.push(url);
    console.log(`${urls.length - bad.length}/${urls.length} covers load${bad.length ? `; broken: ${bad.join(' ')}` : ''}`);
    process.exit(bad.length || urls.length !== COUNT ? 1 : 0);
  }

  const books = await loadBooks();
  const seenTitles = new Set();
  const seenUrls = new Set();
  const candidates = books
    .filter((b) => b && b.isActive !== false)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || String(a.title).localeCompare(String(b.title)))
    .map((b) => ({ title: String(b.title || '').toLowerCase(), url: mediumUrl(b.imageUrl) || mediumUrl(b.coverImage) }))
    .filter((c) => c.url && !seenTitles.has(c.title) && !seenUrls.has(c.url) && seenTitles.add(c.title) && seenUrls.add(c.url));

  const picked = [];
  for (const c of candidates) {
    if (picked.length === COUNT) break;
    if (await coverExists(c.url)) picked.push(c.url);
  }
  if (picked.length < COUNT) throw new Error(`Only ${picked.length} of ${COUNT} covers found (${candidates.length} candidates)`);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(picked, null, 2)}\n`);
  console.log(`Wrote ${picked.length} cover URLs to ${path.relative(process.cwd(), OUT)}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
