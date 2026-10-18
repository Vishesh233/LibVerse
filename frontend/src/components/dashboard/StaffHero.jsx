import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Skeleton } from '../UI';
import { EChart, CHART_THEME } from '../analytics/EChart';
import { DASH_ICONS, greetingFor } from './DashboardKit';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const shortDay = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

// Pill tones: text >= 4.5:1 on the hero's darkest mesh colour (#0A1230) in every state
const PILL_TONES = {
  cyan: { ring: 'rgba(34,211,238,0.45)', glow: 'rgba(34,211,238,0.35)', text: 'text-cyan-100', count: 'text-cyan-200', dot: 'bg-cyan-300' },
  rose: { ring: 'rgba(251,113,133,0.5)', glow: 'rgba(251,113,133,0.38)', text: 'text-rose-100', count: 'text-rose-200', dot: 'bg-rose-300' },
  amber: { ring: 'rgba(251,191,36,0.45)', glow: 'rgba(251,191,36,0.32)', text: 'text-amber-100', count: 'text-amber-200', dot: 'bg-amber-300' },
};

/** A glowing pill link with a count; the glow is only on when the count is above 0 */
const HeroPill = ({ to, label, count, tone, loading }) => {
  const t = PILL_TONES[tone];
  const lit = !loading && count > 0;
  return (
    <Link
      to={to}
      className={`staff-hero__pill group inline-flex min-h-[44px] items-center gap-2.5 rounded-full border bg-slate-950/55 px-3.5 py-1.5 text-sm font-semibold transition-colors hover:bg-slate-900/80 ${t.text}`}
      style={{ borderColor: lit ? t.ring : 'rgba(255,255,255,0.14)', boxShadow: lit ? `0 0 0 1px ${t.ring} inset, 0 0 22px ${t.glow}` : undefined }}
    >
      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${lit ? `${t.dot} staff-hero__pulse` : 'bg-slate-500'}`} aria-hidden="true" />
      <span>{label}</span>
      {loading ? (
        <Skeleton className="h-5 w-6" />
      ) : (
        <span className={`min-w-[1.75rem] rounded-full bg-white/10 px-2 py-0.5 text-center font-display text-sm font-bold tabular-nums ${lit ? t.count : 'text-slate-200'}`}>{count}</span>
      )}
      <span className="text-slate-400 transition-colors group-hover:text-slate-200" aria-hidden="true">{DASH_ICONS.chevron}</span>
    </Link>
  );
};

/** Loans issued per day, last 14 days (server issuedDaily); tooltip per day */
const IssuedSparkline = ({ daily }) => {
  const total = daily.reduce((s, d) => s + d.count, 0);
  const today = daily[daily.length - 1]?.count ?? 0;
  const option = useMemo(() => ({
    grid: { left: 2, right: 2, top: 6, bottom: 2 },
    tooltip: {
      ...CHART_THEME.tooltip,
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(148,163,184,0.45)' } },
      formatter: (p) => `${shortDay(daily[p[0].dataIndex].date)}<br/><strong>${plural(p[0].value, 'loan')}</strong> issued`,
    },
    xAxis: { type: 'category', show: false, boundaryGap: false, data: daily.map((d) => d.date) },
    yAxis: { type: 'value', show: false, min: 0, minInterval: 1 },
    series: [{
      type: 'line',
      data: daily.map((d) => d.count),
      smooth: 0.35,
      symbol: 'circle',
      symbolSize: (v, p) => (p.dataIndex === daily.length - 1 ? 7 : 0),
      showSymbol: true,
      lineStyle: { width: 2.5, color: '#22D3EE', shadowBlur: 10, shadowColor: 'rgba(34,211,238,0.55)' },
      itemStyle: { color: '#67E8F9', borderColor: '#0A1230', borderWidth: 2 },
      areaStyle: {
        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(34,211,238,0.32)' }, { offset: 1, color: 'rgba(34,211,238,0)' }] },
      },
    }],
  }), [daily]);
  const busiest = daily.reduce((b, d) => (d.count > (b?.count ?? -1) ? d : b), null);
  const summary = `Loans issued per day over the last 14 days: ${total} in total, ${today} today${
    busiest && busiest.count ? `, busiest ${shortDay(busiest.date)} with ${busiest.count}` : ''}.`;
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/45 px-3.5 pb-2 pt-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">Loans issued · 14 days</p>
        <p className="whitespace-nowrap text-xs text-slate-300">
          <span className="font-display text-base font-bold text-slate-50">{total}</span> total · {today} today
        </p>
      </div>
      <EChart option={option} summary={summary} height={64} className="mt-1" />
    </div>
  );
};

/**
 * Staff (librarian / admin) hero: a "control room" banner, different from the student hero.
 * Every number comes from GET /admin/dashboard. Background: a slow gradient mesh (static with
 * reduced motion); all text is light on the darkest mesh colour (>= 4.5:1).
 */
export const StaffHero = ({ base, firstName, loading, waiting, waitingTab, overdue, dueToday, issuedDaily = [], onIssue, onAddBook }) => {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const allGood = waiting === 0 && overdue === 0;
  const chip = allGood
    ? { label: 'All good', cls: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100', dot: 'bg-emerald-300' }
    : overdue > 0
      ? { label: 'Needs attention', cls: 'border-rose-400/45 bg-rose-500/15 text-rose-100', dot: 'bg-rose-300' }
      : { label: 'Needs attention', cls: 'border-amber-400/45 bg-amber-500/15 text-amber-100', dot: 'bg-amber-300' };
  const detail = allGood
    ? 'Nothing waiting and nothing overdue.'
    : [waiting > 0 && `${plural(waiting, 'request')} waiting`, overdue > 0 && `${plural(overdue, 'loan')} overdue`].filter(Boolean).join(' · ');

  return (
    <section aria-labelledby="staff-hero-title" className="staff-hero relative isolate overflow-hidden rounded-[24px] border border-white/10">
      <div className="staff-hero__mesh" aria-hidden="true">
        <span className="staff-hero__blob staff-hero__blob--a" />
        <span className="staff-hero__blob staff-hero__blob--b" />
        <span className="staff-hero__blob staff-hero__blob--c" />
        <span className="staff-hero__grid" />
      </div>

      <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-center lg:gap-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">{today}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 id="staff-hero-title" className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
              {greetingFor()}{firstName ? `, ${firstName}` : ''}
            </h1>
            {loading ? (
              <Skeleton className="h-7 w-32 !rounded-full" />
            ) : (
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${chip.cls}`} role="status">
                <span className={`h-2 w-2 rounded-full ${chip.dot} ${allGood ? '' : 'staff-hero__pulse'}`} aria-hidden="true" />
                {chip.label}
              </span>
            )}
          </div>
          {!loading && <p className="mt-1.5 text-sm text-slate-200">{detail}</p>}

          <nav className="mt-4 flex flex-wrap gap-2.5" aria-label="Needs attention">
            <HeroPill to={`${base}/pending?tab=${waitingTab}`} label="Requests waiting" count={waiting} tone="cyan" loading={loading} />
            <HeroPill to={`${base}/reports#rep-overdue`} label="Overdue now" count={overdue} tone="rose" loading={loading} />
            <HeroPill to={`${base}/issue-return?tab=return`} label="Due today" count={dueToday} tone="amber" loading={loading} />
          </nav>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          {loading ? <Skeleton className="h-[104px] w-full !rounded-2xl" /> : <IssuedSparkline daily={issuedDaily} />}
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button fullWidth={false} onClick={onAddBook} className="flex-1 lg:flex-none">
              {DASH_ICONS.plus}
              Add book
            </Button>
            <Button fullWidth={false} variant="secondary" onClick={onIssue} className="flex-1 lg:flex-none">
              {DASH_ICONS.book}
              Issue book
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaffHero;
