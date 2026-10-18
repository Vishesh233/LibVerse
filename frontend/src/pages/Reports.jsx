import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { Button, EmptyState, PageHeader } from '../components/UI';
import { CompactEmpty, SectionCard, SectionLink, formatRupees } from '../components/dashboard/DashboardKit';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { RangePicker, useRangeParams } from '../components/analytics/RangePicker';
import { DataTable } from '../components/analytics/DataTable';
import {
  DayCell, FineCell, FineStatusBadge, LOAN_STATUS_TEXT, LoanStatusBadge, Muted, NumCell, PersonCell, SummaryCard, fineText, shortDay,
} from '../components/analytics/ReportCells';
import { WaiveFineModal, waiverLoanFrom } from '../components/WaiveFineModal';
import { formatRangeLabel, toDayString } from '../utils/dateRange';
import { STAFF_ACTIVITY_ACTIONS, auditActionLabel } from '../constants/auditActions';
import { useAuth } from '../hooks/useAuth';

const TABS = [
  { key: 'loans', label: 'Loans', description: 'Loans issued in this period.' },
  { key: 'fines', label: 'Fines', description: 'Fines fixed, paid or waived in this period.' },
  { key: 'overdue', label: 'Overdue', description: 'Issued loans past their due date today (not limited to the period).' },
  { key: 'top', label: 'Top books', description: 'The most borrowed books in this period.' },
  { key: 'staff', label: 'Staff activity', description: 'Loan actions per staff member, from the audit log.' },
];
// Old section anchors (#rep-overdue, dashboard links before tabs) -> tab
const HASH_TABS = { 'rep-loans': 'loans', 'rep-fines': 'fines', 'rep-overdue': 'overdue', 'rep-top': 'top', 'rep-staff': 'staff' };
const AGING_LABELS = { '1-7': '1–7 days', '8-30': '8–30 days', '31+': '31+ days' };

const day = (d) => (d ? toDayString(new Date(d)) : '');
const time = (d) => (d ? new Date(d).getTime() : null);
const plural = (n, word) => `${n.toLocaleString('en-IN')} ${word}${n === 1 ? '' : 's'}`;

const NoRows = ({ message }) => <CompactEmpty tone="slate" title="Nothing to show" message={message} />;

export const Reports = () => {
  const { isAdmin, isLibrarian } = useAuth();
  const canAccess = isAdmin || isLibrarian;
  const base = isAdmin ? '/admin' : '/librarian';
  const { range, setPreset, setCustom } = useRangeParams();
  const [params, setParams] = useSearchParams();

  const requested = params.get('tab');
  const tab = TABS.some((t) => t.key === requested) ? requested : 'loans';
  const active = TABS.find((t) => t.key === tab);
  const setTab = useCallback((key) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    if (key === 'loans') next.delete('tab');
    else next.set('tab', key);
    return next;
  }, { replace: true }), [setParams]);

  // #rep-overdue and the other old anchors open the matching tab
  useEffect(() => {
    const fromHash = HASH_TABS[decodeURIComponent(window.location.hash.slice(1))];
    if (!fromHash) return;
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setTab(fromHash);
  }, [setTab]);

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
      { key: 'issued', label: 'Issued', value: (r) => time(r.issueDate), render: (r) => <DayCell value={r.issueDate} />, csv: (r) => day(r.issueDate), search: false },
      { key: 'student', label: 'Student', primary: true, value: (r) => r.student, searchText: (r) => `${r.student} ${r.libraryId}`, render: (r) => <PersonCell name={r.student} libraryId={r.libraryId} /> },
      { key: 'libraryId', label: 'Library ID', value: (r) => r.libraryId, screen: false },
      { key: 'book', label: 'Book', value: (r) => r.book, className: 'max-w-[240px] truncate', render: (r) => <span title={r.book}>{r.book}</span> },
      { key: 'genre', label: 'Genre', value: (r) => r.genre, screen: false },
      { key: 'due', label: 'Due', value: (r) => time(r.dueDate), render: (r) => <DayCell value={r.dueDate} />, csv: (r) => day(r.dueDate), search: false },
      { key: 'returned', label: 'Returned', value: (r) => time(r.returnDate), screen: false, csv: (r) => day(r.returnDate) },
      {
        key: 'status',
        label: 'Status',
        value: (r) => (r.status === 'issued' && r.daysLate > 0 ? 'Overdue' : LOAN_STATUS_TEXT[r.status] || r.status),
        render: (r) => (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <LoanStatusBadge status={r.status} overdue={r.daysLate > 0} />
            {r.returnDate && <span className="text-[11px] text-slate-500">{shortDay(r.returnDate)}</span>}
          </span>
        ),
      },
      { key: 'late', label: 'Days late', align: 'right', value: (r) => r.daysLate, render: (r) => <NumCell value={r.daysLate} zeroDash />, search: false },
      { key: 'fine', label: 'Fine', align: 'right', value: (r) => r.fine, searchText: fineText, render: (r) => <FineCell fine={r.fine} waived={r.waived} payable={r.payable} />, csv: (r) => r.fine, csvLabel: 'Fine (₹)' },
      { key: 'waived', label: 'Waived (₹)', value: (r) => r.waived, screen: false, search: false },
      { key: 'payable', label: 'Payable (₹)', value: (r) => r.payable, screen: false, search: false },
    ],
    fines: [
      { key: 'fixed', label: 'Fixed', value: (r) => time(r.fixedOn), render: (r) => <DayCell value={r.fixedOn} />, csv: (r) => day(r.fixedOn), csvLabel: 'Fine fixed', search: false },
      { key: 'student', label: 'Student', primary: true, value: (r) => r.student, searchText: (r) => `${r.student} ${r.libraryId}`, render: (r) => <PersonCell name={r.student} libraryId={r.libraryId} /> },
      { key: 'libraryId', label: 'Library ID', value: (r) => r.libraryId, screen: false },
      { key: 'book', label: 'Book', value: (r) => r.book, className: 'max-w-[220px] truncate', render: (r) => <span title={r.book}>{r.book}</span> },
      { key: 'fine', label: 'Fine', align: 'right', value: (r) => r.fine, searchText: fineText, render: (r) => <FineCell fine={r.fine} waived={r.waived} payable={r.payable} />, csv: (r) => r.fine, csvLabel: 'Fine (₹)' },
      { key: 'waived', label: 'Waived (₹)', value: (r) => r.waived, screen: false, search: false },
      {
        key: 'reason',
        label: 'Waiver',
        value: (r) => r.waiverReason,
        className: 'max-w-[200px]',
        render: (r) => (r.waived > 0
          ? <span className="block truncate text-xs" title={`${r.waivedBy || 'Staff'}, ${shortDay(r.waivedOn)}: ${r.waiverReason}`}><span className="text-slate-400">{r.waivedBy || 'Staff'}:</span> {r.waiverReason}</span>
          : <Muted />),
        csvLabel: 'Waiver reason',
      },
      { key: 'waivedBy', label: 'Waived by', value: (r) => r.waivedBy, screen: false },
      { key: 'paid', label: 'Paid', align: 'right', value: (r) => r.paid, render: (r) => (r.paid > 0 ? <span className="whitespace-nowrap"><span className="text-emerald-300">{formatRupees(r.paid)}</span> <span className="text-[11px] text-slate-500">{shortDay(r.paidOn)}</span></span> : <Muted />), csvLabel: 'Paid (₹)', search: false },
      { key: 'paidOn', label: 'Paid on', value: (r) => time(r.paidOn), screen: false, csv: (r) => day(r.paidOn), search: false },
      { key: 'payable', label: 'Payable (₹)', value: (r) => r.payable, screen: false, search: false },
      { key: 'status', label: 'Status', value: (r) => r.status, render: (r) => <FineStatusBadge status={r.status} /> },
      {
        key: 'action',
        label: 'Action',
        value: (r) => (r.payable > 0 ? 1 : 0),
        csv: false,
        search: false,
        render: (r) => (r.payable > 0 ? (
          <button type="button" onClick={() => setWaiving(waiverLoanFrom(r))} className="btn-secondary min-h-[30px] whitespace-nowrap px-2.5 text-xs print:hidden">
            Waive fine
          </button>
        ) : null),
      },
    ],
    overdue: [
      { key: 'student', label: 'Student', primary: true, value: (r) => r.student, searchText: (r) => `${r.student} ${r.libraryId}`, render: (r) => <PersonCell name={r.student} libraryId={r.libraryId} /> },
      { key: 'libraryId', label: 'Library ID', value: (r) => r.libraryId, screen: false },
      { key: 'book', label: 'Book', value: (r) => r.book, className: 'max-w-[260px] truncate', render: (r) => <span title={r.book}>{r.book}</span> },
      { key: 'issued', label: 'Issued', value: (r) => time(r.issueDate), render: (r) => <DayCell value={r.issueDate} />, csv: (r) => day(r.issueDate), search: false },
      { key: 'due', label: 'Due', value: (r) => time(r.dueDate), render: (r) => <DayCell value={r.dueDate} />, csv: (r) => day(r.dueDate), search: false },
      { key: 'days', label: 'Days overdue', align: 'right', value: (r) => r.daysOverdue, render: (r) => <span className={`font-semibold tabular-nums ${r.daysOverdue > 30 ? 'text-rose-300' : 'text-amber-200'}`}>{r.daysOverdue}</span>, search: false },
      { key: 'bucket', label: 'Aging', value: (r) => AGING_LABELS[r.bucket] || r.bucket },
      { key: 'fine', label: 'Fine so far', align: 'right', value: (r) => r.fine, render: (r) => <span className="tabular-nums text-rose-200">{formatRupees(r.fine)}</span>, csvLabel: 'Fine so far (₹)', search: false },
    ],
    top: [
      { key: 'rank', label: 'Rank', align: 'right', value: (r) => r.rank, search: false },
      { key: 'title', label: 'Title', primary: true, value: (r) => r.title, className: 'max-w-[300px] truncate font-medium text-slate-100', render: (r) => <span title={r.title}>{r.title}</span> },
      { key: 'author', label: 'Author', value: (r) => r.author },
      { key: 'genre', label: 'Genre', value: (r) => r.genre },
      { key: 'loans', label: 'Loans', align: 'right', value: (r) => r.loans, search: false },
      { key: 'borrowers', label: 'Borrowers', align: 'right', value: (r) => r.borrowers, search: false },
    ],
  }), []);

  const staffColumns = useMemo(() => {
    const used = STAFF_ACTIVITY_ACTIONS.filter((a) => data?.staffActivity?.some((s) => s.counts[a]));
    return [
      { key: 'name', label: 'Staff member', primary: true, value: (r) => r.name, className: 'font-medium text-slate-100' },
      { key: 'role', label: 'Role', value: (r) => (r.role ? r.role[0].toUpperCase() + r.role.slice(1) : '') },
      ...used.map((a) => ({ key: a, label: auditActionLabel(a), value: (r) => r.counts[a] || 0, align: 'right', render: (r) => <NumCell value={r.counts[a]} zeroDash />, search: false })),
      { key: 'total', label: 'Total', value: (r) => r.total, align: 'right', className: 'font-semibold text-slate-100', search: false },
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
  const s = data?.summary;

  // Summary cards for the selected period (server totals over every matching row, not the page)
  const cards = !s ? [] : {
    loans: [
      { label: 'Loans issued', value: s.loans.total.toLocaleString('en-IN'), hint: 'in this period' },
      { label: 'On loan', value: s.loans.onLoan.toLocaleString('en-IN'), hint: 'not returned yet', tone: 'text-indigo-200' },
      { label: 'Returned', value: s.loans.returned.toLocaleString('en-IN'), hint: 'of these loans', tone: 'text-emerald-300' },
      { label: 'Overdue', value: s.loans.overdue.toLocaleString('en-IN'), hint: 'of these, past due today', tone: s.loans.overdue ? 'text-rose-300' : 'text-slate-50' },
    ],
    fines: [
      { label: 'Charged', value: formatRupees(s.fines.charged), hint: plural(s.fines.count, 'loan') },
      { label: 'Collected', value: formatRupees(s.fines.collected), hint: 'verified payments', tone: 'text-emerald-300' },
      { label: 'Waived', value: formatRupees(s.fines.waived), hint: 'with a recorded reason', tone: 'text-sky-300' },
      { label: 'Payable', value: formatRupees(s.fines.payable), hint: 'still owed', tone: s.fines.payable ? 'text-rose-300' : 'text-slate-50' },
    ],
    overdue: [
      { label: 'Overdue now', value: s.overdue.count.toLocaleString('en-IN'), hint: 'issued, past due', tone: s.overdue.count ? 'text-rose-300' : 'text-slate-50' },
      { label: 'Fines so far', value: formatRupees(s.overdue.fineSoFar), hint: 'still growing daily', tone: 'text-amber-200' },
      { label: 'Average', value: `${s.overdue.averageDays} d`, hint: 'days overdue' },
      { label: 'Over 30 days', value: s.overdue.over30.toLocaleString('en-IN'), hint: 'longest overdue', tone: s.overdue.over30 ? 'text-rose-300' : 'text-slate-50' },
    ],
    top: [
      { label: 'Loans', value: s.topBooks.loans.toLocaleString('en-IN'), hint: 'in this period' },
      { label: 'Titles borrowed', value: s.topBooks.titles.toLocaleString('en-IN'), hint: 'different books' },
      { label: 'Borrowers', value: s.topBooks.borrowers.toLocaleString('en-IN'), hint: 'different members' },
      { label: 'Top genre', value: s.topBooks.topGenre?.genre || '—', hint: s.topBooks.topGenre ? plural(s.topBooks.topGenre.loans, 'loan') : 'no loans' },
    ],
    staff: [
      { label: 'Staff actions', value: s.staff.actions.toLocaleString('en-IN'), hint: 'loan actions logged' },
      { label: 'Staff members', value: s.staff.members.toLocaleString('en-IN'), hint: 'with at least one action' },
      { label: 'Most active', value: s.staff.mostActive?.name || '—', hint: s.staff.mostActive ? plural(s.staff.mostActive.total, 'action') : 'no actions' },
    ],
  }[tab];

  const table = data && {
    loans: (
      <DataTable
        key="loans"
        caption="Loans issued in this period"
        filename={fileName('loans')}
        columns={columns.loans}
        rows={data.loans}
        initialSort={{ key: 'issued', dir: 'desc' }}
        searchPlaceholder="Search student, Library ID or book"
        empty={<NoRows message="No books were issued in this period." />}
      />
    ),
    fines: (
      <DataTable
        key="fines"
        caption="Fines and waivers in this period"
        filename={fileName('fines')}
        columns={columns.fines}
        rows={data.fines}
        initialSort={{ key: 'fixed', dir: 'desc' }}
        searchPlaceholder="Search student, book or waiver reason"
        empty={<NoRows message="No fines were fixed, paid or waived in this period." />}
      />
    ),
    overdue: (
      <DataTable
        key="overdue"
        caption="Overdue loans now"
        filename={fileName('overdue')}
        columns={columns.overdue}
        rows={data.overdue}
        initialSort={{ key: 'days', dir: 'desc' }}
        searchPlaceholder="Search student, Library ID or book"
        empty={<NoRows message="No loan is overdue right now." />}
      />
    ),
    top: (
      <DataTable
        key="top"
        caption="Top borrowed books"
        filename={fileName('top-books')}
        columns={columns.top}
        rows={data.topBooks}
        initialSort={{ key: 'rank', dir: 'asc' }}
        searchPlaceholder="Search title, author or genre"
        empty={<NoRows message="No books were borrowed in this period." />}
      />
    ),
    staff: (
      <DataTable
        key="staff"
        caption="Staff activity"
        filename={fileName('staff-activity')}
        columns={staffColumns}
        rows={data.staffActivity.map((r) => ({ ...r, _id: r.actorId }))}
        initialSort={{ key: 'total', dir: 'desc' }}
        searchPlaceholder="Search staff member"
        empty={<NoRows message="No staff actions were recorded in this period." />}
      />
    ),
  }[tab];

  const truncated = tab === 'loans' ? data?.loansTruncated && `Newest ${data.loans.length.toLocaleString('en-IN')} of ${data.loansTotal.toLocaleString('en-IN')} loans shown`
    : tab === 'fines' ? data?.finesTruncated && `${data.fines.length.toLocaleString('en-IN')} of ${data.finesTotal.toLocaleString('en-IN')} fines shown` : null;

  return (
    <MainLayout>
      <div className="print-report mx-auto max-w-7xl space-y-5 pb-10">
        {/* Print header (screen: hidden): the tab title and the period */}
        <div className="hidden print:block">
          <p className="text-lg font-bold">LibVerse report · {active.label}</p>
          <p className="text-sm">{tab === 'overdue' ? `Overdue on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}` : `Period: ${formatRangeLabel(range)}`} · Generated {generated}</p>
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

        <div className="print:hidden">
          <RangePicker range={range} onPreset={setPreset} onCustom={setCustom} />
        </div>

        <div className="print:hidden">
          <ProfileTabs tabs={TABS} active={tab} onChange={setTab} label="Report" idPrefix="report" />
        </div>

        {error && !loading ? (
          <EmptyState icon="⚠️" title="Couldn't load the reports" message={error} action={<Button fullWidth={false} onClick={reload}>Try again</Button>} />
        ) : !data ? (
          <div className="space-y-5" aria-busy="true" aria-label="Loading reports">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
            <div className="skeleton h-80 w-full rounded-2xl" />
          </div>
        ) : (
          <section
            id={`report-panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`report-tab-${tab}`}
            className={`space-y-4 transition-opacity ${loading ? 'opacity-60' : ''}`}
            aria-busy={loading || undefined}
          >
            <div className={`grid grid-cols-2 gap-3 ${cards.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
              {cards.map((c) => <SummaryCard key={c.label} {...c} />)}
            </div>
            <SectionCard id={`rep-${tab}`} title={active.label} subtitle={truncated ? `${active.description} ${truncated}.` : active.description}>
              {table}
            </SectionCard>
          </section>
        )}
      </div>

      {waiving && <WaiveFineModal loan={waiving} onClose={() => setWaiving(null)} onWaived={reload} />}
    </MainLayout>
  );
};
