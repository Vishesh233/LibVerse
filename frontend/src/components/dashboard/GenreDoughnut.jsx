import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { getGenreAccent } from '../../constants/genres';
import { groupGenres } from './genreGrouping';

const TOOLTIP_TEXT = '#E2E8F0';
const OTHERS_COLOR = '#64748B';
const OTHERS_KEY = '__others';
const TOOLTIP_GAP = 10;
const VIEWPORT_MARGIN = 8;
const LEGEND_ROWS = 10;

const MODES = [
  { key: 'catalogue', label: 'Catalogue', unit: 'book', centre: 'books', what: 'active books' },
  { key: 'borrowed', label: 'Borrowed', unit: 'loan', centre: 'loans', what: 'loans' },
];

const plural = (n, word) => `${n.toLocaleString()} ${word}${n === 1 ? '' : 's'}`;

/** #RRGGBB -> rgba() with the given alpha (for the glow in the slice's own colour) */
const withAlpha = (hex, alpha) => {
  const h = String(hex).replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [query]);
  return matches;
};

// Legend: two columns from this width (same breakpoint as the min-[440px] classes below)
const TWO_COLUMNS = '(min-width: 440px)';

/**
 * Tooltip outside the ring and the centre label, and never over the legend (which shows the
 * same row lit up): with the legend beside the chart, below the chart; with the legend below
 * (phones), beside the chart when it fits in the viewport, else above it.
 * Coordinates are relative to the chart box; the tooltip itself is appended to <body>.
 */
const tooltipOutsideChart = (el, legendEl) => (point, params, dom, rect, size) => {
  const [w, h] = size.viewSize;
  const [tw, th] = size.contentSize;
  const box = el.getBoundingClientRect();
  const legend = legendEl?.getBoundingClientRect();
  const centred = Math.round((w - tw) / 2);
  const legendBeside = legend && legend.left >= box.right - 1;
  if (legendBeside) return [centred, h + TOOLTIP_GAP];
  const y = Math.round((h - th) / 2);
  if (box.right + TOOLTIP_GAP + tw <= window.innerWidth - VIEWPORT_MARGIN) return [w + TOOLTIP_GAP, y];
  if (box.left - TOOLTIP_GAP - tw >= VIEWPORT_MARGIN) return [-tw - TOOLTIP_GAP, y];
  return [centred, -th - TOOLTIP_GAP];
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

/** One legend entry; `state` is 'active' (its slice is lit), 'dim' (another slice is lit) or 'idle' */
const LegendButton = ({ color, label, count, share, state, onClick, onHover, onLeave, title, children, ...rest }) => (
  <button
    type="button"
    onClick={onClick}
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    onFocus={onHover}
    onBlur={onLeave}
    data-state={state}
    className={`genre-legend__row flex min-h-[30px] w-full items-center gap-2 rounded-lg px-1.5 text-left text-xs ${
      state === 'active' ? 'bg-white/[0.07] text-white' : state === 'dim' ? 'opacity-45' : 'hover:bg-white/5'
    }`}
    style={state === 'active' ? { boxShadow: `inset 0 0 0 1px ${withAlpha(color, 0.55)}` } : undefined}
    title={title}
    {...rest}
  >
    <span
      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
      style={{ background: color, boxShadow: state === 'active' ? `0 0 0 3px ${withAlpha(color, 0.22)}, 0 0 10px ${withAlpha(color, 0.8)}` : undefined }}
      aria-hidden="true"
    />
    <span className="min-w-0 flex-1 truncate text-slate-200">{label}</span>
    {state === 'active' && <span className="flex-shrink-0 tabular-nums text-[11px] text-slate-400">{share}%</span>}
    <span className="flex-shrink-0 tabular-nums font-semibold text-slate-300">{count.toLocaleString()}</span>
    {children}
  </button>
);

/**
 * Doughnut per genre from GET /admin/dashboard:
 * - Catalogue: active books per genre (booksByGenre); Borrowed: real loans per genre (borrowedByGenre).
 * - Grouping (see groupGenres): Others only for genres under 3%; the centre shows the total.
 * - Hovering a slice lights it up (pops out, glows in its own colour, the rest dim) and highlights
 *   its legend row; hovering or focusing a legend row does the same to its slice. With reduced
 *   motion the slice does not pop out.
 * - A genre slice or legend item calls onSelect(genre); the Others slice or row expands the
 *   grouped genres instead (no navigation).
 * - Accessible: the chart is role="img" with a top-3 summary, the legend carries the full data
 *   as buttons, the Others row and "Show all" are disclosures, and the switch is a radio group.
 */
export const GenreDoughnut = ({ catalogue = [], borrowed = [], onSelect }) => {
  const [mode, setMode] = useState('catalogue');
  const [othersOpen, setOthersOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [hovered, setHovered] = useState(null); // genre name or OTHERS_KEY
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const twoColumns = useMediaQuery(TWO_COLUMNS);
  const chartRef = useRef(null);
  const legendRef = useRef(null);
  const chart = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const othersListId = useId();
  const legendId = useId();

  const m = MODES.find((x) => x.key === mode);
  const group = useMemo(() => groupGenres(mode === 'borrowed' ? borrowed : catalogue), [mode, catalogue, borrowed]);
  const { total, shown, others, othersTotal } = group;
  const isEmpty = total === 0;
  const pct = (n) => (total ? Math.round((n / total) * 1000) / 10 : 0);
  const summary = isEmpty
    ? `Genres: no ${m.what}.`
    : `${m.label} by genre, ${plural(total, m.unit)}. Largest: ${shown.slice(0, 3).map((d) => `${d.genre} ${d.count} (${pct(d.count)}%)`).join(', ')}${
      others.length ? `. Others: ${others.length} genres, ${othersTotal}` : ''}.`;

  // Slice order = legend order: shown genres, then Others
  const keys = useMemo(() => [...shown.map((d) => d.genre), ...(others.length ? [OTHERS_KEY] : [])], [shown, others]);
  const othersGenres = useMemo(() => new Set(others.map((d) => d.genre)), [others]);

  const changeMode = (next) => {
    setMode(next);
    setOthersOpen(false);
    setShowAll(false);
    setHovered(null);
  };

  // The chart only exists while there is data to draw. It is re-created per mode: after a full
  // option replace, ECharts kept stale hover state and stopped emitting mouseover.
  useEffect(() => {
    if (isEmpty || !chartRef.current) return undefined;
    const el = chartRef.current;
    chart.current = echarts.init(el, null, { renderer: 'canvas' });
    chart.current.on('click', (params) => {
      if (params?.data?.isOthers) setOthersOpen(true);
      else if (params?.name) onSelectRef.current?.(params.name);
    });
    chart.current.on('mouseover', (params) => setHovered(params?.data?.key ?? null));
    chart.current.on('mouseout', () => setHovered(null));
    chart.current.on('globalout', () => setHovered(null));
    const ro = new ResizeObserver(() => chart.current?.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, [isEmpty, mode]);

  useEffect(() => {
    if (!chart.current || isEmpty) return;
    const slice = (key, name, value, color, extra = {}) => ({
      key,
      name,
      value,
      itemStyle: { color },
      // The lit slice glows in its own colour
      emphasis: { itemStyle: { color, shadowBlur: 22, shadowColor: withAlpha(color, 0.85), borderColor: withAlpha(color, 0.9), borderWidth: 2 } },
      ...extra,
    });
    const slices = shown.map((d) => slice(d.genre, d.genre, d.count, getGenreAccent(d.genre)));
    if (others.length) slices.push(slice(OTHERS_KEY, 'Others', othersTotal, OTHERS_COLOR, { isOthers: true, genres: others.length }));
    chart.current.setOption({
      animationDuration: reducedMotion ? 0 : 500,
      animationDurationUpdate: reducedMotion ? 0 : 200,
      tooltip: {
        trigger: 'item',
        appendTo: 'body',
        position: tooltipOutsideChart(chartRef.current, legendRef.current),
        backgroundColor: 'rgba(17, 24, 39, 0.96)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        padding: [8, 12],
        transitionDuration: reducedMotion ? 0 : 0.2,
        textStyle: { color: TOOLTIP_TEXT, fontSize: 12, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
        formatter: (p) => {
          const head = p.data?.isOthers ? `Others · ${p.data.genres} genres` : p.name;
          return `<strong>${head}</strong><br/>${plural(p.value, m.unit)} · ${p.percent}%`;
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['62%', '86%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          cursor: 'pointer',
          itemStyle: { borderColor: '#0B1220', borderWidth: 2, borderRadius: 4 },
          // Pop out (not with reduced motion) and dim the other slices
          emphasis: { focus: 'self', scale: !reducedMotion, scaleSize: 7 },
          blur: { itemStyle: { opacity: 0.3 } },
          data: slices,
        },
      ],
    }, true);
  }, [shown, others, othersTotal, isEmpty, mode, m.unit, reducedMotion]);

  // Legend row -> light up its slice (and show its tooltip beside the chart)
  const lightSlice = useCallback((key) => {
    setHovered(key);
    const c = chart.current;
    const dataIndex = keys.indexOf(key);
    if (!c || dataIndex < 0) return;
    c.dispatchAction({ type: 'downplay', seriesIndex: 0 });
    c.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex });
    c.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex });
  }, [keys]);
  const clearSlice = useCallback(() => {
    setHovered(null);
    const c = chart.current;
    if (!c) return;
    c.dispatchAction({ type: 'downplay', seriesIndex: 0 });
    c.dispatchAction({ type: 'hideTip' });
  }, []);

  const stateOf = (key) => (!hovered ? 'idle' : hovered === key ? 'active' : 'dim');
  // More than LEGEND_ROWS rows: show the first LEGEND_ROWS rows and a "Show all" toggle
  const entries = keys.length;
  const limit = LEGEND_ROWS * (twoColumns ? 2 : 1);
  const collapsible = entries > limit;
  const collapsed = collapsible && !showAll;
  const visibleShown = collapsed ? shown.slice(0, limit) : shown;
  const othersVisible = others.length > 0 && !(collapsed && shown.length >= limit);

  return (
    <div className="flex flex-1 flex-col gap-4">
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
        // Fills the card (equal-height row): chart and legend centred in the space, no empty strip below
        <div className="flex flex-1 flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <div className="relative h-44 w-44 flex-shrink-0 sm:h-48 sm:w-48 xl:h-56 xl:w-56">
            <div ref={chartRef} role="img" aria-label={summary} className="h-full w-full" />
            <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
              <div className="text-center">
                <p className="font-display text-3xl font-bold leading-none text-slate-50">{total.toLocaleString()}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{m.centre}</p>
              </div>
            </div>
          </div>

          <div ref={legendRef} className="w-full min-w-0">
            <ul id={legendId} className="genre-legend grid w-full min-w-0 grid-cols-1 gap-x-4 gap-y-0.5 min-[440px]:grid-cols-2" aria-label={`${m.label} per genre`}>
              {visibleShown.map((d) => (
                <li key={d.genre} className="min-w-0">
                  <LegendButton
                    color={getGenreAccent(d.genre)}
                    label={d.genre}
                    count={d.count}
                    share={pct(d.count)}
                    state={stateOf(d.genre)}
                    onHover={() => lightSlice(d.genre)}
                    onLeave={clearSlice}
                    onClick={() => onSelect?.(d.genre)}
                    title={`Show ${d.genre} books`}
                  />
                </li>
              ))}
              {othersVisible && (
                <>
                  <li className="min-w-0 min-[440px]:col-span-2">
                    <LegendButton
                      color={OTHERS_COLOR}
                      label={<>Others <span className="text-slate-400">({others.length} genres)</span></>}
                      count={othersTotal}
                      share={pct(othersTotal)}
                      state={hovered && othersGenres.has(hovered) ? 'active' : stateOf(OTHERS_KEY)}
                      onHover={() => lightSlice(OTHERS_KEY)}
                      onLeave={clearSlice}
                      onClick={() => setOthersOpen((o) => !o)}
                      aria-expanded={othersOpen}
                      aria-controls={othersListId}
                    >
                      <svg
                        className={`h-3.5 w-3.5 flex-shrink-0 text-slate-400 transition-transform motion-reduce:transition-none ${othersOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </LegendButton>
                  </li>
                  <li className="min-w-0 min-[440px]:col-span-2" hidden={!othersOpen}>
                    <ul
                      id={othersListId}
                      className="ml-3 grid grid-cols-1 gap-x-4 gap-y-0.5 border-l border-border pl-2 min-[440px]:grid-cols-2"
                      aria-label="Genres grouped in Others"
                    >
                      {others.map((d) => (
                        <li key={d.genre} className="min-w-0">
                          {/* A grouped genre lights up the Others slice it belongs to */}
                          <LegendButton
                            color={getGenreAccent(d.genre)}
                            label={d.genre}
                            count={d.count}
                            share={pct(d.count)}
                            state={hovered === d.genre ? 'active' : hovered && !othersGenres.has(hovered) && hovered !== OTHERS_KEY ? 'dim' : 'idle'}
                            onHover={() => { lightSlice(OTHERS_KEY); setHovered(d.genre); }}
                            onLeave={clearSlice}
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
            {collapsible && (
              <button
                type="button"
                onClick={() => setShowAll((s) => !s)}
                aria-expanded={showAll}
                aria-controls={legendId}
                className="mt-1 inline-flex min-h-[30px] items-center gap-1 rounded-lg px-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {showAll ? 'Show fewer' : `Show all (${entries})`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
