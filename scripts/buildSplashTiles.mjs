/**
 * Build the screen images the hero splash shows (frontend/src/assets/splash/<name>@1x.webp and @2x.webp).
 *
 * Sources are the lossless 2x captures (1440x900 @2x = 2880x1800, phone 390x844 @2x) that
 * scripts/screenshots/capture.mjs and live.mjs keep in docs/.screenshots-png/ (demo data only); if that
 * local folder is missing the committed WebPs in docs/screenshots/ are used (a little softer).
 * Per tile: 1x ~1100 px wide, 2x ~2200 px wide (phone 390 / 780), Lanczos downscale, quality 90 lowered
 * only as far as needed to stay inside the budget (2x tile <= 220 KB, all files together <= 1.2 MB).
 *
 *   node scripts/buildSplashTiles.mjs
 */
import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharp = createRequire(path.join(ROOT, 'backend', 'package.json'))('sharp');
const OUT = path.join(ROOT, 'frontend', 'src', 'assets', 'splash');

// name, source screen, 1x width, 2x width
const TILES = [
  ['librarian', '03-librarian/01-dashboard', 1100, 2200],
  ['student', '02-student/01-dashboard', 1100, 2200],
  ['book', '02-student/03-book-details', 1100, 2200],
  ['admin', '04-admin/02-analytics', 1100, 2200],
  ['phone', '05-mobile/02-student-dashboard', 390, 780],
];
const MAX_2X_BYTES = 220 * 1024;
const MAX_TOTAL_BYTES = 1.2 * 1024 * 1024;
const START_QUALITY = 90;
const MIN_QUALITY = 78;

const sourceFor = (screen) => {
  const png = path.join(ROOT, 'docs', '.screenshots-png', `${screen}.png`);
  return existsSync(png) ? png : path.join(ROOT, 'docs', 'screenshots', `${screen}.webp`);
};

/**
 * The student dashboard comes from the demo site and carries its "demo account" banner above the main
 * column. The hero must not show it: slide the main column up over it (the sidebar stays whole) and fill
 * the freed strip at the bottom (the collage covers it) with the page background.
 */
const BANNER_PX = 77;
const SIDEBAR_PX = 511;
const withoutDemoBanner = async (file) => {
  const { width, height } = await sharp(file).metadata();
  const sidebar = await sharp(file).extract({ left: 0, top: 0, width: SIDEBAR_PX, height }).toBuffer();
  const main = await sharp(file).extract({ left: SIDEBAR_PX, top: BANNER_PX, width: width - SIDEBAR_PX, height: height - BANNER_PX }).toBuffer();
  return sharp({ create: { width, height, channels: 3, background: '#050816' } })
    .composite([{ input: sidebar, left: 0, top: 0 }, { input: main, left: SIDEBAR_PX, top: 0 }])
    .png().toBuffer();
};

const encode = async (input, width, quality, file) => {
  const info = await sharp(input)
    .resize({ width, kernel: 'lanczos3', withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(file);
  return info.size;
};

mkdirSync(OUT, { recursive: true });
let total = 0;
for (const [name, screen, w1, w2] of TILES) {
  const file = sourceFor(screen);
  const input = name === 'student' ? await withoutDemoBanner(file) : file;
  const sizes = {};
  for (const [suffix, width] of [['2x', w2], ['1x', w1]]) {
    const out = path.join(OUT, `${name}@${suffix}.webp`);
    let quality = START_QUALITY;
    let size = await encode(input, width, quality, out);
    while (suffix === '2x' && size > MAX_2X_BYTES && quality > MIN_QUALITY) {
      quality -= 2;
      size = await encode(input, width, quality, out);
    }
    sizes[suffix] = `${(size / 1024).toFixed(1)} KB (q${quality})`;
    total += size;
  }
  console.log(`${name.padEnd(10)} 1x ${w1}px ${sizes['1x']}   2x ${w2}px ${sizes['2x']}   <- ${path.relative(ROOT, file)}`);
}
console.log(`total ${(total / 1024).toFixed(0)} KB`);
if (total > MAX_TOTAL_BYTES) console.log('WARNING: over the 1.2 MB budget');
