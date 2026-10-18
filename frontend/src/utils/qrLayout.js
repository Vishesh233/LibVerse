/**
 * One QR layout for every place a desk QR is drawn: the on-screen SVG (components/QrCode), the card
 * PNG (canvas), the label sheets and the Node decode tests. Plain JS: no React, no DOM.
 *
 * Coordinates are in modules; the quiet zone is included, so the full code is `size` x `size`.
 * With `logo`, a square hole in the centre is left white (about 6% of the code; level H recovers
 * 30%) and the LibVerse book mark is drawn in it.
 */
import qrcode from 'qrcode-generator';
import { QR_LEVEL } from './qrConfig.js';

export const QR_QUIET = 2;

// The LogoMark open-book icon (24 x 24 viewBox), stroked
export const LOGO_BOOK_PATHS = ['M2 4.5h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z', 'M22 4.5h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z'];
export const LOGO_COLORS = { tile: '#0B1226', ring: '#22D3EE', icon: '#22D3EE' };

/**
 * @param {string} text
 * @param {{ level?: 'L'|'M'|'Q'|'H', logo?: boolean, quiet?: number }} [options]
 * @returns {{ count: number, size: number, quiet: number, dark: (r: number, c: number) => boolean,
 *   path: string, logo: null | { x: number, y: number, size: number, tile: { x, y, size, radius }, icon: { x, y, scale } } }}
 */
export const qrLayout = (text, { level = QR_LEVEL, logo = false, quiet = QR_QUIET } = {}) => {
  const qr = qrcode(0, level);
  qr.addData(String(text), 'Byte');
  qr.make();
  const count = qr.getModuleCount();

  // Centre hole: an odd/even number of modules matching the code so it sits exactly in the middle
  let hole = null;
  if (logo) {
    let n = Math.round(count * 0.22);
    if ((count - n) % 2) n += 1;
    const start = (count - n) / 2;
    hole = { start, end: start + n, n };
  }
  const inHole = (r, c) => hole && r >= hole.start && r < hole.end && c >= hole.start && c < hole.end;
  const dark = (r, c) => r >= 0 && c >= 0 && r < count && c < count && !inHole(r, c) && qr.isDark(r, c);

  // One subpath per horizontal run of dark modules
  let path = '';
  for (let r = 0; r < count; r += 1) {
    let c = 0;
    while (c < count) {
      if (!dark(r, c)) { c += 1; continue; }
      const from = c;
      while (c < count && dark(r, c)) c += 1;
      path += `M${from + quiet} ${r + quiet}h${c - from}v1h${from - c}z`;
    }
  }

  let logoBox = null;
  if (hole) {
    const x = hole.start + quiet;
    const pad = 0.7; // white margin between the modules and the tile
    const tileSize = hole.n - pad * 2;
    const iconSize = tileSize * 0.64;
    logoBox = {
      x,
      y: x,
      size: hole.n,
      tile: { x: x + pad, y: x + pad, size: tileSize, radius: tileSize * 0.26 },
      icon: { x: x + pad + (tileSize - iconSize) / 2, y: x + pad + (tileSize - iconSize) / 2, scale: iconSize / 24 },
    };
  }

  return { count, size: count + quiet * 2, quiet, dark, path, logo: logoBox };
};

/** The layout as a standalone SVG document (Node tests, rasterised exactly like the UI's SVG) */
export const qrSvgMarkup = (layout, { pixelSize = layout.size * 10, fg = '#000000', bg = '#FFFFFF' } = {}) => {
  const { size, path, logo } = layout;
  let logoMarkup = '';
  if (logo) {
    const { tile, icon } = logo;
    logoMarkup = `<rect x="${tile.x}" y="${tile.y}" width="${tile.size}" height="${tile.size}" rx="${tile.radius}" fill="${LOGO_COLORS.tile}"/>`
      + `<g transform="translate(${icon.x} ${icon.y}) scale(${icon.scale})" fill="none" stroke="${LOGO_COLORS.icon}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">`
      + LOGO_BOOK_PATHS.map((d) => `<path d="${d}"/>`).join('')
      + '</g>';
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelSize}" height="${pixelSize}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`
    + `<rect width="${size}" height="${size}" fill="${bg}"/><path d="${path}" fill="${fg}"/>${logoMarkup}</svg>`;
};

/**
 * Draw the layout on a 2D canvas at (x, y), `px` pixels wide (browser only: uses Path2D).
 * Modules are snapped to whole pixels where possible so the PNG stays crisp.
 */
export const drawQr = (ctx, layout, x, y, px, { fg = '#000000', bg = '#FFFFFF', background = true } = {}) => {
  const scale = px / layout.size;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (background) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, layout.size, layout.size);
  }
  ctx.fillStyle = fg;
  ctx.fill(new Path2D(layout.path));
  if (layout.logo) {
    const { tile, icon } = layout.logo;
    ctx.beginPath();
    ctx.roundRect(tile.x, tile.y, tile.size, tile.size, tile.radius);
    ctx.fillStyle = LOGO_COLORS.tile;
    ctx.fill();
    ctx.translate(icon.x, icon.y);
    ctx.scale(icon.scale, icon.scale);
    ctx.strokeStyle = LOGO_COLORS.icon;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    LOGO_BOOK_PATHS.forEach((d) => ctx.stroke(new Path2D(d)));
  }
  ctx.restore();
};
