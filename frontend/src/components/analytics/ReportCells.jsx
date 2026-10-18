import React from 'react';
import { Badge } from '../UI';
import { formatRupees } from '../dashboard/DashboardKit';

/** "18 Oct" (the year only when it is not this year); "—" for no date */
export const shortDay = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) });
};
export const fullDay = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

export const Muted = () => <span className="text-slate-500" aria-label="none">—</span>;

/** Date cell: short on screen, the full date in a tooltip */
export const DayCell = ({ value }) => (value ? <span className="whitespace-nowrap" title={fullDay(value)}>{shortDay(value)}</span> : <Muted />);

/** Student on one line: name, then the Library ID muted and truncated (full text in a tooltip) */
export const PersonCell = ({ name, libraryId }) => (
  <span className="flex min-w-0 max-w-[240px] items-baseline gap-1.5" title={libraryId ? `${name} · ${libraryId}` : name}>
    <span className="truncate font-medium text-slate-100">{name}</span>
    {libraryId && <span className="min-w-0 truncate font-mono text-[11px] text-slate-500">{libraryId}</span>}
  </span>
);

/** Plain-text version of the fine cell (search, tooltips, tests) */
export const fineText = ({ fine = 0, waived = 0, payable = 0, paid }) => {
  if (!fine && !waived) return '—';
  const parts = [formatRupees(fine)];
  if (waived > 0) parts.push(`${formatRupees(waived)} waived`);
  if (paid > 0) parts.push(`${formatRupees(paid)} paid`);
  if (payable > 0) parts.push(`${formatRupees(payable)} due`);
  return parts.join(' · ');
};

/** One "Fine" cell instead of Fine / Waived / Payable: "₹25 · ₹10 waived · ₹15 due"; zero is a muted "—" */
export const FineCell = ({ fine = 0, waived = 0, payable = 0, paid }) => {
  if (!fine && !waived) return <Muted />;
  return (
    <span className="whitespace-nowrap tabular-nums" title={fineText({ fine, waived, payable, paid })}>
      <span className="font-semibold text-slate-100">{formatRupees(fine)}</span>
      {waived > 0 && <span className="text-sky-300"> · {formatRupees(waived)} waived</span>}
      {paid > 0 && <span className="text-emerald-300"> · {formatRupees(paid)} paid</span>}
      {payable > 0 && <span className="text-rose-300"> · {formatRupees(payable)} due</span>}
    </span>
  );
};

/** Right-aligned number, a muted "—" for 0 when `zeroDash` */
export const NumCell = ({ value, zeroDash = false }) => (zeroDash && !value ? <Muted /> : <span className="tabular-nums">{Number(value || 0).toLocaleString('en-IN')}</span>);

const LOAN_BADGES = {
  issued: ['primary', 'On loan'],
  return_requested: ['info', 'Return requested'],
  payment_pending: ['warning', 'Payment pending'],
  returned: ['success', 'Returned'],
  pending: ['neutral', 'Requested'],
  rejected: ['danger', 'Rejected'],
};
export const LOAN_STATUS_TEXT = Object.fromEntries(Object.entries(LOAN_BADGES).map(([k, v]) => [k, v[1]]));

/** Loan status badge; an issued loan past its due date shows "Overdue" */
export const LoanStatusBadge = ({ status, overdue = false }) => {
  if (status === 'issued' && overdue) return <Badge variant="danger">Overdue</Badge>;
  const [variant, label] = LOAN_BADGES[status] || ['neutral', status];
  return <Badge variant={variant} className="whitespace-nowrap">{label}</Badge>;
};

export const fineStatusVariant = (status) =>
  status.startsWith('Paid') ? 'success' : status === 'Waived' ? 'info' : status === 'Growing' ? 'warning' : 'danger';
export const FineStatusBadge = ({ status }) => <Badge variant={fineStatusVariant(status)} className="whitespace-nowrap">{status}</Badge>;

/** Summary card above a report table */
export const SummaryCard = ({ label, value, hint, tone = 'text-slate-50' }) => (
  <div className="report-summary min-w-0 rounded-2xl border border-border bg-white/[0.03] p-3.5">
    <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-muted">{label}</p>
    <p className={`mt-1 truncate font-display text-2xl font-bold leading-tight tabular-nums ${tone}`}>{value}</p>
    {hint && <p className="mt-0.5 truncate text-[11px] text-slate-400" title={hint}>{hint}</p>}
  </div>
);
