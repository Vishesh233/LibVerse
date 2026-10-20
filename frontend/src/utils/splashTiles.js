import librarian from '../assets/splash/librarian.webp';
import student from '../assets/splash/student.webp';
import book from '../assets/splash/book.webp';
import admin from '../assets/splash/admin.webp';
import phone from '../assets/splash/phone.webp';

/**
 * The app screens in the hero splash, back to front. They are bundled with the app (no API calls), so
 * the splash looks the same while the free API sleeps. Rebuild with scripts/buildSplashTiles.mjs.
 */
export const SPLASH_TILES = [
  { key: 'librarian', src: librarian },
  { key: 'student', src: student },
  { key: 'book', src: book },
  { key: 'admin', src: admin },
  { key: 'phone', src: phone },
];

const decoded = new Set();
let started = false;

/** Start fetching and decoding the tiles as early as possible (called when the app module loads) */
export const preloadSplashTiles = () => {
  if (started || typeof Image === 'undefined') return;
  started = true;
  SPLASH_TILES.forEach(({ key, src }) => {
    const img = new Image();
    img.src = src;
    img.decode().then(() => decoded.add(key)).catch(() => { /* never shown */ });
  });
};

/** Keys of the tiles that are decoded right now */
export const readySplashTiles = () => new Set(decoded);
