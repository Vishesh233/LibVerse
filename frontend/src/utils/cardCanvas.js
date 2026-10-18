/**
 * Library card PNGs at 300 DPI (1011 x 638 px per side), drawn on a canvas from the same artwork
 * as the on-screen card (utils/cardArt) and the same QR layout (utils/qrLayout).
 */
import { BACK, CARD_COLORS, FRONT, HOLO_STOPS, PNG_DPI, PNG_SIZE, ROLE_LABEL, SPINES, initialsOf, memberSince, rulesOf } from './cardArt';
import { LOGO_BOOK_PATHS, drawQr, qrLayout } from './qrLayout';

const DISPLAY = '"Space Grotesk", Inter, "Segoe UI", system-ui, sans-serif';
const SANS = 'Inter, "Segoe UI", system-ui, sans-serif';
const MONO = 'ui-monospace, "Cascadia Mono", Consolas, "Courier New", monospace';

const loadImage = (src) => new Promise((resolve) => {
  if (!src) return resolve(null);
  const img = new Image();
  img.crossOrigin = 'anonymous'; // a photo from another site without CORS is skipped (initials instead)
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = src;
});

const ensureFonts = async () => {
  if (!document.fonts?.load) return;
  await Promise.all([
    document.fonts.load(`700 40px ${DISPLAY}`),
    document.fonts.load(`600 40px ${DISPLAY}`),
    document.fonts.load(`500 40px ${SANS}`),
    document.fonts.load(`600 40px ${SANS}`),
  ]).catch(() => {});
};

const background = (ctx, W, H, u, { holo }) => {
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, CARD_COLORS.bg[0]);
  bg.addColorStop(0.55, CARD_COLORS.bg[1]);
  bg.addColorStop(1, CARD_COLORS.bg[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = (x, y, r, color) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  glow(12 * u, 6 * u, 58 * u, CARD_COLORS.glowCyan);
  glow(96 * u, 60 * u, 55 * u, CARD_COLORS.glowViolet);
  // Hairlines and book spines
  ctx.fillStyle = 'rgba(255,255,255,0.022)';
  for (let x = 1.5; x < 100; x += 3) ctx.fillRect(x * u, 0, 0.1 * u, H);
  SPINES.forEach(([x, w, h, a]) => {
    ctx.fillStyle = `rgba(255,255,255,${a})`;
    ctx.beginPath();
    ctx.roundRect(x * u, H - FRONT.accentH * u - h * u, w * u, h * u + 1, [0.4 * u, 0.4 * u, 0, 0]);
    ctx.fill();
  });
  if (holo) {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    HOLO_STOPS.forEach((c, i) => g.addColorStop(i / (HOLO_STOPS.length - 1), c));
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = g;
    ctx.fillRect(0, holo.y * u, W, holo.h * u);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = CARD_COLORS.accent;
  ctx.fillRect(0, H - FRONT.accentH * u, W, FRONT.accentH * u);
};

const logoTile = (ctx, u, { x, y, size, radius, icon }) => {
  ctx.beginPath();
  ctx.roundRect(x * u, y * u, size * u, size * u, radius * u);
  const g = ctx.createLinearGradient(0, y * u, 0, (y + size) * u);
  g.addColorStop(0, 'rgb(38,42,56)');
  g.addColorStop(1, 'rgb(18,20,30)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = Math.max(1, 0.15 * u);
  ctx.stroke();
  ctx.save();
  const s = (icon * u) / 24;
  ctx.translate((x + (size - icon) / 2) * u, (y + (size - icon) / 2) * u);
  ctx.scale(s, s);
  ctx.strokeStyle = CARD_COLORS.accent;
  ctx.lineWidth = 1.9;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  LOGO_BOOK_PATHS.forEach((d) => ctx.stroke(new Path2D(d)));
  ctx.restore();
};

const wordmark = (ctx, u, x, y, size) => {
  ctx.font = `700 ${size * u}px ${DISPLAY}`;
  ctx.fillStyle = CARD_COLORS.text;
  ctx.fillText('Lib', x * u, y * u);
  ctx.fillStyle = CARD_COLORS.verse;
  ctx.fillText('Verse', x * u + ctx.measureText('Lib').width, y * u);
};

const label = (ctx, u, text, { x, y, size }) => {
  ctx.font = `600 ${size * u}px ${SANS}`;
  ctx.fillStyle = CARD_COLORS.label;
  ctx.letterSpacing = `${0.14 * size * u}px`;
  ctx.fillText(text.toUpperCase(), x * u, y * u);
  ctx.letterSpacing = '0px';
};

const qrTile = (ctx, u, code, { x, y, size, radius, pad }, logo) => {
  ctx.beginPath();
  ctx.roundRect(x * u, y * u, size * u, size * u, radius * u);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  const px = Math.floor((size - pad * 2) * u);
  const offset = (size * u - px) / 2;
  drawQr(ctx, qrLayout(code, { logo }), Math.round(x * u + offset), Math.round(y * u + offset), px, { background: false });
};

const fitText = (ctx, text, maxPx, weight, sizePx, family) => {
  let s = sizePx;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxPx && s > sizePx * 0.6) {
    s -= 1;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  if (ctx.measureText(text).width <= maxPx) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxPx) cut = cut.slice(0, -1);
  return `${cut}…`;
};

const drawFront = (ctx, W, H, u, card, avatar) => {
  background(ctx, W, H, u, { holo: FRONT.holo });
  logoTile(ctx, u, FRONT.logo);
  wordmark(ctx, u, FRONT.word.x, FRONT.word.y, FRONT.word.size);
  label(ctx, u, 'Library card', FRONT.sub);

  // Avatar with a soft ring
  const { x, y, d, ring } = FRONT.avatar;
  const cx = (x + d / 2) * u;
  const cy = (y + d / 2) * u;
  const r = (d / 2) * u;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + ring * u * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(34,211,238,0.14)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r + ring * u * 0.5, 0, Math.PI * 2);
  const ringG = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ringG.addColorStop(0, '#22D3EE');
  ringG.addColorStop(1, '#A78BFA');
  ctx.strokeStyle = ringG;
  ctx.lineWidth = ring * u;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (avatar) {
    const s = Math.max((2 * r) / avatar.width, (2 * r) / avatar.height);
    ctx.drawImage(avatar, cx - (avatar.width * s) / 2, cy - (avatar.height * s) / 2, avatar.width * s, avatar.height * s);
  } else {
    const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    g.addColorStop(0, '#6366F1');
    g.addColorStop(1, '#8B5CF6');
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `700 ${d * 0.38 * u}px ${DISPLAY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initialsOf(card.name), cx, cy + 0.2 * u);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'top';
  }
  ctx.restore();

  // Name and role badge
  ctx.fillStyle = CARD_COLORS.text;
  const name = fitText(ctx, card.name, FRONT.name.maxW * u, 700, FRONT.name.size * u, DISPLAY);
  ctx.fillText(name, FRONT.name.x * u, FRONT.name.y * u);
  const role = (ROLE_LABEL[card.role] || card.role || '').toUpperCase();
  ctx.font = `700 ${FRONT.role.size * u}px ${SANS}`;
  ctx.letterSpacing = `${0.12 * FRONT.role.size * u}px`;
  const rw = ctx.measureText(role).width + FRONT.role.padX * 2 * u;
  ctx.beginPath();
  ctx.roundRect(FRONT.role.x * u, FRONT.role.y * u, rw, FRONT.role.h * u, (FRONT.role.h / 2) * u);
  ctx.fillStyle = 'rgba(34,211,238,0.14)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(103,232,249,0.45)';
  ctx.lineWidth = Math.max(1, 0.15 * u);
  ctx.stroke();
  ctx.fillStyle = CARD_COLORS.role;
  ctx.fillText(role, (FRONT.role.x + FRONT.role.padX) * u, (FRONT.role.y + (FRONT.role.h - FRONT.role.size) / 2 + 0.1) * u);
  ctx.letterSpacing = '0px';

  label(ctx, u, 'Library ID', FRONT.idLabel);
  ctx.fillStyle = CARD_COLORS.text;
  ctx.font = `700 ${FRONT.id.size * u}px ${MONO}`;
  ctx.fillText(card.libraryId, FRONT.id.x * u, FRONT.id.y * u);
  label(ctx, u, 'Member since', FRONT.sinceLabel);
  ctx.fillStyle = '#E2E8F0';
  ctx.font = `600 ${FRONT.since.size * u}px ${SANS}`;
  ctx.fillText(memberSince(card.memberSince), FRONT.since.x * u, FRONT.since.y * u);

  qrTile(ctx, u, card.code, FRONT.qr, true);
  ctx.fillStyle = CARD_COLORS.muted;
  ctx.font = `500 ${FRONT.caption.size * u}px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('Show at the library desk', (FRONT.qr.x + FRONT.qr.size / 2) * u, FRONT.caption.y * u);
  ctx.textAlign = 'start';
};

const wrapLines = (ctx, text, maxPx) => {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach((w) => {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxPx && line) {
      lines.push(line);
      line = w;
    } else line = next;
  });
  if (line) lines.push(line);
  return lines;
};

const drawBack = (ctx, W, H, u, card) => {
  background(ctx, W, H, u, { holo: null });
  ctx.fillStyle = CARD_COLORS.stripe;
  ctx.fillRect(0, BACK.stripe.y * u, W, BACK.stripe.h * u);

  ctx.fillStyle = CARD_COLORS.text;
  ctx.font = `700 ${BACK.title.size * u}px ${DISPLAY}`;
  ctx.fillText('Library rules', BACK.title.x * u, BACK.title.y * u);
  ctx.font = `500 ${BACK.rules.size * u}px ${SANS}`;
  rulesOf(card.rules).forEach((rule, i) => {
    const y = BACK.rules.y + i * BACK.rules.step;
    ctx.fillStyle = CARD_COLORS.accent;
    ctx.beginPath();
    ctx.arc((BACK.rules.x + BACK.rules.dot / 2) * u, (y + BACK.rules.size * 0.52) * u, (BACK.rules.dot / 2) * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(rule, (BACK.rules.x + BACK.rules.dot + 1.4) * u, y * u);
  });

  ctx.font = `600 ${BACK.found.size * u}px ${SANS}`;
  ctx.fillStyle = CARD_COLORS.text;
  wrapLines(ctx, 'If found, please return to the library desk.', BACK.found.maxW * u).forEach((line, i) => {
    ctx.fillText(line, BACK.found.x * u, (BACK.found.y + i * BACK.found.size * 1.3) * u);
  });

  const b = BACK.brand;
  logoTile(ctx, u, { x: b.x, y: b.y, size: b.tile, radius: b.radius, icon: b.icon });
  wordmark(ctx, u, b.wordX, b.y + (b.tile - b.wordSize) / 2, b.wordSize);
  ctx.fillStyle = CARD_COLORS.muted;
  ctx.font = `500 ${BACK.version.size * u}px ${SANS}`;
  ctx.fillText(`Card version ${card.cardVersion} · ${card.libraryId}`, BACK.version.x * u, BACK.version.y * u);

  ctx.fillStyle = CARD_COLORS.muted;
  ctx.font = `600 ${BACK.qrLabel.size * u}px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('SCAN AT THE DESK', (BACK.qr.x + BACK.qr.size / 2) * u, BACK.qrLabel.y * u);
  ctx.textAlign = 'start';
  qrTile(ctx, u, card.code, BACK.qr, false);
};

/** Draw one side; returns the canvas */
export const renderCardSide = async (card, side) => {
  await ensureFonts();
  const { width: W, height: H } = PNG_SIZE;
  const u = W / 100;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  // Rounded corners (3.18 mm, as on a real card); outside is transparent
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, (3.18 / 85.6) * 100 * u);
  ctx.clip();
  if (side === 'back') drawBack(ctx, W, H, u, card);
  else drawFront(ctx, W, H, u, card, await loadImage(card.profileImage));
  return canvas;
};

// PNG pHYs chunk: 300 DPI = 11811 pixels per metre, so print dialogs use the real card size
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (bytes) => {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const withDpi = async (blob, dpi) => {
  const src = new Uint8Array(await blob.arrayBuffer());
  const ppm = Math.round(dpi / 0.0254);
  const chunk = new Uint8Array(21);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4); // "pHYs"
  view.setUint32(8, ppm);
  view.setUint32(12, ppm);
  chunk[16] = 1; // unit: metre
  view.setUint32(17, crc32(chunk.subarray(4, 17)));
  const ihdrEnd = 8 + 25; // signature + IHDR (length, type, 13 bytes, crc)
  const out = new Uint8Array(src.length + chunk.length);
  out.set(src.subarray(0, ihdrEnd), 0);
  out.set(chunk, ihdrEnd);
  out.set(src.subarray(ihdrEnd), ihdrEnd + chunk.length);
  return new Blob([out], { type: 'image/png' });
};

export const cardPngBlob = async (card, side) => {
  const canvas = await renderCardSide(card, side);
  const blob = await new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG failed'))), 'image/png'));
  return withDpi(blob, PNG_DPI);
};

const save = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

/** Save the front and the back as two PNG files */
export const downloadCardPngs = async (card) => {
  const safeId = String(card.libraryId).replace(/[^A-Za-z0-9_-]/g, '');
  const [front, back] = await Promise.all([cardPngBlob(card, 'front'), cardPngBlob(card, 'back')]);
  save(front, `libverse-card-${safeId}-front.png`);
  await new Promise((r) => setTimeout(r, 400)); // browsers ignore a second download fired in the same tick
  save(back, `libverse-card-${safeId}-back.png`);
};
