import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Skeleton } from '../UI';

/**
 * Shared dashboard building blocks (student, librarian and admin dashboards).
 * Dark glass cards and the existing tokens only.
 */

const svg = (d, extra = {}) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...extra}>
    {[].concat(d).map((p) => <path key={p} d={p} />)}
  </svg>
);

export const DASH_ICONS = {
  book: svg('M12 6.25v13m0-13C10.83 5.48 9.25 5 7.5 5S4.17 5.48 3 6.25v13C4.17 18.48 5.75 18 7.5 18s3.33.48 4.5 1.25m0-13C13.17 5.48 14.75 5 16.5 5s3.33.48 4.5 1.25v13C19.83 18.48 18.25 18 16.5 18s-3.33.48-4.5 1.25'),
  clock: svg('M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'),
  alert: svg(['M12 9v3.75m0 3.75h.008', 'M10.34 3.94 2.6 17.25A1.88 1.88 0 0 0 4.22 20.1h15.56a1.88 1.88 0 0 0 1.62-2.85L13.66 3.94a1.88 1.88 0 0 0-3.32 0Z']),
  card: svg('M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z'),
  heart: svg('M21 8.25c0-2.49-2.1-4.5-4.69-4.5-1.93 0-3.6 1.13-4.31 2.73-.72-1.6-2.38-2.73-4.31-2.73C5.1 3.75 3 5.76 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z'),
  inbox: svg(['M2.25 13.5h3.86a2.25 2.25 0 0 1 2.01 1.24l.27.53a2.25 2.25 0 0 0 2.01 1.24h3.2a2.25 2.25 0 0 0 2.01-1.24l.27-.53a2.25 2.25 0 0 1 2.01-1.24h3.86', 'M2.25 13.5V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.5M2.25 13.5 4.6 5.5A2.25 2.25 0 0 1 6.76 3.9h10.48a2.25 2.25 0 0 1 2.16 1.6l2.35 8']),
  check: svg('M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'),
  x: svg('m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'),
  send: svg('M6 12 3.27 3.13a59.77 59.77 0 0 1 18.22 8.87 59.77 59.77 0 0 1-18.22 8.88L6 12Zm0 0h7.5'),
  undo: svg('M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3'),
  search: svg('m21 21-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z'),
  bell: svg('M14.86 17.08a23.85 23.85 0 0 0 5.45-1.31A8.97 8.97 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.97 8.97 0 0 1-2.31 6.02c1.73.64 3.56 1.09 5.45 1.31m5.72 0a24.26 24.26 0 0 1-5.72 0m5.72 0a3 3 0 1 1-5.72 0'),
  plus: svg('M12 4.5v15m7.5-7.5h-15'),
  userPlus: svg('M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.13a3.38 3.38 0 1 1-6.75 0 3.38 3.38 0 0 1 6.75 0ZM3 19.24v-.11a6.38 6.38 0 0 1 12.75 0v.11A12.32 12.32 0 0 1 9.37 21c-2.33 0-4.51-.64-6.37-1.76Z'),
  chart: svg('M3 13.13C3 12.5 3.5 12 4.13 12h2.25c.62 0 1.12.5 1.12 1.13v6.75C7.5 20.5 7 21 6.38 21H4.13C3.5 21 3 20.5 3 19.88v-6.75ZM9.75 8.63c0-.63.5-1.13 1.13-1.13h2.25c.62 0 1.12.5 1.12 1.13v11.25c0 .62-.5 1.12-1.12 1.12h-2.25c-.63 0-1.13-.5-1.13-1.12V8.63ZM16.5 4.13c0-.63.5-1.13 1.13-1.13h2.25C20.5 3 21 3.5 21 4.13v15.75c0 .62-.5 1.12-1.12 1.12h-2.25c-.63 0-1.13-.5-1.13-1.12V4.13Z'),
  library: svg('M3 21h18M5.25 21V9.75m4.5 11.25V9.75m4.5 11.25V9.75m4.5 11.25V9.75M12 3 3 8.25h18L12 3Z'),
  chevron: svg('m8.25 4.5 7.5 7.5-7.5 7.5', { className: 'h-4 w-4' }),
};

/** Tone classes for icon tiles (light tints that read on the dark theme) */
export const TONES = {
  indigo: 'border-indigo-400/25 bg-indigo-500/10 text-indigo-300',
  cyan: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300',
  amber: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  rose: 'border-rose-400/25 bg-rose-500/10 text-rose-300',
  emerald: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300',
  violet: 'border-violet-400/25 bg-violet-500/10 text-violet-300',
  slate: 'border-white/10 bg-white/5 text-slate-300',
};

export const IconTile = ({ icon, tone = 'indigo', className = 'h-11 w-11' }) => (
  <span className={`grid flex-shrink-0 place-items-center rounded-2xl border ${TONES[tone] || TONES.indigo} ${className}`} aria-hidden="true">
    {icon}
  </span>
);

/** A dashboard block: glass card with a title row (optional subtitle and action) */
export const SectionCard = ({ title, subtitle, action, children, className = '', bodyClassName = '', id }) => (
  <Card variant="glass" id={id} className={`dash-section flex min-w-0 flex-col !p-5 ${className}`} aria-labelledby={id ? `${id}-title` : undefined} role={id ? 'region' : undefined}>
    {(title || action) && (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {title && <h2 id={id ? `${id}-title` : undefined} className="font-display text-lg font-semibold text-slate-100">{title}</h2>}
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )}
    <div className={`min-w-0 flex-1 ${bodyClassName}`}>{children}</div>
  </Card>
);

/** Small text link used in section headers ("View all") */
export const SectionLink = ({ to, children }) => (
  <Link to={to} className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2 text-xs font-semibold text-indigo-300 transition-colors hover:bg-white/5 hover:text-white">
    {children}
    {DASH_ICONS.chevron}
  </Link>
);

/** Clickable KPI card: icon tile, label, value, hint and a chevron */
export const KpiLink = ({ to, label, value, hint, icon, tone = 'indigo', alert = false, loading = false }) => (
  <Link
    to={to}
    className={`card-glass group flex min-w-0 items-center gap-2.5 !p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/30 motion-reduce:hover:translate-y-0 sm:gap-3 sm:!p-4 ${
      alert ? '!border-rose-400/30' : ''
    }`}
  >
    <IconTile icon={icon} tone={tone} className="h-9 w-9 sm:h-11 sm:w-11" />
    <span className="min-w-0 flex-1">
      {/* Two-column phones: the label may wrap rather than be cut off */}
      <span className="block text-xs font-medium leading-tight text-slate-400 line-clamp-2 sm:truncate">{label}</span>
      {loading ? (
        <Skeleton className="mt-1 h-7 w-14" />
      ) : (
        <span className="block truncate font-display text-xl font-bold leading-tight text-slate-50 sm:text-2xl">{value}</span>
      )}
      {hint && !loading && <span className="block truncate text-[11px] text-muted">{hint}</span>}
    </span>
    <span className="hidden flex-shrink-0 text-slate-500 transition-colors group-hover:text-slate-200 sm:block">{DASH_ICONS.chevron}</span>
  </Link>
);

/** Segmented tabs (role=tablist); `tabs`: [{ key, label, count? }] */
export const DashTabs = ({ tabs, active, onChange, label, idPrefix }) => (
  <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-input/70 p-1" role="tablist" aria-label={label}>
    {tabs.map((t) => {
      const selected = active === t.key;
      return (
        <button
          key={t.key}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${t.key}`}
          aria-selected={selected}
          aria-controls={`${idPrefix}-panel`}
          onClick={() => onChange(t.key)}
          className={`flex min-h-[36px] flex-shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
            selected ? 'bg-indigo-500/20 text-white shadow-[0_0_0_1px_rgba(99,102,241,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          {t.label}
          {typeof t.count === 'number' && (
            <span className={`rounded-full px-1.5 text-[10px] font-bold ${selected ? 'bg-white/15' : 'bg-white/5'}`}>{t.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

/** Quick action tile (button or link); disabled tiles show `hint` */
export const QuickTile = ({ icon, label, hint, tone = 'indigo', onClick, to, disabled = false, loading = false }) => {
  const body = (
    <>
      <IconTile icon={icon} tone={disabled ? 'slate' : tone} className="h-10 w-10" />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-100">{loading ? 'Working...' : label}</span>
        {hint && <span className="block text-[11px] leading-snug text-slate-400">{hint}</span>}
      </span>
    </>
  );
  const cls = `flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-border bg-white/[0.03] p-3 text-left transition-colors ${
    disabled ? 'cursor-not-allowed opacity-70' : 'hover:border-indigo-400/30 hover:bg-white/[0.06]'
  }`;
  if (to && !disabled) return <Link to={to} className={cls}>{body}</Link>;
  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} aria-busy={loading || undefined} className={cls}>
      {body}
    </button>
  );
};

/**
 * Compact empty state for dashboard cards: an inline SVG icon in a tinted tile, a title and one
 * line of text, side by side (no tall empty card, no emoji). tone: a TONES key (emerald = success).
 */
export const CompactEmpty = ({ icon = DASH_ICONS.check, tone = 'emerald', title, message, action, role }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border px-3 py-3.5" role={role}>
    <IconTile icon={icon} tone={tone} className="h-10 w-10" />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      {message && <p className="text-xs leading-snug text-slate-400">{message}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

/** Amount row for fine summaries */
export const AmountStat = ({ label, value, tone = 'text-slate-50', hint }) => (
  <div className="amount-stat min-w-0 rounded-2xl border border-border bg-white/[0.03] p-3">
    <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-muted">{label}</p>
    <p className={`mt-1 font-display text-xl font-bold leading-tight ${tone}`}>{value}</p>
    {hint && <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{hint}</p>}
  </div>
);

export const formatRupees = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

export const greetingFor = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};
