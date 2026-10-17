import React, { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import { getGenreAccent } from '../../constants/genres';

const TOOLTIP_TEXT = '#E2E8F0';

/**
 * Doughnut of active books per genre (GET /admin/dashboard -> booksByGenre).
 * - Slice colours are the genre accents; the centre shows the total.
 * - Accessible: the chart is role="img" with a top-3 summary, and the text legend
 *   (genre · count, every genre including 0) carries the full data as buttons.
 * - Clicking a slice or a legend item calls onSelect(genre).
 */
export const GenreDoughnut = ({ data = [], onSelect }) => {
  const chartRef = useRef(null);
  const chart = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const total = useMemo(() => data.reduce((sum, d) => sum + (d.count || 0), 0), [data]);
  const sorted = useMemo(() => [...data].sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre)), [data]);
  const pct = (n) => (total ? Math.round((n / total) * 1000) / 10 : 0);
  const summary = total
    ? `Books by genre, ${total} active books. Largest: ${sorted.slice(0, 3).map((d) => `${d.genre} ${d.count} (${pct(d.count)}%)`).join(', ')}.`
    : 'Books by genre: no active books.';

  useEffect(() => {
    if (!chartRef.current) return undefined;
    chart.current = echarts.init(chartRef.current, null, { renderer: 'canvas' });
    chart.current.on('click', (params) => {
      if (params?.name) onSelectRef.current?.(params.name);
    });
    const ro = new ResizeObserver(() => chart.current?.resize());
    ro.observe(chartRef.current);
    return () => {
      ro.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chart.current) return;
    chart.current.setOption({
      animationDuration: 500,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(17, 24, 39, 0.96)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: TOOLTIP_TEXT, fontSize: 12, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
        formatter: (p) => `<strong>${p.name}</strong><br/>${p.value} book${p.value === 1 ? '' : 's'} · ${p.percent}%`,
      },
      series: [
        {
          type: 'pie',
          radius: ['62%', '88%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          cursor: 'pointer',
          itemStyle: { borderColor: '#0B1220', borderWidth: 2, borderRadius: 4 },
          emphasis: { scale: true, scaleSize: 5, itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.45)' } },
          data: sorted.filter((d) => d.count > 0).map((d) => ({ name: d.genre, value: d.count, itemStyle: { color: getGenreAccent(d.genre) } })),
        },
      ],
    }, true);
  }, [sorted]);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative h-44 w-44 flex-shrink-0">
        <div ref={chartRef} role="img" aria-label={summary} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
          <div className="text-center">
            <p className="font-display text-3xl font-bold leading-none text-slate-50">{total.toLocaleString()}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">books</p>
          </div>
        </div>
      </div>

      <ul className="grid w-full min-w-0 grid-cols-2 gap-x-3 gap-y-0.5 sm:gap-x-4" aria-label="Books per genre">
        {sorted.map((d) => (
          <li key={d.genre} className="min-w-0">
            <button
              type="button"
              onClick={() => onSelect?.(d.genre)}
              className="flex min-h-[30px] w-full items-center gap-2 rounded-lg px-1.5 text-left text-xs transition-colors hover:bg-white/5"
              title={`Show ${d.genre} books`}
            >
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: getGenreAccent(d.genre) }} aria-hidden="true" />
              <span className={`min-w-0 flex-1 truncate ${d.count ? 'text-slate-200' : 'text-muted'}`}>{d.genre}</span>
              <span className="flex-shrink-0 tabular-nums font-semibold text-slate-300">{d.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
