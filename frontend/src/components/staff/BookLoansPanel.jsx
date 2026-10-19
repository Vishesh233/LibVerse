import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { transactionsAPI } from '../../services/api';
import { Avatar } from '../Avatar';
import { Badge, Skeleton } from '../UI';
import { CompactEmpty, DASH_ICONS, SectionCard, formatRupees } from '../dashboard/DashboardKit';
import { StockMeter } from './ServerTable';
import { calculateFine, getDaysOverdue } from '../../utils/fineCalculator';

const STATUS = {
  issued: { label: 'On loan', variant: 'primary' },
  return_requested: { label: 'Return requested', variant: 'info' },
  payment_pending: { label: 'Payment pending', variant: 'warning' },
};
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const shortDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const Stat = ({ label, children, hint }) => (
  <div className="rounded-xl border border-border bg-white/[0.03] px-4 py-3">
    <dt className="text-xs text-slate-400">{label}</dt>
    <dd className="mt-1 font-display text-xl font-semibold text-slate-50 tabular-nums">{children}</dd>
    {hint && <dd className="text-[11px] text-slate-500">{hint}</dd>}
  </div>
);

/** Staff book page: where the copies are and who has them */
export const BookLoansPanel = ({ book, queue, base }) => {
  const [state, setState] = useState({ loading: true, rows: [], error: null });

  useEffect(() => {
    const controller = new AbortController();
    transactionsAPI.getAllTransactions({ bookId: book._id, status: 'open', limit: 50 }, { signal: controller.signal })
      .then((r) => setState({ loading: false, rows: (r.data.transactions || []).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)), error: null }))
      .catch((err) => { if (err?.code !== 'ERR_CANCELED') setState({ loading: false, rows: [], error: 'Could not load the loans for this book.' }); });
    return () => controller.abort();
  }, [book._id, book.issuedCopies]);

  return (
    <SectionCard
      title="Copies & loans"
      subtitle="Where every copy is right now"
      action={<Link to={`${base}/books/labels?ids=${book._id}`} className="btn-secondary min-h-[36px] px-3 text-xs">Print QR label</Link>}
    >
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="On the shelf"><StockMeter available={book.availableCopies ?? 0} total={book.totalCopies ?? 0} /></Stat>
        <Stat label="On loan" hint={state.rows.some((t) => t.status === 'issued' && getDaysOverdue(t.dueDate) > 0) ? `${state.rows.filter((t) => t.status === 'issued' && getDaysOverdue(t.dueDate) > 0).length} overdue` : 'copies with students'}>{book.issuedCopies ?? 0}</Stat>
        <Stat label="Held for pickup" hint="ready reservations">{book.heldCopies ?? 0}</Stat>
        <Stat label="Waiting list" hint={<Link to={`${base}/pending?tab=reservations`} className="underline decoration-slate-600 underline-offset-2 hover:text-cyan-200">open queue</Link>}>{queue.waiting}</Stat>
      </dl>

      <h3 className="mt-5 text-sm font-semibold text-slate-200">Who has it</h3>
      <div className="mt-2">
        {state.loading ? (
          <Skeleton lines={2} className="h-12 w-full" />
        ) : state.error ? (
          <CompactEmpty icon={DASH_ICONS.alert} tone="rose" title="Couldn't load loans" message={state.error} role="alert" />
        ) : state.rows.length === 0 ? (
          <CompactEmpty icon={DASH_ICONS.check} tone="emerald" title="Every copy is in" message="Nobody has this book right now." />
        ) : (
          <ul className="divide-y divide-border/70 rounded-xl border border-border">
            {state.rows.map((t) => {
              const late = t.status === 'issued' ? getDaysOverdue(t.dueDate) : 0;
              const s = STATUS[t.status] || { label: t.status, variant: 'neutral' };
              const person = t.userId;
              return (
                <li key={t._id} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={person?.name || 'Deleted user'} size={8} className="flex-shrink-0" />
                    <div className="min-w-0">
                      {person?._id ? (
                        <Link to={`${base}/users/${person._id}`} className="block truncate text-sm font-medium text-slate-100 hover:text-indigo-200 hover:underline">{person.name}</Link>
                      ) : (
                        <p className="truncate text-sm font-medium text-slate-300">Deleted user</p>
                      )}
                      <p className="truncate font-mono text-xs text-slate-400">{person?.libraryId || '—'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Badge variant={s.variant}>{s.label}</Badge>
                    {late > 0 ? (
                      <Badge variant="danger">{plural(late, 'day')} late · {formatRupees(calculateFine(t.dueDate))}</Badge>
                    ) : (
                      <span className="text-xs text-slate-400">Due {shortDate(t.dueDate)}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SectionCard>
  );
};
