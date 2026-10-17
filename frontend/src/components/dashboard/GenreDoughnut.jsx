import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { getGenreAccent } from '../../constants/genres';
import { groupGenres } from './genreGrouping';

const TOOLTIP_TEXT = '#E2E8F0';
const OTHERS_COLOR = '#64748B';
const TOOLTIP_GAP = 10;
const VIEWPORT_MARGIN = 8;

const MODES = [
  { key: 'catalogue', label: 'Catalogue', unit: 'book', centre: 'books', what: 'active books' },
  { key: 'borrowed', label: 'Borrowed', unit: 'loan', centre: 'loans', what: 'loans' },
];

const plural = (n, word) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;

/**
 * Tooltip beside the chart, never over the ring or the centre label: right of the chart when
 * it fits in the viewport, else left of it, else below it (narrow screens).
 * Coordinates are relative to the chart box; the tooltip itself is appended to <body>.
 */
const tooltipBesideChart = (el) => (point, params, dom, rect, size) => {
  const [w, h] = size.viewSize;
  const [tw, th] = size.contentSize;
  const box = el.getBoundingClientRect();
  const y = Math.round((h - th) / 2);
  if (box.right + TOOLTIP_GAP + tw <= window.innerWidth - VIEWPORT_MARGIN) return [w + TOOLTIP_GAP, y];
  if (box.left - TOOLTIP_GAP - tw >= VIEWPORT_MARGIN) return [-tw - TOOLTIP_GAP, y];
  return [Math.round((w - tw) / 2), h + 6];
};

/** Catalogue | Borrowed segmented control: radio semantics, arrow keys move the selection */
const ModeSwitch = ({ mode, onChange }) => {
  const refs = useRef({});
  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = MODES.findIndex((m) => m.key === mode);
    const next = MODES[(i + step + MODES.length) % MODES.length].key;
    onChange(next);
    refs.current[next]?.focus();
  };
  return (
    <div className="inline-flex gap-1 rounded-xl border border-border bg-input/70 p-1" role="radiogroup" aria-label="Genre chart data">
      {MODES.map((m) => {
        const selected = m.key === mode;
        return (
          <button
            key={m.key}
            ref={(node) => { refs.current[m.key] = node; }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(m.key)}
            onKeyDown={onKeyDown}
            className={`min-h-[32px] rounded-lg px-3 text-xs font-semibold transition-colors ${
              selected ? 'bg-indigo-500/20 text-white shadow-[0_0_0_1px_rgba(99,102,241,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
};

const LegendButton = ({ color, label, count, onClick, title, ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-[30px] w-full items-center gap-2 rounded-lg px-1.5 text-left text-xs transition-colors hover:bg-white/5"
    title={title}
    {...rest}
  >
    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
    <span className="min-w-0 flex-1 truncate text-slate-200">{label}</span>
    <span className="flex-shrink-0 tabular-nums font-semibold text-slate-300">{count.toLocaleString()}</span>
  </button>
);

/**
 * Doughnut per genre from GET /admin/dashboard:
 * - Catalogue: active books per genre (booksByGenre); Borrowed: real loans per genre (borrowedByGenre).
 * - Top 7 genres by count plus "Others" (see groupGenres); the centre shows the total.
 * - A genre slice or legend item calls onSelect(genre); the Others slice or row expands the
 *   grouped genres instead (no navigation).
 * - Accessible: the chart is role="img" with a top-3 summary, the legend carries the full data
 *   as buttons, the Others row is a disclosure (aria-expanded) and the switch is a radio group.
 */
export const GenreDoughnut = ({ catalogue = [], borrowed = [], onSelect }) => {
  const [mode, setMode] = useState('catalogue');
  const [othersOpen, setOthersOpen] = useState(false);
  const chartRef = useRef(null);
  const chart = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const othersListId = useId();

  const m = MODES.find((x) => x.key === mode);
  const group = useMemo(() => groupGenres(mode === 'borrowed' ? borrowed : catalogue), [mode, catalogue, borrowed]);
  const { total, shown, others, othersTotal } = group;
  const isEmpty = total === 0;
  const pct = (n) => (total ? Math.round((n / total) * 1000) / 10 : 0);
  const summary = isEmpty
    ? `Genres: no ${m.what}.`
    : `${m.label} by genre, ${plural(total, m.unit)}. Largest: ${shown.slice(0, 3).map((d) => `${d.genre} ${d.count} (${pct(d.count)}%)`).join(', ')}${
      others.length ? `. Others: ${others.length} genres, ${othersTotal}` : ''}.`;

  const changeMode = (next) => {
    setMode(next);
    setOthersOpen(false);
  };

  // The chart only exists while there is data to draw
  useEffect(() => {
    if (isEmpty || !chartRef.current) return undefined;
    const el = chartRef.current;
    chart.current = echarts.init(el, null, { renderer: 'canvas' });
    chart.current.on('click', (params) => {
      if (params?.data?.isOthers) setOthersOpen(true);
      else if (params?.name) onSelectRef.current?.(params.name);
    });
    const ro = new ResizeObserver(() => chart.current?.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, [isEmpty]);

  useEffect(() => {
    if (!chart.current || isEmpty) return;
    const slices = shown.map((d) => ({ name: d.genre, value: d.count, itemStyle: { color: getGenreAccent(d.genre) } }));
    if (others.length) {
      slices.push({ name: 'Others', value: othersTotal, isOthers: true, genres: others.length, itemStyle: { color: OTHERS_COLOR } });
    }
    chart.current.setOption({
      animationDuration: 500,
      tooltip: {
        trigger: 'item',
        appendTo: 'body',
        position: tooltipBesideChart(chartRef.current),
        backgroundColor: 'rgba(17, 24, 39, 0.96)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: TOOLTIP_TEXT, fontSize: 12, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
        formatter: (p) => {
          const head = p.data?.isOthers ? `Others · ${p.data.genres} genres` : p.name;
          return `<strong>${head}</strong><br/>${plural(p.value, m.unit)} · ${p.percent}%`;
        },
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
          data: slices,
        },
      ],
    }, true);
  }, [shown, others, othersTotal, isEmpty, m.unit]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center sm:justify-start">
        <ModeSwitch mode={mode} onChange={changeMode} />
      </div>

      {isEmpty ? (
        <div className="grid min-h-[176px] place-items-center rounded-xl border border-dashed border-border px-4 text-center">
          <div>
            <p className="text-sm font-semibold text-slate-200">{mode === 'borrowed' ? 'No loans yet' : 'No active books'}</p>
            <p className="mt-1 text-xs text-slate-400">
              {mode === 'borrowed' ? 'Borrowed books will show here by genre once members start borrowing.' : 'Add books to see the genre mix.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative h-44 w-44 flex-shrink-0">
            <div ref={chartRef} role="img" aria-label={summary} className="h-full w-full" />
            <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
              <div className="text-center">
                <p className="font-display text-3xl font-bold leading-none text-slate-50">{total.toLocaleString()}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{m.centre}</p>
              </div>
            </div>
          </div>

          <ul className="grid w-full min-w-0 grid-cols-2 gap-x-3 gap-y-0.5 sm:gap-x-4" aria-label={`${m.label} per genre`}>
            {shown.map((d) => (
              <li key={d.genre} className="min-w-0">
                <LegendButton
                  color={getGenreAccent(d.genre)}
                  label={d.genre}
                  count={d.count}
                  onClick={() => onSelect?.(d.genre)}
                  title={`Show ${d.genre} books`}
                />
              </li>
            ))}
            {others.length > 0 && (
              <>
                <li className="col-span-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => setOthersOpen((o) => !o)}
                    aria-expanded={othersOpen}
                    aria-controls={othersListId}
                    className="flex min-h-[30px] w-full items-center gap-2 rounded-lg px-1.5 text-left text-xs transition-colors hover:bg-white/5"
                  >
                    <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: OTHERS_COLOR }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-slate-200">
                      Others <span className="text-slate-400">({others.length} {others.length === 1 ? 'genre' : 'genres'})</span>
                    </span>
                    <span className="flex-shrink-0 tabular-nums font-semibold text-slate-300">{othersTotal.toLocaleString()}</span>
                    <svg
                      className={`h-3.5 w-3.5 flex-shrink-0 text-slate-400 transition-transform ${othersOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                    >
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                </li>
                <li className="col-span-2 min-w-0" hidden={!othersOpen}>
                  <ul
                    id={othersListId}
                    className="ml-3 grid grid-cols-2 gap-x-3 gap-y-0.5 border-l border-border pl-2 sm:gap-x-4"
                    aria-label="Genres grouped in Others"
                  >
                    {others.map((d) => (
                      <li key={d.genre} className="min-w-0">
                        <LegendButton
                          color={getGenreAccent(d.genre)}
                          label={d.genre}
                          count={d.count}
                          onClick={() => onSelect?.(d.genre)}
                          title={`Show ${d.genre} books`}
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
