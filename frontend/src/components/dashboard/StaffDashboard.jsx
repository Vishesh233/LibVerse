import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../../layouts/MainLayout';
import { adminAPI, transactionsAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Badge, Button, EmptyState, Skeleton } from '../UI';
import { StaffHero } from './StaffHero';
import { IssueBookModal } from './IssueBookModal';
import { GenreDoughnut } from './GenreDoughnut';
import { WaiveFineModal, waiverLoanFrom } from '../WaiveFineModal';
import {
  AmountStat, CompactEmpty, DASH_ICONS, DashTabs, IconTile, KpiLink, QuickTile, SectionCard, SectionLink, formatRupees,
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

/** One "Today at a glance" figure: a link with an icon, the count and a hint */
const GlanceLink = ({ to, icon, tone, label, value, hint, loading }) => (
  <Link to={to} className="group flex min-h-[64px] min-w-0 items-center gap-3 rounded-2xl border border-border bg-white/[0.03] p-3 transition-colors hover:border-indigo-400/30 hover:bg-white/[0.06]">
    <IconTile icon={icon} tone={value > 0 ? tone : 'slate'} className="h-10 w-10" />
    <span className="min-w-0 flex-1">
      <span className="block text-xs font-medium text-slate-400">{label}</span>
      {loading ? <Skeleton className="mt-1 h-6 w-10" /> : <span className="block font-display text-xl font-bold leading-tight text-slate-50">{value ?? 0}</span>}
      <span className="block truncate text-[11px] text-muted">{hint}</span>
    </span>
    <span className="flex-shrink-0 text-slate-500 transition-colors group-hover:text-slate-200" aria-hidden="true">{DASH_ICONS.chevron}</span>
  </Link>
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

  // First load: open the first queue that has something waiting (Issue -> Return -> Payment)
  const queuePicked = useRef(false);
  useEffect(() => {
    if (!analytics || queuePicked.current) return;
    queuePicked.current = true;
    const first = [
      ['issue', analytics.pendingRequests],
      ['return', analytics.returnRequests],
      ['payment', analytics.paymentPending],
    ].find(([, list]) => (list || []).length > 0);
    setQueueTab(first ? first[0] : 'issue');
  }, [analytics]);

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
  const firstQueueTab = issueQueue.length ? 'issue' : returnQueue.length ? 'return' : paymentQueue.length ? 'payment' : 'issue';

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
        {/* Hero: status, what needs attention, loans issued per day */}
        <StaffHero
          base={base}
          firstName={firstName}
          loading={isLoading}
          waiting={waiting}
          waitingTab={firstQueueTab}
          overdue={a.overdueBooks ?? 0}
          dueToday={a.dueToday ?? 0}
          issuedDaily={a.issuedDaily || []}
          onAddBook={() => navigate(`${base}/books/add`)}
          onIssue={() => setIssueOpen(true)}
        />

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
              {/* Overdue and waiting requests are in the hero pills, so the row shows other figures */}
              <KpiLink to={`${base}/pending?tab=reservations`} label="Active reservations" value={a.activeReservations ?? 0} hint={`${a.readyReservations ?? 0} ready for pickup`} icon={DASH_ICONS.clock} tone="violet" loading={isLoading} />
              <KpiLink to={`${base}/users`} label="Active members" value={a.activeMembers ?? 0} hint="borrowed in 30 days" icon={DASH_ICONS.userPlus} tone="cyan" loading={isLoading} />
              <KpiLink to={`${base}/reports`} label="Fines outstanding" value={formatRupees(fines.outstanding)} hint={`${formatRupees(fines.collected)} collected`} icon={DASH_ICONS.card} tone="amber" loading={isLoading} />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              {/* Requests queue with "Today at a glance" under it; the column ends level with Recent activity */}
              <div className="flex min-w-0 flex-col gap-5 xl:col-span-8">
              <SectionCard
                id="requests-queue"
                className="flex-1"
                title="Requests queue"
                subtitle="Approve here or open the full list"
                action={<SectionLink to={`${base}/pending?tab=${queueTab}`}>Open all requests</SectionLink>}
              >
                <DashTabs tabs={queueTabs} active={queueTab} onChange={setQueueTab} label="Request type" idPrefix="queue" />
                <div id="queue-panel" role="tabpanel" aria-labelledby={`queue-tab-${queueTab}`} className="mt-2">
                  {isLoading ? (
                    <div className="pt-2"><Skeleton lines={3} className="h-12 w-full" /></div>
                  ) : queueRows.length === 0 ? (
                    <div className="pt-2">
                      <CompactEmpty title="All caught up" message={queueEmpty} role="status" />
                    </div>
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

              {/* Today at a glance: real counts, each opens the matching list */}
              <SectionCard id="today-glance" title="Today at a glance">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <GlanceLink to={`${base}/issue-return?tab=return`} icon={DASH_ICONS.clock} tone="amber" label="Due today" value={a.dueToday} hint="issued loans due back today" loading={isLoading} />
                  <GlanceLink to={`${base}/reports#rep-overdue`} icon={DASH_ICONS.alert} tone="rose" label="Overdue now" value={a.overdueBooks} hint={fines.accruing ? `${formatRupees(fines.accruing)} in fines growing` : 'past their due date'} loading={isLoading} />
                  <GlanceLink to={`${base}/pending?tab=reservations`} icon={DASH_ICONS.book} tone="emerald" label="Ready for pickup" value={a.readyReservations} hint="reserved copies on hold" loading={isLoading} />
                </div>
              </SectionCard>
              </div>

              {/* Recent activity */}
              <SectionCard id="recent-activity" className="xl:col-span-4" title="Recent activity" subtitle="Latest loan updates">
                {isLoading ? (
                  <Skeleton lines={4} className="h-11 w-full" />
                ) : activities.length === 0 ? (
                  <CompactEmpty icon={DASH_ICONS.clock} tone="slate" title="No activity yet" message="Issues, returns and requests show up here." />
                ) : (
                  <ul className="-my-2.5 divide-y divide-border">
                    {activities.map((act, i) => {
                      const style = ACTIVITY_STYLE[act.status] || { icon: DASH_ICONS.bell, tone: 'slate', badge: 'neutral' };
                      return (
                        // Same height for every row: the text always takes two lines' space, then time + badge on one line
                        <li key={act._id || i} className="flex items-start gap-3 py-2.5">
                          <IconTile icon={style.icon} tone={style.tone} className="h-9 w-9 !rounded-xl" />
                          <div className="min-w-0 flex-1">
                            <p className="activity-text h-10 text-sm leading-5 text-slate-200 line-clamp-2 [overflow-wrap:anywhere]" title={`${act.name} ${act.action} “${act.book}”`}>
                              <span className="font-semibold text-slate-100">{act.name}</span> {act.action} “{act.book}”
                            </p>
                            <div className="activity-meta mt-1 flex items-center justify-between gap-2">
                              <span className="min-w-0 truncate text-[11px] text-muted">{act.time}</span>
                              <Badge variant={style.badge} className="flex-shrink-0 whitespace-nowrap">{act.status}</Badge>
                            </div>
                          </div>
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
                bodyClassName="flex flex-col"
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
                  <CompactEmpty icon={DASH_ICONS.library} tone="indigo" title="No books yet" message="Add books to see the genre mix." />
                ) : (
                  <GenreDoughnut catalogue={a.booksByGenre} borrowed={a.borrowedByGenre} onSelect={(g) => navigate(`${base}/books?genre=${encodeURIComponent(g)}`)} />
                )}
              </SectionCard>

              <div className="flex min-w-0 flex-col gap-5 xl:col-span-5">
              {/* Fines summary */}
              <SectionCard id="fines-summary" bodyClassName="fines-wrap" title="Fines" subtitle="Collected, still owed and growing" action={<SectionLink to={`${base}/reports`}>Reports</SectionLink>}>
                {isLoading ? (
                  <div className="fines-stats">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
                ) : (
                  <div className="fines-stats">
                    <AmountStat label="Collected" value={formatRupees(fines.collected)} tone="text-emerald-300" hint="verified payments, net of waivers" />
                    <AmountStat label="Outstanding" value={formatRupees(fines.outstanding)} tone="text-rose-300"
                      hint={`${formatRupees(fines.outstandingFixed)} fixed · ${formatRupees(fines.accruing)} accruing`} />
                    <AmountStat label="Waived" value={formatRupees(fines.waived)} tone="text-pink-300" hint={`${fines.loansWithFines ?? 0} loans with fines`} />
                  </div>
                )}
              </SectionCard>

              {/* Quick actions */}
              <SectionCard id="quick-actions" className="flex-1" bodyClassName="flex flex-col" title="Quick actions">
                {/* Tiles share the card's height (equal rows), so the column ends level with the genre card */}
                <div className="grid flex-1 auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2">
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
