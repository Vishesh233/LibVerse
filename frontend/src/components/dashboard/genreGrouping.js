/**
 * Groups genre counts for the doughnut: at most MAX_SHOWN genres by count (ties by name),
 * everything else in "Others". A genre under MIN_SHARE of the total always goes to Others,
 * even when it would be in the top MAX_SHOWN, unless it would be the only genre in Others
 * (then it gets its own slice). Genres with 0 are left out entirely.
 * Returns { total, shown, others, othersTotal }; others is [] when nothing is grouped.
 */
export const MAX_SHOWN = 7;
export const MIN_SHARE = 0.03;

export const groupGenres = (data = []) => {
  const sorted = data
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));
  const total = sorted.reduce((sum, d) => sum + d.count, 0);

  const shown = [];
  const others = [];
  sorted.forEach((d) => {
    if (shown.length < MAX_SHOWN && d.count / total >= MIN_SHARE) shown.push(d);
    else others.push(d);
  });
  // Never an "Others (1 genre)": a lone leftover genre gets its own slice
  if (others.length === 1) shown.push(others.pop());

  return { total, shown, others, othersTotal: others.reduce((sum, d) => sum + d.count, 0) };
};
