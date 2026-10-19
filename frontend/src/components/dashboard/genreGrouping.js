/**
 * Groups genre counts for the doughnut (genres with 0 are left out entirely):
 * - A genre goes to "Others" only when its share is under MIN_SHARE of the total.
 * - Only if that still leaves more than MAX_SLICES slices are the MAX_SLICES - 1 largest kept and
 *   the rest grouped into Others too.
 * - Never an "Others" with a single genre: a lone leftover gets its own slice.
 * Order: by count, ties by name. Returns { total, shown, others, othersTotal }; others is [] when
 * nothing is grouped.
 */
export const MIN_SHARE = 0.03;
export const MAX_SLICES = 18; // the catalogue's genre list; grouping by size only starts beyond it

const byCount = (a, b) => b.count - a.count || a.genre.localeCompare(b.genre);

export const groupGenres = (data = []) => {
  const sorted = data.filter((d) => d.count > 0).sort(byCount);
  const total = sorted.reduce((sum, d) => sum + d.count, 0);

  let shown = sorted.filter((d) => d.count / total >= MIN_SHARE);
  let others = sorted.filter((d) => d.count / total < MIN_SHARE);

  if (shown.length + (others.length ? 1 : 0) > MAX_SLICES) {
    others = [...shown.slice(MAX_SLICES - 1), ...others];
    shown = shown.slice(0, MAX_SLICES - 1);
  }
  // A lone leftover genre gets its own slice (only possible when nothing was capped)
  if (others.length === 1) {
    shown = [...shown, ...others].sort(byCount);
    others = [];
  }

  return { total, shown, others, othersTotal: others.reduce((sum, d) => sum + d.count, 0) };
};
