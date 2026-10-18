import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, Skeleton } from '../UI';
import { AmountStat } from '../dashboard/DashboardKit';
import { EChart, CHART_THEME, axisDefaults } from '../analytics/EChart';
import { getGenreAccent } from '../../constants/genres';

/**
 * Student reading stats from GET /api/auth/me/reading-stats. A book counts as read when its
 * loan is returned.
 */

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const onTimeLabel = (stats) => (stats.onTimeRate === null ? '—' : `${stats.onTimeRate}%`);
const avgLabel = (stats) => (stats.averageLoanDays === null ? '—' : plural(stats.averageLoanDays, 'day'));

const monthSummary = (stats) => {
  const months = stats.booksPerMonth || [];
  const best = months.reduce((b, m) => (m.count > (b?.count || 0) ? m : b), null);
  return `Books read per month over the last 12 months: ${stats.readLast12Months} in total.${
    best ? ` Most in ${best.label} (${best.count}).` : ''
  } ${months.map((m) => `${m.label}: ${m.count}`).join(', ')}.`;
};

const NothingRead = ({ compact }) => (
  <EmptyState
    bare
    icon="📖"
    title="No books read yet"
    message={compact ? 'Return a book and your reading stats start here.' : 'Your reading stats appear once you return your first book.'}
    action={<Link to="/student/books" className="btn-secondary min-h-[36px] px-3 text-xs">Browse books</Link>}
  />
);

/** Small bar strip of the 12 months (SVG, no chart library) */
const MonthBars = ({ months }) => {
  const max = Math.max(1, ...months.map((m) => m.count));
  return (
    <div className="flex h-16 items-end gap-1" aria-hidden="true">
      {months.map((m) => (
        <div key={m.label} className="flex flex-1 flex-col items-center gap-1" title={`${m.label}: ${m.count}`}>
          <div
            className={`w-full rounded-t ${m.count ? 'bg-indigo-400/80' : 'bg-white/10'}`}
            style={{ height: `${Math.max(4, (m.count / max) * 48)}px` }}
          />
          <span className="text-[9px] leading-none text-slate-500">{m.label.slice(0, 1)}</span>
        </div>
      ))}
    </div>
  );
};

/** Dashboard card body */
export const ReadingStatsCompact = ({ stats, loading, error }) => {
  if (loading) return <div className="grid grid-cols-3 gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  if (error) return <EmptyState bare icon="⚠️" title="Couldn't load your reading stats" message={error} />;
  if (!stats || stats.totalRead === 0) return <NothingRead compact />;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <AmountStat label="Books read" value={stats.totalRead} hint={`${stats.readLast12Months} this year`} />
        <AmountStat label="On time" value={onTimeLabel(stats)} tone="text-emerald-300" hint={`${stats.onTimeReturns} of ${stats.totalRead}`} />
        <AmountStat label="Avg loan" value={avgLabel(stats)} tone="text-cyan-300" />
      </div>
      <figure className="m-0">
        <MonthBars months={stats.booksPerMonth} />
        <figcaption className="sr-only">{monthSummary(stats)}</figcaption>
      </figure>
      {stats.genres[0] && (
        <p className="text-xs text-slate-400">
          Favourite genre: <span className="font-semibold" style={{ color: getGenreAccent(stats.genres[0].genre) }}>{stats.genres[0].genre}</span> ({plural(stats.genres[0].count, 'book')})
        </p>
      )}
    </div>
  );
};

/** Profile tab: tiles, books per month and genres read */
export const ReadingStatsPanel = ({ stats, loading, error, onRetry }) => {
  const monthsOption = useMemo(() => {
    if (!stats) return null;
    return {
      tooltip: { ...CHART_THEME.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 4, right: 8, top: 12, bottom: 4, containLabel: true },
      xAxis: { type: 'category', data: stats.booksPerMonth.map((m) => m.label.slice(0, 3)), ...axisDefaults, splitLine: { show: false } },
      yAxis: { type: 'value', minInterval: 1, ...axisDefaults, axisLine: { show: false } },
      series: [{ name: 'Books read', type: 'bar', data: stats.booksPerMonth.map((m) => m.count), itemStyle: { color: '#818CF8', borderRadius: [4, 4, 0, 0] }, barMaxWidth: 20 }],
    };
  }, [stats]);

  const genres = useMemo(() => stats?.genres?.slice(0, 8) || [], [stats]);
  const genresOption = useMemo(() => {
    if (!genres.length) return null;
    const rows = [...genres].reverse();
    return {
      tooltip: { ...CHART_THEME.tooltip, trigger: 'item', formatter: (p) => `${p.name}: ${plural(p.value, 'book')}` },
      grid: { left: 14, right: 24, top: 4, bottom: 4, containLabel: true },
      yAxis: { type: 'category', data: rows.map((g) => g.genre), ...axisDefaults, splitLine: { show: false } },
      xAxis: { type: 'value', minInterval: 1, ...axisDefaults, axisLine: { show: false } },
      series: [{
        type: 'bar',
        data: rows.map((g) => ({ value: g.count, itemStyle: { color: getGenreAccent(g.genre), borderRadius: [0, 4, 4, 0] } })),
        barMaxWidth: 14,
        label: { show: true, position: 'right', color: CHART_THEME.text, fontSize: 11 },
      }],
    };
  }, [genres]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading reading stats">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <EmptyState
        bare
        icon="⚠️"
        title="Couldn't load your reading stats"
        message={error}
        action={onRetry ? <button type="button" onClick={onRetry} className="btn-primary min-h-[36px] px-4 text-sm">Try again</button> : null}
      />
    );
  }
  if (!stats || stats.totalRead === 0) return <NothingRead />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AmountStat label="Books read" value={stats.totalRead} hint="all time" />
        <AmountStat label="Last 12 months" value={stats.readLast12Months} tone="text-indigo-300" />
        <AmountStat label="Average loan" value={avgLabel(stats)} tone="text-cyan-300" hint="issue to hand-back" />
        <AmountStat label="On time" value={onTimeLabel(stats)} tone="text-emerald-300" hint={`${stats.onTimeReturns} of ${stats.totalRead} returns`} />
      </div>

      <section aria-labelledby="reading-months-title">
        <h3 id="reading-months-title" className="mb-2 text-sm font-semibold text-slate-200">Books read per month</h3>
        <EChart option={monthsOption} summary={monthSummary(stats)} height={200} />
      </section>

      <section aria-labelledby="reading-genres-title">
        <h3 id="reading-genres-title" className="mb-2 text-sm font-semibold text-slate-200">Genres you read</h3>
        <EChart
          option={genresOption}
          summary={`Books read per genre: ${genres.map((g) => `${g.genre}: ${g.count}`).join(', ')}.`}
          height={Math.max(120, genres.length * 30 + 20)}
        />
      </section>
    </div>
  );
};
