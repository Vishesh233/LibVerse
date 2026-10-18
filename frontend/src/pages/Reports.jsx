import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { Badge, Button, EmptyState, PageHeader } from '../components/UI';
import { SectionCard, SectionLink, formatRupees } from '../components/dashboard/DashboardKit';
import { RangePicker, useRangeParams } from '../components/analytics/RangePicker';
import { SortableTable } from '../components/analytics/SortableTable';
import { WaiveFineModal, waiverLoanFrom } from '../components/WaiveFineModal';
import { formatRangeLabel, toDayString } from '../utils/dateRange';
import { STAFF_ACTIVITY_ACTIONS, auditActionLabel } from '../constants/auditActions';
import { useAuth } from '../hooks/useAuth';

const STATUS_LABELS = {
  issued: 'On loan',
  return_requested: 'Return requested',
  payment_pending: 'Payment pending',
  returned: 'Returned',
};
const AGING_LABELS = { '1-7': '1–7 days', '8-30': '8–30 days', '31+': '31+ days' };

const day = (d) => (d ? toDayString(new Date(d)) : '');
const shortDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const time = (d) => (d ? new Date(d).getTime() : null);

const Person = ({ name, libraryId }) => (
  <span>
    <span className="font-medium text-slate-100">{name}</span>
    {libraryId && <span className="block text-[11px] text-slate-500">{libraryId}</span>}
  </span>
);

const fineTone = (status) =>
  status.startsWith('Paid') ? 'success' : status === 'Waived' ? 'info' : status === 'Growing' ? 'warning' : 'danger';

const NoRows = ({ message }) => <EmptyState bare icon="📭" title="No rows" message={message} />;

export const Reports = () => {
  const { isAdmin, isLibrarian } = useAuth();
  const canAccess = isAdmin || isLibrarian;
  const base = isAdmin ? '/admin' : '/librarian';
  const { range, setPreset, setCustom } = useRangeParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [waiving, setWaiving] = useState(null);

  useEffect(() => {
    if (!canAccess) return undefined;
    const controller = new AbortController();
    setLoading(true);
    adminAPI
      .getReports({ from: range.from, to: range.to }, { signal: controller.signal })
      .then((res) => {
        setData(res.data.reports);
        setError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.response?.data?.message || 'We couldn’t load the reports right now.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [canAccess, range.from, range.to, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  const fileName = (name) => `libverse-${name}-${range.from}-to-${range.to}.csv`;

  const columns = useMemo(() => ({
    loans: [
      { key: 'issued', label: 'Issued', value: (r) => time(r.issueDate), className: 'whitespace-nowrap', render: (r) => shortDate(r.issueDate), csv: (r) => day(r.issueDate) },
      { key: 'student', label: 'Student', value: (r) => r.student, render: (r) => <Person name={r.student} libraryId={r.libraryId} /> },
      { key: 'libraryId', label: 'Library ID', value: (r) => r.libraryId, screen: false, csv: (r) => r.libraryId },
      { key: 'book', label: 'Book', value: (r) => r.book, className: 'max-w-[220px]' },
      { key: 'genre', label: 'Genre', value: (r) => r.genre },
      { key: 'due', label: 'Due', value: (r) => time(r.dueDate), className: 'whitespace-nowrap', render: (r) => shortDate(r.dueDate), csv: (r) => day(r.dueDate) },
      { key: 'returned', label: 'Returned', value: (r) => time(r.returnDate), className: 'whitespace-nowrap', render: (r) => shortDate(r.returnDate), csv: (r) => day(r.returnDate) },
      { key: 'status', label: 'Status', value: (r) => STATUS_LABELS[r.status] || r.status },
      { key: 'late', label: 'Days late', value: (r) => r.daysLate, align: 'right' },
      { key: 'fine', label: 'Fine (₹)', value: (r) => r.fine, render: (r) => formatRupees(r.fine), align: 'right' },
      { key: 'waived', label: 'Waived (₹)', value: (r) => r.waived, render: (r) => formatRupees(r.waived), align: 'right' },
      { key: 'payable', label: 'Payable (₹)', value: (r) => r.payable, render: (r) => formatRupees(r.payable), align: 'right' },
    ],
    fines: [
      { key: 'fixed', label: 'Fine fixed', value: (r) => time(r.fixedOn), className: 'whitespace-nowrap', render: (r) => shortDate(r.fixedOn), csv: (r) => day(r.fixedOn) },
      { key: 'student', label: 'Student', value: (r) => r.student, render: (r) => <Person name={r.student} libraryId={r.libraryId} /> },
      { key: 'libraryId', label: 'Library ID', value: (r) => r.libraryId, screen: false, csv: (r) => r.libraryId },
      { key: 'book', label: 'Book', value: (r) => r.book, className: 'max-w-[200px]' },
      { key: 'fine', label: 'Fine (₹)', value: (r) => r.fine, render: (r) => formatRupees(r.fine), align: 'right' },
      { key: 'waived', label: 'Waived (₹)', value: (r) => r.waived, render: (r) => formatRupees(r.waived), align: 'right' },
      {
        key: 'reason',
        label: 'Waiver',
        value: (r) => r.waiverReason,
        render: (r) => (r.waived > 0 ? <span className="block max-w-[220px] text-xs"><span className="text-slate-400">{r.waivedBy || 'Staff'}, {shortDate(r.waivedOn)}:</span> {r.waiverReason}</span> : '—'),
        csv: (r) => r.waiverReason,
        csvLabel: 'Waiver reason',
      },
      { key: 'waivedBy', label: 'Waived by', value: (r) => r.waivedBy, screen: false, csv: (r) => r.waivedBy },
      { key: 'paid', label: 'Paid (₹)', value: (r) => r.paid, render: (r) => formatRupees(r.paid), align: 'right' },
      { key: 'paidOn', label: 'Paid on', value: (r) => time(r.paidOn), className: 'whitespace-nowrap', render: (r) => shortDate(r.paidOn), csv: (r) => day(r.paidOn) },
      { key: 'payable', label: 'Payable (₹)', value: (r) => r.payable, render: (r) => formatRupees(r.payable), align: 'right' },
      { key: 'status', label: 'Status', value: (r) => r.status, render: (r) => <Badge variant={fineTone(r.status)}>{r.status}</Badge> },
      {
        key: 'action',
        label: 'Action',
        value: (r) => (r.payable > 0 ? 1 : 0),
        csv: false,
        render: (r) => (r.payable > 0 ? (
          <button type="button" onClick={() => setWaiving(waiverLoanFrom(r))} className="btn-secondary min-h-[32px] whitespace-nowrap px-2.5 text-xs print:hidden">
            Waive fine
          </button>
        ) : null),
      },
    ],
    overdue: [
      { key: 'student', label: 'Student', value: (r) => r.student, render: (r) => <Person name={r.student} libraryId={r.libraryId} /> },
      { key: 'libraryId', label: 'Library ID', value: (r) => r.libraryId, screen: false, csv: (r) => r.libraryId },
      { key: 'book', label: 'Book', value: (r) => r.book, className: 'max-w-[240px]' },
      { key: 'issued', label: 'Issued', value: (r) => time(r.issueDate), className: 'whitespace-nowrap', render: (r) => shortDate(r.issueDate), csv: (r) => day(r.issueDate) },
      { key: 'due', label: 'Due', value: (r) => time(r.dueDate), className: 'whitespace-nowrap', render: (r) => shortDate(r.dueDate), csv: (r) => day(r.dueDate) },
      { key: 'days', label: 'Days overdue', value: (r) => r.daysOverdue, align: 'right' },
      { key: 'bucket', label: 'Aging', value: (r) => AGING_LABELS[r.bucket] || r.bucket },
      { key: 'fine', label: 'Fine so far (₹)', value: (r) => r.fine, render: (r) => formatRupees(r.fine), align: 'right' },
    ],
    topBooks: [
      { key: 'rank', label: 'Rank', value: (r) => r.rank, align: 'right' },
      { key: 'title', label: 'Title', value: (r) => r.title, className: 'max-w-[260px] font-medium text-slate-100' },
      { key: 'author', label: 'Author', value: (r) => r.author },
      { key: 'genre', label: 'Genre', value: (r) => r.genre },
      { key: 'loans', label: 'Loans', value: (r) => r.loans, align: 'right' },
      { key: 'borrowers', label: 'Borrowers', value: (r) => r.borrowers, align: 'right' },
    ],
  }), []);

  const staffColumns = useMemo(() => {
    const used = STAFF_ACTIVITY_ACTIONS.filter((a) => data?.staffActivity?.some((s) => s.counts[a]));
    return [
      { key: 'name', label: 'Staff member', value: (r) => r.name, className: 'font-medium text-slate-100' },
      { key: 'role', label: 'Role', value: (r) => (r.role ? r.role[0].toUpperCase() + r.role.slice(1) : '') },
      ...used.map((a) => ({ key: a, label: auditActionLabel(a), value: (r) => r.counts[a] || 0, align: 'right' })),
      { key: 'total', label: 'Total', value: (r) => r.total, align: 'right', className: 'font-semibold text-slate-100' },
    ];
  }, [data]);

  if (!canAccess) {
    return (
      <MainLayout>
        <EmptyState icon="🔒" title="Staff only" message="Reports are available to librarians and admins." />
      </MainLayout>
    );
  }

  const generated = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <MainLayout>
      <div className="print-report mx-auto max-w-7xl space-y-5 pb-10">
        {/* Print header (screen: hidden) */}
        <div className="hidden print:block">
          <p className="text-lg font-bold">LibVerse report</p>
          <p className="text-sm">Period: {formatRangeLabel(range)} · Generated {generated}</p>
        </div>

        <PageHeader
          title="Reports"
          subtitle="Loans, fines with waivers, overdue books, top books and staff activity for a period."
          className="!mb-0 print:hidden"
          actions={
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <SectionLink to={`${base}/analytics${window.location.search}`}>Charts</SectionLink>
              <Button fullWidth={false} variant="secondary" size="sm" onClick={() => window.print()} disabled={!data || loading}>
                Print / Save as PDF
              </Button>
            </div>
          }
        />

        <RangePicker range={range} onPreset={setPreset} onCustom={setCustom} />

        {error && !loading ? (
          <EmptyState icon="⚠️" title="Couldn't load the reports" message={error} action={<Button fullWidth={false} onClick={reload}>Try again</Button>} />
        ) : !data ? (
          <div className="space-y-5" aria-busy="true" aria-label="Loading reports">
            {[0, 1, 2].map((i) => <div key={i} className="skeleton h-64 w-full rounded-2xl" />)}
          </div>
        ) : (
          <div className={`space-y-5 transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading || undefined}>
            <SectionCard id="rep-loans" title="Loans" subtitle={`Loans issued in this period${data.loansTruncated ? ` · newest ${data.loans.length.toLocaleString('en-IN')} of ${data.loansTotal.toLocaleString('en-IN')} shown` : ''}`}>
              <SortableTable
                caption="Loans issued in this period"
                filename={fileName('loans')}
                columns={columns.loans}
                rows={data.loans}
                initialSort={{ key: 'issued', dir: 'desc' }}
                empty={<NoRows message="No books were issued in this period." />}
              />
            </SectionCard>

            <SectionCard id="rep-fines" title="Fines and waivers" subtitle={`Fines fixed, paid or waived in this period${data.finesTruncated ? ` · ${data.fines.length} of ${data.finesTotal} shown` : ''}`}>
              <SortableTable
                caption="Fines and waivers in this period"
                filename={fileName('fines')}
                columns={columns.fines}
                rows={data.fines}
                initialSort={{ key: 'fixed', dir: 'desc' }}
                empty={<NoRows message="No fines were fixed, paid or waived in this period." />}
              />
            </SectionCard>

            <SectionCard id="rep-overdue" title="Overdue now" subtitle="Issued loans past their due date today (not limited to the period)">
              <SortableTable
                caption="Overdue loans now"
                filename={fileName('overdue')}
                columns={columns.overdue}
                rows={data.overdue}
                initialSort={{ key: 'days', dir: 'desc' }}
                empty={<NoRows message="No loan is overdue right now." />}
              />
            </SectionCard>

            <div className="grid gap-5 xl:grid-cols-2">
              <SectionCard id="rep-top" title="Top borrowed books" subtitle="Loans issued in this period">
                <SortableTable
                  caption="Top borrowed books"
                  filename={fileName('top-books')}
                  columns={columns.topBooks}
                  rows={data.topBooks}
                  initialSort={{ key: 'rank', dir: 'asc' }}
                  empty={<NoRows message="No books were borrowed in this period." />}
                />
              </SectionCard>

              <SectionCard id="rep-staff" title="Staff activity" subtitle="Loan actions per staff member, from the audit log">
                <SortableTable
                  caption="Staff activity"
                  filename={fileName('staff-activity')}
                  columns={staffColumns}
                  rows={data.staffActivity.map((s) => ({ ...s, _id: s.actorId }))}
                  initialSort={{ key: 'total', dir: 'desc' }}
                  empty={<NoRows message="No staff actions were recorded in this period." />}
                />
              </SectionCard>
            </div>
          </div>
        )}
      </div>

      {waiving && <WaiveFineModal loan={waiving} onClose={() => setWaiving(null)} onWaived={reload} />}
    </MainLayout>
  );
};
