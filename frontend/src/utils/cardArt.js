/**
 * Library card artwork shared by the on-screen/print card (components/LibraryCard, CSS container
 * units: 1u = 1% of the card width) and the 300 DPI PNG (utils/cardCanvas, 1u = width / 100 px).
 * CR80 card: 85.6 x 54 mm, so the height is 63.08u.
 */
export const CARD_MM = { width: 85.6, height: 54 };
export const CARD_H = (CARD_MM.height / CARD_MM.width) * 100; // 63.08u
export const PNG_DPI = 300;
export const PNG_SIZE = {
  width: Math.round((CARD_MM.width / 25.4) * PNG_DPI), // 1011
  height: Math.round((CARD_MM.height / 25.4) * PNG_DPI), // 638
};

export const CARD_COLORS = {
  bg: ['#081028', '#0E1A44', '#0A1230'],
  glowCyan: 'rgba(34, 211, 238, 0.16)',
  glowViolet: 'rgba(139, 92, 246, 0.16)',
  accent: '#22D3EE',
  text: '#F8FAFC',
  muted: '#94A3B8',
  label: '#7C8DB0',
  verse: '#A78BFA',
  role: '#67E8F9',
  stripe: '#040814',
};

// Holographic strip colours (left to right)
export const HOLO_STOPS = ['#7DD3FC', '#C4B5FD', '#F0ABFC', '#FDE68A', '#86EFAC', '#7DD3FC'];

/** Geometry in card units */
export const FRONT = {
  holo: { y: 2.4, h: 0.85 },
  accentH: 1.1,
  logo: { x: 5.5, y: 5.4, size: 8, radius: 2.3, icon: 4.6 },
  word: { x: 15.8, y: 6.1, size: 4.4 },
  sub: { x: 15.9, y: 11.2, size: 1.85 },
  avatar: { x: 5.5, y: 18.5, d: 13, ring: 0.6 },
  name: { x: 21.8, y: 19.8, size: 5.2, maxW: 39 },
  role: { x: 21.8, y: 26.6, h: 3.8, size: 1.95, padX: 1.7 },
  idLabel: { x: 5.5, y: 37.4, size: 2 },
  id: { x: 5.5, y: 40.3, size: 3.7 },
  sinceLabel: { x: 5.5, y: 47.6, size: 2 },
  since: { x: 5.5, y: 50.5, size: 2.9 },
  qr: { x: 63.5, y: 15.6, size: 31, radius: 3.2, pad: 1.6 },
  caption: { y: 49.4, size: 1.9 },
};

export const BACK = {
  stripe: { y: 5.5, h: 9.5 },
  title: { x: 5.5, y: 19.2, size: 3 },
  rules: { x: 5.5, y: 25, step: 4.9, size: 2.35, dot: 0.9 },
  found: { x: 5.5, y: 42.2, size: 2.3, maxW: 64 },
  brand: { x: 5.5, y: 52.3, tile: 5, radius: 1.5, icon: 2.9, wordX: 12.2, wordSize: 2.7 },
  version: { x: 5.5, y: 57.4, size: 1.9 },
  qr: { x: 75, y: 37.5, size: 19.5, radius: 2.2, pad: 1.2 },
  qrLabel: { y: 34.5, size: 1.7 },
};

/** Faint book spines along the bottom edge: [x, width, height, alpha], the same every time */
export const SPINES = (() => {
  const out = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  let x = -0.5;
  while (x < 100) {
    const w = 1.3 + rand() * 1.9;
    out.push([+x.toFixed(2), +w.toFixed(2), +(5 + rand() * 9).toFixed(2), +(0.016 + rand() * 0.024).toFixed(3)]);
    x += w + 0.35;
  }
  return out;
})();

export const ROLE_LABEL = { student: 'Student', librarian: 'Librarian', admin: 'Admin' };
export const memberSince = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—');
export const initialsOf = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';

/** Back-of-card rules from the server's lending constants (never made up here) */
export const rulesOf = (rules) => {
  if (!rules) return [];
  const out = [];
  if (rules.loanDays) out.push(`Loans last ${rules.loanDays} days`);
  if (rules.maxRenewals) out.push(`Renew up to ${rules.maxRenewals} times${rules.renewalDays ? `, ${rules.renewalDays} days each` : ''}`);
  if (rules.finePerDay) out.push(`Late returns: ₹${rules.finePerDay} per day`);
  return out;
};
