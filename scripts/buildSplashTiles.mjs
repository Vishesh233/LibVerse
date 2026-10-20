/**
 * Build the screen images the hero splash shows (frontend/src/assets/splash/*.webp) from the
 * committed screenshots in docs/screenshots. About 900 px wide (the phone 360 px), each well under 80 KB,
 * so they are bundled with the app and the splash needs no network.
 *
 *   node scripts/buildSplashTiles.mjs
 */
import { mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharp = createRequire(path.join(ROOT, 'backend', 'package.json'))('sharp');
const OUT = path.join(ROOT, 'frontend', 'src', 'assets', 'splash');

const TILES = [
  ['librarian', '03-librarian/01-dashboard', 900],
  ['student', '02-student/01-dashboard', 900],
  ['book', '02-student/03-book-details', 900],
  ['admin', '04-admin/02-analytics', 900],
  ['phone', '05-mobile/02-student-dashboard', 360],
];
const MAX_BYTES = 80 * 1024;

/**
 * The student dashboard screenshot comes from the demo site and carries its "demo account" banner above
 * the main column. The hero must not show it: slide the main column up over it (the sidebar stays whole)
 * and fill the freed strip at the bottom (the collage covers it) with the page background.
 */
const BANNER_PX = 77;
const SIDEBAR_PX = 511;
const withoutDemoBanner = async (file) => {
  const img = sharp(file);
  const { width, height } = await img.metadata();
  const sidebar = await sharp(file).extract({ left: 0, top: 0, width: SIDEBAR_PX, height }).toBuffer();
  const main = await sharp(file).extract({ left: SIDEBAR_PX, top: BANNER_PX, width: width - SIDEBAR_PX, height: height - BANNER_PX }).toBuffer();
  return sharp({ create: { width, height, channels: 3, background: '#050816' } })
    .composite([{ input: sidebar, left: 0, top: 0 }, { input: main, left: SIDEBAR_PX, top: 0 }])
    .png().toBuffer();
};

mkdirSync(OUT, { recursive: true });
for (const [name, source, width] of TILES) {
  let quality = 78;
  let file;
  do {
    file = path.join(OUT, `${name}.webp`);
    const input = path.join(ROOT, 'docs', 'screenshots', `${source}.webp`);
    await sharp(name === 'student' ? await withoutDemoBanner(input) : input).resize({ width }).webp({ quality, effort: 6 }).toFile(file);
    quality -= 6;
  } while (statSync(file).size > MAX_BYTES && quality > 30);
  console.log(`${name}.webp  ${width}px  ${(statSync(file).size / 1024).toFixed(1)} KB`);
}
