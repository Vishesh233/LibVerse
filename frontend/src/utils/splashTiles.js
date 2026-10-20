import librarian1 from '../assets/splash/librarian@1x.webp';
import librarian2 from '../assets/splash/librarian@2x.webp';
import student1 from '../assets/splash/student@1x.webp';
import student2 from '../assets/splash/student@2x.webp';
import book1 from '../assets/splash/book@1x.webp';
import book2 from '../assets/splash/book@2x.webp';
import admin1 from '../assets/splash/admin@1x.webp';
import admin2 from '../assets/splash/admin@2x.webp';
import phone1 from '../assets/splash/phone@1x.webp';
import phone2 from '../assets/splash/phone@2x.webp';

/**
 * The app screens in the hero splash, back to front. They are bundled with the app (no API calls), so
 * the splash looks the same while the free API sleeps. Rebuild with scripts/buildSplashTiles.mjs.
 *
 * Each tile has a 1x and a 2x file. The <picture> in SplashScreen gives phones (<= 640px) the 1x file
 * and every other screen a 1x/2x srcset, so a desktop at devicePixelRatio >= 1.5 loads the 2x file.
 */
export const SPLASH_TILES = [
  { key: 'librarian', x1: librarian1, x2: librarian2 },
  { key: 'student', x1: student1, x2: student2 },
  { key: 'book', x1: book1, x2: book2 },
  { key: 'admin', x1: admin1, x2: admin2 },
  { key: 'phone', x1: phone1, x2: phone2 },
];

export const PHONE_QUERY = '(max-width: 640px)';
export const tileSrcSet = (t) => `${t.x1} 1x, ${t.x2} 2x`;

// The tiles seen first and largest are fetched first
const PRELOAD_ORDER = ['student', 'librarian', 'book', 'admin', 'phone'];

const decoded = new Set();
let started = false;

/**
 * Start fetching and decoding the tiles as early as possible (called when the app module loads). The
 * same choice as the <picture> is made (1x on phones, else the 1x/2x srcset), so the browser fetches
 * exactly the file the splash shows.
 */
export const preloadSplashTiles = () => {
  if (started || typeof Image === 'undefined') return;
  started = true;
  const phone = window.matchMedia?.(PHONE_QUERY).matches;
  PRELOAD_ORDER.map((key) => SPLASH_TILES.find((t) => t.key === key)).forEach((t, i) => {
    const img = new Image();
    img.fetchPriority = i < 2 ? 'high' : 'auto';
    if (!phone) img.srcset = tileSrcSet(t);
    img.src = t.x1;
    img.decode().then(() => decoded.add(t.key)).catch(() => { /* never shown */ });
  });
};

/** Keys of the tiles that are decoded right now */
export const readySplashTiles = () => new Set(decoded);
