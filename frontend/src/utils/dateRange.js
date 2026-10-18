/**
 * Date-range presets shared by Analytics and Reports. Dates are local 'YYYY-MM-DD' strings,
 * both ends inclusive, matching GET /api/admin/analytics|reports ?from=&to=.
 */

export const RANGE_PRESETS = [
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
  { key: '12m', label: '12 months' },
  { key: 'custom', label: 'Custom' },
];

const pad = (n) => String(n).padStart(2, '0');
export const toDayString = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const isDayString = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T00:00:00`).getTime());

/**
 * { from, to } for a preset. 12 months = the 1st of the month 11 months ago through today
 * (the server's default, 12 whole monthly buckets).
 * @param {string} key - '30d' | '90d' | '12m'
 * @param {Date} [now]
 */
export const presetRange = (key, now = new Date()) => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (key === '30d') return { from: toDayString(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)), to: toDayString(today) };
  if (key === '90d') return { from: toDayString(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 89)), to: toDayString(today) };
  return { from: toDayString(new Date(today.getFullYear(), today.getMonth() - 11, 1)), to: toDayString(today) };
};

/**
 * Read the range from URL params: ?range=30d|90d|12m, or ?range=custom&from=&to=.
 * Anything invalid falls back to 12 months.
 * @param {URLSearchParams} params
 */
export const rangeFromParams = (params) => {
  const key = params.get('range');
  if (key === 'custom') {
    const from = params.get('from');
    const to = params.get('to');
    if (isDayString(from) && isDayString(to) && from <= to) return { preset: 'custom', from, to };
  }
  const preset = ['30d', '90d', '12m'].includes(key) ? key : '12m';
  return { preset, ...presetRange(preset) };
};

/** "1 Nov 2025 – 18 Oct 2026" */
export const formatRangeLabel = ({ from, to }) => {
  const fmt = (s) => new Date(`${s}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(from)} – ${fmt(to)}`;
};
