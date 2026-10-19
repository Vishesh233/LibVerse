/**
 * Verify catalogue candidates against Open Library (network only, no database access).
 *
 * For each [title, author] in scripts/data/catalogue-candidates.json:
 *   1. search.json by title + author -> accept only if the title and an author surname match
 *   2. the work's editions -> printed (not audio, e-book or large print), English or unspecified language,
 *      with an ISBN, a cover, a real publisher and a year; complete records first, then the newest
 *   3. /isbn/<ISBN>.json -> the edition record must belong to the same work
 *   4. covers.openlibrary.org/b/isbn/<ISBN>-L.jpg?default=false must return an image;
 *      otherwise the next edition is tried, and with no cover the book is dropped
 * Ratings come from the work's Open Library ratings average, only when it has at least 5 ratings.
 *
 * Usage: node scripts/verifyCatalogueCandidates.js <existing-books.json> <out.json>
 *   existing-books.json: [{ title, author, isbn }] snapshot of the current catalogue (for de-duplication)
 *   out.json: one result per candidate; re-running resumes and skips candidates already in it.
 *
 * Pacing: at most 1 request per second overall, and cover-by-ISBN lookups at least 3.1 s apart
 * (Open Library limits those to 100 per 5 minutes per IP).
 */
const fs = require('fs');
const path = require('path');

const USER_AGENT = 'LibVerse-catalogue-builder/1.0 (student library management project; low-rate metadata verification)';
const CANDIDATES = path.join(__dirname, 'data', 'catalogue-candidates.json');
const MIN_RATINGS = 5;
const [existingPath, outPath] = process.argv.slice(2);
if (!existingPath || !outPath) {
  console.error('Usage: node scripts/verifyCatalogueCandidates.js <existing-books.json> <out.json>');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastRequestAt = 0;
let lastCoverAt = 0;

const throttledFetch = async (url, { cover = false } = {}) => {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const now = Date.now();
    const wait = Math.max(0, lastRequestAt + 1000 - now, cover ? lastCoverAt + 3100 - now : 0);
    if (wait) await sleep(wait);
    lastRequestAt = Date.now();
    if (cover) lastCoverAt = lastRequestAt;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: cover ? 'image/*' : 'application/json' }, redirect: 'follow' });
      if (res.status === 429 || res.status >= 500) {
        await res.arrayBuffer().catch(() => {});
        await sleep(5000 * attempt);
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === 4) throw err;
      await sleep(3000 * attempt);
    }
  }
  throw new Error(`gave up after retries: ${url}`);
};

const getJson = async (url) => {
  const res = await throttledFetch(url);
  if (!res.ok) {
    await res.arrayBuffer().catch(() => {});
    return null;
  }
  return res.json();
};

// ---------- normalisation ----------
const stripAccents = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const normText = (s) => stripAccents(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
// Leading or library-style trailing article ("Year of Magical Thinking, The") is ignored
const normTitle = (s) => normText(String(s || '').replace(/,\s*(the|a|an)\s*$/i, '')).replace(/^(the|a|an) /, '');
const mainTitle = (s) => normTitle(String(s || '').split(/[:(]/)[0]);
const surname = (author) => {
  const tokens = normText(author).split(' ').filter(Boolean);
  return tokens[tokens.length - 1] || '';
};
const normIsbn = (v) => String(v || '').replace(/[^0-9Xx]/g, '').toUpperCase();

const isbn10to13 = (isbn10) => {
  const core = `978${isbn10.slice(0, 9)}`;
  const sum = core.split('').reduce((acc, d, i) => acc + Number(d) * (i % 2 ? 3 : 1), 0);
  return core + ((10 - (sum % 10)) % 10);
};
const validIsbn13 = (s) => {
  if (!/^97[89]\d{10}$/.test(s)) return false;
  const sum = s.slice(0, 12).split('').reduce((acc, d, i) => acc + Number(d) * (i % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === Number(s[12]);
};

const titleMatches = (wanted, found) => {
  const a = normTitle(wanted);
  const b = normTitle(found);
  return a === b || mainTitle(wanted) === b || a === mainTitle(found) || mainTitle(wanted) === mainTitle(found);
};
const authorMatch = (wanted, names = []) => {
  const want = surname(wanted);
  return names.find((n) => normText(n).split(' ').includes(want)) || null;
};

const LANGUAGES = { eng: 'English', hin: 'Hindi', fre: 'French', ger: 'German', spa: 'Spanish' };

// ---------- edition helpers ----------
const editionIsbns = (ed) => {
  const list = [];
  (ed.isbn_13 || []).forEach((i) => list.push(normIsbn(i)));
  (ed.isbn_10 || []).forEach((i) => {
    const n = normIsbn(i);
    if (/^\d{9}[\dX]$/.test(n)) list.push(isbn10to13(n));
  });
  return [...new Set(list.filter(validIsbn13))];
};
const editionYear = (ed) => {
  const m = String(ed.publish_date || '').match(/\b(1[5-9]\d\d|20\d\d)\b/);
  return m ? Number(m[1]) : undefined;
};
const editionPages = (ed) => {
  if (Number.isInteger(ed.number_of_pages) && ed.number_of_pages > 0) return ed.number_of_pages;
  const nums = String(ed.pagination || '').match(/\d+/g);
  if (nums) {
    const n = Math.max(...nums.map(Number));
    if (n > 10 && n < 5000) return n;
  }
  return undefined;
};
const editionLangs = (ed) => (ed.languages || []).map((l) => String(l.key || '').split('/').pop());
// Printed books only: skip audiobooks, e-books and other non-print formats
const NON_PRINT = /audio|cassette|cd|compact disc|mp3|kindle|e-?book|electronic|digital|microform|braille|calendar/i;
// Spin-offs that share the work record but are not the book itself
const NOT_THE_BOOK = /calendar|journal|workbook|study guide|summary|summaries|cliffs ?notes|planner|colouring|coloring|box(ed)? set|braille|the play|screenplay|for kids|for children|young readers|young adult|adapted for|adaptation/i;
const isPrint = (ed) =>
  !NON_PRINT.test(String(ed.physical_format || '')) &&
  !(ed.publishers || []).some((p) => /audio/i.test(p)) &&
  !NOT_THE_BOOK.test(`${ed.subtitle || ''} ${ed.edition_name || ''} ${ed.physical_format || ''}`);
// Standard print only: skip large-print reissues and malformed publishers like "[s.n.]" or "L. Cunningham]"
const LARGE_PRINT = /large print|large type|thorndike|wheeler publishing|center point|g\.?\s?k\.? hall/i;
const goodPublisher = (ed) => {
  const pub = (ed.publishers || [])[0];
  return !!pub && !/[[\]]/.test(pub) && !LARGE_PRINT.test(`${(ed.publishers || []).join(' ')} ${ed.physical_format || ''} ${ed.edition_name || ''} ${ed.subtitle || ''}`);
};

const coverOk = async (isbn) => {
  const res = await throttledFetch(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`, { cover: true });
  const type = res.headers.get('content-type') || '';
  const buf = Buffer.from(await res.arrayBuffer());
  return res.status === 200 && type.startsWith('image/') && buf.length > 2000;
};

// ---------- main ----------
(async () => {
  const candidates = JSON.parse(fs.readFileSync(CANDIDATES, 'utf8'));
  const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  const existingIsbns = new Set(existing.map((b) => normIsbn(b.isbn)).filter(Boolean));
  const existingKeys = new Set(existing.map((b) => `${mainTitle(b.title)}|${surname(b.author)}`));

  const results = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : [];
  const done = new Set(results.map((r) => `${r.genre}|${r.candidate.title}`));
  const takenIsbns = new Set(results.filter((r) => r.status === 'ok').map((r) => r.book.isbn));
  const takenWorks = new Set(results.filter((r) => r.status === 'ok').map((r) => r.book.openLibraryWorkId));
  const save = () => fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  const total = Object.values(candidates).reduce((n, l) => n + l.length, 0);
  let index = 0;

  for (const [genre, list] of Object.entries(candidates)) {
    for (const [title, author] of list) {
      index++;
      if (done.has(`${genre}|${title}`)) continue;
      const result = { genre, candidate: { title, author }, status: 'dropped' };
      const finish = (reason) => {
        if (reason) result.reason = reason;
        results.push(result);
        save();
        console.log(`[${index}/${total}] ${genre} | ${title} -> ${result.status === 'ok' ? `OK ${result.book.isbn}` : `DROPPED: ${result.reason}`}`);
      };

      if (existingKeys.has(`${mainTitle(title)}|${surname(author)}`)) { finish('already in catalogue (title + author)'); continue; }

      try {
        // 1. Search the work
        const fields = 'key,title,author_name,first_publish_year,ratings_average,ratings_count,cover_edition_key,edition_count,number_of_pages_median';
        const q = (t) => `https://openlibrary.org/search.json?title=${encodeURIComponent(t)}&author=${encodeURIComponent(author)}&fields=${fields}&limit=10`;
        let search = await getJson(q(title));
        if ((!search || !search.docs?.length) && title.includes(':')) search = await getJson(q(title.split(':')[0].trim()));
        const docs = (search?.docs || []).filter((d) => titleMatches(title, d.title) && authorMatch(author, d.author_name));
        if (!docs.length) { finish('no Open Library work with matching title and author'); continue; }
        const doc = docs.sort((a, b) => (b.edition_count || 0) - (a.edition_count || 0))[0];
        const workId = doc.key.replace('/works/', '');
        if (takenWorks.has(workId)) { finish(`duplicate of another candidate (work ${workId})`); continue; }

        // 2. Editions: printed, English (or unspecified), ISBN + cover + real publisher + year.
        //    Complete records first (pages known, English stated), then the newest edition.
        const eds = await getJson(`https://openlibrary.org${doc.key}/editions.json?limit=100`);
        const editions = (eds?.entries || [])
          .map((ed) => ({ ed, isbns: editionIsbns(ed), langs: editionLangs(ed) }))
          .filter(({ ed, isbns, langs }) =>
            isbns.length && (ed.covers || []).some((c) => c > 0) && (!langs.length || langs.includes('eng')) &&
            isPrint(ed) && goodPublisher(ed) && editionYear(ed) && titleMatches(title, ed.title))
          .sort((x, y) => {
            const score = ({ ed, langs }) => (editionPages(ed) ? 4 : 0) + (langs.includes('eng') ? 2 : 0);
            return score(y) - score(x) || (editionYear(y.ed) || 0) - (editionYear(x.ed) || 0);
          });
        if (!editions.length) { finish('no printed English edition with an ISBN, cover, publisher and year'); continue; }
        // Editions with no language recorded are only a fallback: they can be translations
        const english = editions.filter(({ langs }) => langs.includes('eng'));
        if (english.length) editions.splice(0, editions.length, ...english);

        // 3 + 4. Confirm the ISBN record and the cover image, trying up to 4 editions
        let chosen = null;
        let lastReason = 'no edition passed the ISBN record and cover checks';
        for (const { ed, isbns } of editions.slice(0, 4)) {
          const isbn = isbns[0];
          if (existingIsbns.has(isbn)) { lastReason = `ISBN ${isbn} already in catalogue`; chosen = null; break; }
          if (takenIsbns.has(isbn)) { lastReason = `ISBN ${isbn} already used by another candidate`; continue; }
          const record = await getJson(`https://openlibrary.org/isbn/${isbn}.json`);
          if (!record || !(record.works || []).some((w) => w.key === doc.key)) { lastReason = `ISBN record ${isbn} not linked to work ${workId}`; continue; }
          if (!isPrint(record) || !goodPublisher({ ...ed, ...record })) { lastReason = `ISBN ${isbn} is not a standard printed edition`; continue; }
          if (!(await coverOk(isbn))) { lastReason = `no cover image for ISBN ${isbn}`; continue; }
          chosen = { ed: record.number_of_pages || record.publishers ? { ...ed, ...record } : ed, isbn };
          break;
        }
        if (!chosen) { finish(lastReason); continue; }

        const { ed, isbn } = chosen;
        const langs = editionLangs(ed);
        const ratingCount = Number(doc.ratings_count) || 0;
        const book = {
          title,
          // The curated name; it was verified above by surname against the work's authors
          author,
          genre,
          isbn,
          publicationYear: editionYear(ed),
          publisher: (ed.publishers || [])[0],
          pages: editionPages(ed) || (Number.isInteger(doc.number_of_pages_median) ? doc.number_of_pages_median : undefined),
          language: LANGUAGES[langs.find((l) => l === 'eng') || langs[0]] || 'English',
          // Only a meaningful average: at least MIN_RATINGS votes, otherwise the schema default applies
          ...(ratingCount >= MIN_RATINGS && doc.ratings_average ? { rating: Math.round(doc.ratings_average * 10) / 10 } : {}),
          coverImage: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
          imageUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
          openLibraryWorkId: workId,
          openLibraryEditionId: String(ed.key || '').replace('/books/', ''),
          editionFormat: [ed.physical_format, ed.edition_name, ed.subtitle].filter(Boolean).join(' | ') || undefined,
          openLibraryAuthors: doc.author_name.slice(0, 3),
          firstPublishYear: doc.first_publish_year,
          ratingsCount: ratingCount,
        };
        takenIsbns.add(isbn);
        takenWorks.add(workId);
        result.status = 'ok';
        result.book = book;
        finish();
      } catch (err) {
        finish(`error: ${err.message}`);
      }
    }
  }
  const ok = results.filter((r) => r.status === 'ok').length;
  console.log(`DONE: ${ok} verified, ${results.length - ok} dropped`);
})();
