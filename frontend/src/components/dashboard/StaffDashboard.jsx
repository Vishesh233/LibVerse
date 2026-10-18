import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../../layouts/MainLayout';
import { adminAPI, transactionsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Badge, Button, EmptyState, Skeleton } from '../UI';
import { DashboardHero } from './DashboardHero';
import { IssueBookModal } from './IssueBookModal';
import { GenreDoughnut } from './GenreDoughnut';
import { WaiveFineModal, waiverLoanFrom } from '../WaiveFineModal';
import {
  AmountStat, DASH_ICONS, DashTabs, IconTile, KpiLink, QuickTile, SectionCard, SectionLink, formatRupees, greetingFor,
} from './DashboardKit';

// recentActivities[].status (labels from GET /admin/dashboard) -> icon + badge
const ACTIVITY_STYLE = {
  Pending: { icon: DASH_ICONS.inbox, tone: 'amber', badge: 'warning' },
  Issued: { icon: DASH_ICONS.book, tone: 'indigo', badge: 'primary' },
  'Return Requested': { icon: DASH_ICONS.undo, tone: 'cyan', badge: 'info' },
  'Payment Pending': { icon: DASH_ICONS.card, tone: 'amber', badge: 'warning' },
  Returned: { icon: DASH_ICONS.check, tone: 'emerald', badge: 'success' },
  Rejected: { icon: DASH_ICONS.x, tone: 'rose', badge: 'danger' },
};
const QUEUE_LIMIT = 5;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const RequestRow = ({ req, children, meta }) => (
  <li className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-indigo-500/10 text-sm font-bold text-indigo-300" aria-hidden="true">
        {req.initials || 'ST'}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-100">{req.bookTitle}</p>
        <p className="truncate text-xs text-slate-400">
          {req.studentName}
          {req.libraryId ? ` · ${req.libraryId}` : ''} · {req.requestTime}
        </p>
        {meta && <div className="mt-1 flex flex-wrap gap-1.5">{meta}</div>}
      </div>
    </div>
    <div className="flex flex-shrink-0 flex-wrap gap-2">{children}</div>
  </li>
);

/**
 * Librarian and admin dashboard. Every number comes from GET /admin/dashboard.
 * role: 'admin' | 'librarian' (route base; "Add user" only for admins)
 */
export const StaffDashboard = ({ role }) => {
  const base = role === 'admin' ? '/admin' : '/librarian';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queueTab, setQueueTab] = useState('issue');
  const [busy, setBusy] = useState(null); // "<action>:<transactionId>"
  const [sendingReminders, setSendingReminders] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [waiving, setWaiving] = useState(null); // loan whose fine is being waived

  const load = useCallback(async () => {
    try {
      const res = await adminAPI.getDashboard();
      if (res.data?.success) {
        setAnalytics(res.data.analytics);
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeIssue = useCallback(() => setIssueOpen(false), []);
  // Still owed after any waiver
  const payableOf = (req) => Number(req.payableFine ?? (req.finePaid ? 0 : req.fineAmount)) || 0;
  const waiveButton = (req) =>
    payableOf(req) > 0 ? (
      <Button variant="secondary" size="sm" fullWidth={false} disabled={!!busy} onClick={() => setWaiving(waiverLoanFrom(req))}>
        Waive fine
      </Button>
    ) : null;

  const runAction = async (key, call, success) => {
    setBusy(key);
    try {
      await call();
      toast.success(success);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      const res = await adminAPI.sendReminders();
      const count = Number(res.data?.count) || 0;
      if (count > 0) toast.success(res.data?.message || `Sent ${plural(count, 'reminder')}`);
      else toast.info(res.data?.message || 'No reminders due right now');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reminders');
    } finally {
      setSendingReminders(false);
    }
  };

  const a = analytics || {};
  const issueQueue = a.pendingRequests || [];
  const returnQueue = a.returnRequests || [];
  const paymentQueue = a.paymentPending || [];
  const waiting = issueQueue.length + returnQueue.length + paymentQueue.length;
  const fines = a.fineSummary || {};
  const activities = (a.recentActivities || []).slice(0, 6);
  const isLoading = loading && !analytics;
  const firstName = (user?.name || '').trim().split(/\s+/)[0];
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const queueTabs = [
    { key: 'issue', label: 'Issue', count: issueQueue.length },
    { key: 'return', label: 'Return', count: returnQueue.length },
    { key: 'payment', label: 'Payment', count: paymentQueue.length },
  ];
  const queueRows = { issue: issueQueue, return: returnQueue, payment: paymentQueue }[queueTab];
  const queueEmpty = {
    issue: 'No issue requests waiting.',
    return: 'No returns waiting for approval.',
    payment: 'No fine payments to verify.',
  }[queueTab];

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-5 pb-10">
        {/* Hero */}
        <DashboardHero compact titleId="staff-hero-title">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">{today}</p>
              <h1 id="staff-hero-title" className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
                {greetingFor()}{firstName ? `, ${firstName}` : ''}
              </h1>
              {isLoading ? (
                <Skeleton className="mt-2 h-4 w-64" />
              ) : (
                <p className="mt-1 text-sm text-slate-300">
                  {waiting || a.overdueBooks
                    ? `${plural(waiting, 'request')} waiting · ${plural(a.overdueBooks || 0, 'loan')} overdue`
                    : 'No requests waiting · nothing overdue'}
                </p>
              )}
            </div>
            <div className="flex flex-shrink-0 flex-wrap gap-2">
              <Button fullWidth={false} onClick={() => navigate(`${base}/books/add`)}>
                {DASH_ICONS.plus}
                Add book
              </Button>
              <Button fullWidth={false} variant="secondary" onClick={() => setIssueOpen(true)}>
                {DASH_ICONS.book}
                Issue book
              </Button>
            </div>
          </div>
        </DashboardHero>

        {error && !analytics ? (
          <EmptyState
            icon="⚠️"
            title="Unable to load the dashboard"
            message={error}
            action={<Button fullWidth={false} onClick={() => { setLoading(true); load(); }}>Try again</Button>}
          />
        ) : (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5" aria-busy={isLoading || undefined}>
              <KpiLink to={`${base}/books`} label="Total books" value={a.totalBooks ?? 0} hint="active titles" icon={DASH_ICONS.library} tone="indigo" loading={isLoading} />
              <KpiLink to={`${base}/issue-return`} label="Issued" value={a.issuedBooks ?? 0} hint={`${a.issuedToday ?? 0} issued today`} icon={DASH_ICONS.book} tone="emerald" loading={isLoading} />
              <KpiLink to={`${base}/reports`} label="Overdue" value={a.overdueBooks ?? 0} hint={fines.accruing ? `${formatRupees(fines.accruing)} accruing` : 'nothing overdue'} icon={DASH_ICONS.clock} tone="rose" alert={(a.overdueBooks || 0) > 0} loading={isLoading} />
              <KpiLink to={`${base}/pending`} label="Pending requests" value={waiting} hint={waiting ? 'issue, return and payment' : 'all caught up'} icon={DASH_ICONS.inbox} tone="cyan" loading={isLoading} />
              <KpiLink to={`${base}/reports`} label="Fines outstanding" value={formatRupees(fines.outstanding)} hint={`${formatRupees(fines.collected)} collected`} icon={DASH_ICONS.card} tone="amber" loading={isLoading} />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              {/* Requests queue */}
              <SectionCard
                id="requests-queue"
                className="xl:col-span-8"
                title="Requests queue"
                subtitle="Approve here or open the full list"
                action={<SectionLink to={`${base}/pending?tab=${queueTab}`}>Open all requests</SectionLink>}
              >
                <DashTabs tabs={queueTabs} active={queueTab} onChange={setQueueTab} label="Request type" idPrefix="queue" />
                <div id="queue-panel" role="tabpanel" aria-labelledby={`queue-tab-${queueTab}`} className="mt-2">
                  {isLoading ? (
                    <div className="pt-2"><Skeleton lines={3} className="h-12 w-full" /></div>
                  ) : queueRows.length === 0 ? (
                    <EmptyState bare icon="✅" title="All caught up" message={queueEmpty} />
                  ) : (
                    <ul className="divide-y divide-border">
                      {queueRows.slice(0, QUEUE_LIMIT).map((req) => {
                        if (queueTab === 'issue') {
                          return (
                            <RequestRow key={req._id} req={req}>
                              <Button variant="success" size="sm" fullWidth={false} loading={busy === `approve:${req._id}`} disabled={!!busy}
                                onClick={() => runAction(`approve:${req._id}`, () => transactionsAPI.approveIssueRequest(req._id), 'Request approved.')}>
                                Approve
                              </Button>
                              <Button variant="danger" size="sm" fullWidth={false} loading={busy === `reject:${req._id}`} disabled={!!busy}
                                onClick={() => runAction(`reject:${req._id}`, () => transactionsAPI.rejectIssueRequest(req._id), 'Request rejected.')}>
                                Reject
                              </Button>
                            </RequestRow>
                          );
                        }
                        if (queueTab === 'return') {
                          const payable = payableOf(req);
                          const fineDue = payable > 0;
                          const waived = Number(req.fineWaived) || 0;
                          return (
                            <RequestRow key={req._id} req={req}
                              meta={req.fineAmount > 0
                                ? <>
                                    <Badge variant={fineDue ? 'warning' : req.finePaid ? 'success' : 'info'}>
                                      {fineDue ? `Fine ${formatRupees(payable)} unpaid` : req.finePaid ? 'Fine paid' : 'Fine waived'}
                                    </Badge>
                                    {waived > 0 && <Badge variant="info">{formatRupees(waived)} waived</Badge>}
                                  </>
                                : <Badge variant="neutral">No fine</Badge>}>
                              <Button variant="success" size="sm" fullWidth={false} loading={busy === `return:${req._id}`} disabled={!!busy || fineDue}
                                title={fineDue ? 'The student must pay the fine first' : undefined}
                                onClick={() => runAction(`return:${req._id}`, () => transactionsAPI.approveReturn(req._id), 'Return approved.')}>
                                Approve return
                              </Button>
                              {waiveButton(req)}
                            </RequestRow>
                          );
                        }
                        return (
                          <RequestRow key={req._id} req={req}
                            meta={<>
                              <Badge variant="warning">{formatRupees(payableOf(req))}</Badge>
                              {Number(req.fineWaived) > 0 && <Badge variant="info">{formatRupees(req.fineWaived)} waived</Badge>}
                              <Badge variant={req.hasScreenshot ? 'primary' : 'neutral'}>{req.hasScreenshot ? 'Screenshot' : 'No screenshot'}</Badge>
                            </>}>
                            <Link to={`${base}/pending?tab=payment`} className="btn-secondary !min-h-[36px] !px-3 !py-1.5 !text-xs">Review</Link>
                            <Button variant="success" size="sm" fullWidth={false} loading={busy === `payment:${req._id}`} disabled={!!busy}
                              onClick={() => runAction(`payment:${req._id}`, () => transactionsAPI.approvePayment(req._id), 'Payment approved and book returned.')}>
                              Approve payment
                            </Button>
                            {waiveButton(req)}
                          </RequestRow>
                        );
                      })}
                    </ul>
                  )}
                  {!isLoading && queueRows.length > QUEUE_LIMIT && (
                    <p className="pt-2 text-xs text-slate-400">+{queueRows.length - QUEUE_LIMIT} more in the full list</p>
                  )}
                </div>
              </SectionCard>

              {/* Recent activity */}
              <SectionCard id="recent-activity" className="xl:col-span-4" title="Recent activity" subtitle="Latest loan updates">
                {isLoading ? (
                  <Skeleton lines={4} className="h-11 w-full" />
                ) : activities.length === 0 ? (
                  <EmptyState bare icon="🕘" title="No activity yet" message="Issues, returns and requests show up here." />
                ) : (
                  <ul className="space-y-3">
                    {activities.map((act, i) => {
                      const style = ACTIVITY_STYLE[act.status] || { icon: DASH_ICONS.bell, tone: 'slate', badge: 'neutral' };
                      return (
                        <li key={act._id || i} className="flex items-start gap-3">
                          <IconTile icon={style.icon} tone={style.tone} className="h-9 w-9 !rounded-xl" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-snug text-slate-200 line-clamp-2">
                              <span className="font-semibold text-slate-100">{act.name}</span> {act.action} “{act.book}”
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted">{act.time}</p>
                          </div>
                          <Badge variant={style.badge} className="flex-shrink-0">{act.status}</Badge>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </SectionCard>

              {/* Books by genre (left) with fines and quick actions stacked beside it */}
              <SectionCard
                id="books-by-genre"
                className="xl:col-span-7"
                title="Books by genre"
                subtitle="Active titles or real loans · select a genre to manage it"
                action={<SectionLink to={`${base}/books`}>All books</SectionLink>}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <Skeleton className="h-44 w-44 flex-shrink-0 !rounded-full" />
                    <Skeleton lines={6} className="h-5 w-full" />
                  </div>
                ) : (a.booksByGenre || []).every((g) => !g.count) ? (
                  <EmptyState bare icon="📚" title="No books yet" message="Add books to see the genre mix." />
                ) : (
                  <GenreDoughnut catalogue={a.booksByGenre} borrowed={a.borrowedByGenre} onSelect={(g) => navigate(`${base}/books?genre=${encodeURIComponent(g)}`)} />
                )}
              </SectionCard>

              <div className="flex min-w-0 flex-col gap-5 xl:col-span-5">
              {/* Fines summary */}
              <SectionCard id="fines-summary" title="Fines" subtitle="Collected, still owed and growing" action={<SectionLink to={`${base}/reports`}>Reports</SectionLink>}>
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <AmountStat label="Collected" value={formatRupees(fines.collected)} tone="text-emerald-300" hint="verified payments, net of waivers" />
                    <AmountStat label="Outstanding" value={formatRupees(fines.outstanding)} tone="text-rose-300"
                      hint={`${formatRupees(fines.outstandingFixed)} fixed · ${formatRupees(fines.accruing)} accruing`} />
                    <AmountStat label="Waived" value={formatRupees(fines.waived)} tone="text-pink-300" hint={`${fines.loansWithFines ?? 0} loans with fines`} />
                  </div>
                )}
              </SectionCard>

              {/* Quick actions */}
              <SectionCard id="quick-actions" className="flex-1" title="Quick actions">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <QuickTile icon={DASH_ICONS.plus} label="Add book" hint="New title in the catalogue" to={`${base}/books/add`} tone="indigo" />
                  <QuickTile icon={DASH_ICONS.book} label="Issue book" hint="Desk issue to a student" onClick={() => setIssueOpen(true)} tone="emerald" />
                  {role === 'admin' && <QuickTile icon={DASH_ICONS.userPlus} label="Add user" hint="Student, librarian or admin" to="/admin/users" tone="violet" />}
                  <QuickTile icon={DASH_ICONS.bell} label="Send reminders" hint="Due soon and overdue loans" onClick={handleSendReminders} loading={sendingReminders} tone="amber" />
                  <QuickTile icon={DASH_ICONS.chart} label="Reports" hint="Circulation and fines" to={`${base}/reports`} tone="cyan" />
                </div>
              </SectionCard>
              </div>
            </div>
          </>
        )}
      </div>

      <IssueBookModal open={issueOpen} onClose={closeIssue} onIssued={load} />
      {waiving && <WaiveFineModal loan={waiving} onClose={() => setWaiving(null)} onWaived={load} />}
    </MainLayout>
  );
};
