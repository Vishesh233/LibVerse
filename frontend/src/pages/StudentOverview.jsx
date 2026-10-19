import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminAPI, deskAPI, reservationsAPI, transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { Badge, Button, EmptyState, Skeleton } from '../components/UI';
import { Avatar } from '../components/Avatar';
import { CoverImage } from '../components/CoverImage';
import { ConfirmModal } from '../components/ConfirmModal';
import { WaiveFineModal } from '../components/WaiveFineModal';
import { FlipCard } from '../components/LibraryCard';
import { IssueBookModal } from '../components/dashboard/IssueBookModal';
import { CompactEmpty, DASH_ICONS, SectionCard, formatRupees } from '../components/dashboard/DashboardKit';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { DayCell, FineCell, LoanStatusBadge, SummaryCard, shortDay } from '../components/analytics/ReportCells';
import { auditActionLabel } from '../constants/auditActions';
import { useAuth } from '../hooks/useAuth';

const ROLE_LABEL = { student: 'Student', librarian: 'Librarian', admin: 'Admin' };
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const memberSince = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

const RES_BADGE = {
  waiting: ['info', 'Waiting'],
  ready: ['success', 'Ready for pickup'],
  fulfilled: ['primary', 'Borrowed'],
  cancelled: ['neutral', 'Cancelled'],
  expired: ['warning', 'Expired'],
};

/** "Due in 3 days" / "Due today" / "4 days overdue" for an issued loan */
const dueLine = (l) => {
  if (l.status !== 'issued' || !l.dueDate) return l.dueDate ? `Due ${shortDay(l.dueDate)}` : '';
  if (l.daysOverdue > 0) return `${plural(l.daysOverdue, 'day')} overdue`;
  if (l.daysRemaining === 0) return 'Due today';
  return `Due ${shortDay(l.dueDate)} · in ${plural(l.daysRemaining, 'day')}`;
};

const BookThumb = ({ book }) => (
  <span className="h-14 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-input">
    <CoverImage book={{ title: book.title, imageUrl: book.cover }} src={book.cover} alt="" />
  </span>
);

/** One loan row (current loans, fines): book, status, due line, fine, renewals and actions */
const LoanRow = ({ loan, highlighted, actions, rowRef }) => (
  <li
    ref={rowRef}
    data-loan={loan._id}
    className={`flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center ${highlighted ? 'border-cyan-400/60 bg-cyan-400/[0.07] ring-1 ring-cyan-400/40' : 'border-border bg-white/[0.02]'}`}
  >
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <BookThumb book={loan.book} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-100" title={loan.book.title}>{loan.book.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
          <LoanStatusBadge status={loan.status} overdue={loan.daysOverdue > 0} />
          <span className={loan.daysOverdue > 0 ? 'font-semibold text-rose-300' : ''}>{dueLine(loan)}</span>
          {loan.status === 'issued' && <span>· renewed {loan.renewalCount}/{loan.maxRenewals}</span>}
        </div>
        <div className="mt-1 text-xs"><FineCell fine={loan.fine} waived={loan.waived} payable={loan.payable} paid={loan.paid} />{loan.fineGrowing && <span className="text-[11px] text-amber-200"> · growing</span>}</div>
      </div>
    </div>
    {actions && <div className="flex flex-shrink-0 flex-wrap gap-2">{actions}</div>}
  </li>
);

/**
 * Student 360 (staff): profile, stats, loans, history, fines, reservations and (admins) the audit
 * trail. Every action uses the existing endpoint and its rules, shows the server's message and
 * reloads the page data. ?tab= selects a tab, ?loan=<id> highlights a loan (global search).
 */
export const StudentOverview = () => {
  const { id } = useParams();
  const { isAdmin, isLibrarian } = useAuth();
  const base = isAdmin ? '/admin' : '/librarian';
  const [params, setParams] = useSearchParams();
  const highlightLoan = params.get('loan');

  const [state, setState] = useState({ loading: true, data: null, error: null, status: 200 });
  const [historyPage, setHistoryPage] = useState(1);
  const [busy, setBusy] = useState(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [waiving, setWaiving] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind: 'status'|'reissue' }
  const [card, setCard] = useState(null); // { loading, data, error, flipped }
  const highlightRef = useRef(null);

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setState((s) => ({ ...s, loading: true }));
    try {
      const res = await adminAPI.getUserOverview(id, { historyPage });
      setState({ loading: false, data: res.data.overview, error: null, status: 200 });
    } catch (err) {
      setState({ loading: false, data: null, error: err.response?.data?.message || 'This page could not be loaded.', status: err.response?.status || 500 });
    }
  }, [id, historyPage]);

  useEffect(() => {
    load();
  }, [load]);

  const d = state.data;
  const tabs = useMemo(() => [
    { key: 'loans', label: 'Current loans', description: 'Books with the member now and requests waiting for approval.' },
    { key: 'history', label: 'History', description: 'Every loan and request, newest first.' },
    { key: 'fines', label: 'Fines', description: 'Loans with a fine: what was charged, waived, paid and is still due.' },
    { key: 'reservations', label: 'Reservations', description: 'Waiting, ready and past reservations.' },
    ...(d?.permissions?.isAdmin ? [{ key: 'activity', label: 'Activity', description: 'Staff actions about this member, from the audit log.' }] : []),
  ], [d?.permissions?.isAdmin]);

  // ?loan=: open the tab that shows that loan
  const loanTab = useMemo(() => {
    if (!highlightLoan || !d) return null;
    if (d.currentLoans.some((l) => l._id === highlightLoan)) return 'loans';
    return 'history';
  }, [highlightLoan, d]);
  const requested = params.get('tab') || loanTab;
  const tab = tabs.some((t) => t.key === requested) ? requested : 'loans';
  const active = tabs.find((t) => t.key === tab) || tabs[0];
  const setTab = (key) => setParams((prev) => {
    const next = new URLSearchParams(prev);
    if (key === 'loans') next.delete('tab');
    else next.set('tab', key);
    return next;
  }, { replace: true });

  useEffect(() => {
    if (highlightRef.current) highlightRef.current.scrollIntoView({ block: 'center' });
  }, [d, tab]);

  /** Run an existing endpoint, show its message, reload */
  const act = async (key, call, fallback) => {
    setBusy(key);
    try {
      const res = await call();
      toast.success(res?.data?.message || fallback);
      await load({ quiet: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'That did not work. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const openCard = async () => {
    setCard({ loading: true, data: null, error: null, flipped: false });
    try {
      const res = await adminAPI.getUserCard(id);
      setCard({ loading: false, data: res.data.card, error: null, flipped: false });
    } catch (err) {
      setCard({ loading: false, data: null, error: err.response?.data?.message || 'The card could not be loaded.', flipped: false });
    }
  };

  if (!(isAdmin || isLibrarian)) {
    return <MainLayout><EmptyState icon="🔒" title="Staff only" message="Member pages are for librarians and admins." /></MainLayout>;
  }

  if (state.loading && !d) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-7xl space-y-5" aria-busy="true" aria-label="Loading member">
          <Skeleton className="h-36 w-full !rounded-3xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 w-full !rounded-2xl" />)}</div>
          <Skeleton className="h-72 w-full !rounded-3xl" />
        </div>
      </MainLayout>
    );
  }

  if (!d) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-3xl space-y-4">
          <Link to={`${base}/users`} className="btn-ghost min-h-[40px] px-2 text-sm">← Users</Link>
          <EmptyState
            icon={state.status === 403 ? '🔒' : '⚠️'}
            title={state.status === 403 ? 'Not available' : state.status === 404 ? 'Member not found' : 'Could not load this member'}
            message={state.error}
            action={state.status >= 500 ? <Button fullWidth={false} onClick={() => load()}>Try again</Button> : null}
          />
        </div>
      </MainLayout>
    );
  }

  const { profile: p, stats: s, permissions: perm } = d;
  const isStudent = p.role === 'student';

  // Loan actions, each through the endpoint (and rules) the rest of the app uses
  const loanActions = (l) => {
    const out = [];
    const returnable = l.status === 'issued' || ((l.status === 'return_requested' || l.status === 'payment_pending') && l.payable <= 0);
    if (returnable) {
      out.push(
        <Button key="ret" size="sm" variant="success" fullWidth={false} loading={busy === `ret:${l._id}`} disabled={!!busy}
          onClick={() => act(`ret:${l._id}`, () => deskAPI.returnLoan(l._id), 'Returned')}>
          Return
        </Button>,
      );
    }
    if (l.canRenew) {
      out.push(
        <Button key="renew" size="sm" variant="secondary" fullWidth={false} loading={busy === `renew:${l._id}`} disabled={!!busy}
          onClick={() => act(`renew:${l._id}`, () => transactionsAPI.renewBook(l._id), 'Renewed')}>
          Renew
        </Button>,
      );
    }
    if (l.payable > 0 && l.status !== 'issued') {
      out.push(
        <Button key="waive" size="sm" variant="secondary" fullWidth={false} disabled={!!busy}
          onClick={() => setWaiving({ id: l._id, book: l.book.title, student: p.name, fine: l.fine, waived: l.waived, payable: l.payable })}>
          Waive fine
        </Button>,
      );
    }
    return out.length ? out : null;
  };

  const statCards = [
    { label: 'Books read', value: s.booksRead, hint: 'loans returned' },
    { label: 'On loan', value: s.onLoan, hint: s.pendingRequests ? `${s.pendingRequests} request${s.pendingRequests === 1 ? '' : 's'} waiting` : 'books with them now', tone: 'text-indigo-200' },
    { label: 'Overdue', value: s.overdue, hint: s.finesAccruing ? `${formatRupees(s.finesAccruing)} growing` : 'past due today', tone: s.overdue ? 'text-rose-300' : 'text-slate-50' },
    { label: 'Fines due', value: formatRupees(s.finesPayable), hint: 'fixed, still unpaid', tone: s.finesPayable ? 'text-rose-300' : 'text-slate-50' },
    { label: 'Fines paid', value: formatRupees(s.finesPaid), hint: `${formatRupees(s.finesWaived)} waived`, tone: 'text-emerald-300' },
    { label: 'Reservations', value: s.activeReservations, hint: `${s.wishlist} on wishlist`, tone: 'text-violet-200' },
  ];

  const panel = {
    loans: (
      <div className="space-y-4">
        {d.currentLoans.length === 0 ? (
          <CompactEmpty icon={DASH_ICONS.book} tone="slate" title="Nothing on loan" message={isStudent ? 'Use Issue book to lend one at the desk.' : 'Staff accounts do not borrow books.'} />
        ) : (
          <ul className="space-y-2.5">
            {d.currentLoans.map((l) => (
              <LoanRow key={l._id} loan={l} highlighted={l._id === highlightLoan} rowRef={l._id === highlightLoan ? highlightRef : undefined} actions={loanActions(l)} />
            ))}
          </ul>
        )}
        {d.pendingRequests.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Waiting for approval</h3>
            <ul className="space-y-2">
              {d.pendingRequests.map((l) => (
                <li key={l._id} data-loan={l._id} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${l._id === highlightLoan ? 'border-cyan-400/60 ring-1 ring-cyan-400/40' : 'border-border'}`}>
                  <span className="min-w-0 truncate text-slate-200">{l.book.title} <span className="text-xs text-slate-500">· requested {shortDay(l.requestDate)}</span></span>
                  <Link to={`${base}/pending?tab=issue`} className="flex-shrink-0 text-xs font-semibold text-indigo-300 hover:text-white">Review</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ),
    history: (
      <div>
        {d.history.rows.length === 0 ? (
          <CompactEmpty icon={DASH_ICONS.clock} tone="slate" title="No loans yet" message="Loans and requests show up here." />
        ) : (
          <>
            <ul className="divide-y divide-border rounded-2xl border border-border">
              {d.history.rows.map((l) => (
                <li
                  key={l._id}
                  data-loan={l._id}
                  ref={l._id === highlightLoan ? highlightRef : undefined}
                  className={`grid gap-1 px-3 py-2.5 text-sm sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center sm:gap-4 ${l._id === highlightLoan ? 'bg-cyan-400/[0.08] ring-1 ring-inset ring-cyan-400/40' : 'even:bg-white/[0.02]'}`}
                >
                  <span className="min-w-0 truncate font-medium text-slate-100" title={l.book.title}>{l.book.title}</span>
                  <span className="flex items-center gap-2 text-xs text-slate-400">
                    <LoanStatusBadge status={l.status} overdue={l.daysOverdue > 0} />
                  </span>
                  <span className="whitespace-nowrap text-xs text-slate-400">
                    {l.issueDate ? <>Issued <DayCell value={l.issueDate} /></> : <>Requested <DayCell value={l.requestDate} /></>}
                    {l.returnDate && <> · back <DayCell value={l.returnDate} /></>}
                  </span>
                  <span className="text-xs sm:text-right"><FineCell fine={l.fine} waived={l.waived} payable={l.payable} paid={l.paid} /></span>
                </li>
              ))}
            </ul>
            {d.history.pages > 1 && (
              <nav className="mt-3 flex items-center justify-end gap-2 text-xs" aria-label="History pages">
                <button type="button" className="btn-secondary min-h-[34px] px-3" disabled={d.history.page <= 1 || state.loading} onClick={() => setHistoryPage(d.history.page - 1)}>Previous</button>
                <span className="text-slate-400" aria-live="polite">Page {d.history.page} of {d.history.pages} · {plural(d.history.total, 'loan')}</span>
                <button type="button" className="btn-secondary min-h-[34px] px-3" disabled={d.history.page >= d.history.pages || state.loading} onClick={() => setHistoryPage(d.history.page + 1)}>Next</button>
              </nav>
            )}
            {highlightLoan && !d.history.rows.some((l) => l._id === highlightLoan) && !d.currentLoans.some((l) => l._id === highlightLoan) && (
              <p className="mt-2 text-xs text-slate-400">The loan you opened is on another page of the history.</p>
            )}
          </>
        )}
      </div>
    ),
    fines: (
      d.fines.length === 0 ? (
        <CompactEmpty title="No fines" message="Every loan was returned on time." />
      ) : (
        <ul className="space-y-2.5">
          {d.fines.map((l) => (
            <LoanRow key={l._id} loan={l} highlighted={l._id === highlightLoan} actions={l.payable > 0 && l.status !== 'issued' ? loanActions(l)?.filter((a) => a.key === 'waive') : null} />
          ))}
        </ul>
      )
    ),
    reservations: (
      d.reservations.length === 0 ? (
        <CompactEmpty icon={DASH_ICONS.clock} tone="slate" title="No reservations" message="Reservations for books with no free copy show up here." />
      ) : (
        <ul className="space-y-2.5">
          {d.reservations.map((r) => {
            const [variant, label] = RES_BADGE[r.status] || ['neutral', r.status];
            const cancellable = r.status === 'waiting' || r.status === 'ready';
            return (
              <li key={r._id} className="flex flex-col gap-3 rounded-2xl border border-border bg-white/[0.02] p-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <BookThumb book={r.book} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-100" title={r.book.title}>{r.book.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <Badge variant={variant}>{label}{r.status === 'waiting' && r.position ? ` · #${r.position} in line` : ''}</Badge>
                      <span>Reserved {shortDay(r.createdAt)}</span>
                      {r.status === 'ready' && r.expiresAt && <span className="text-emerald-200">· held until {shortDay(r.expiresAt)}</span>}
                    </div>
                  </div>
                </div>
                {cancellable && (
                  <Button size="sm" variant="secondary" fullWidth={false} loading={busy === `res:${r._id}`} disabled={!!busy}
                    onClick={() => act(`res:${r._id}`, () => reservationsAPI.cancel(r._id), 'Reservation cancelled')}>
                    Cancel reservation
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )
    ),
    activity: (
      !d.audit || d.audit.length === 0 ? (
        <CompactEmpty icon={DASH_ICONS.clock} tone="slate" title="No staff actions yet" message="Issues, returns, waivers and account changes show up here." />
      ) : (
        <ol className="space-y-2">
          {d.audit.map((e) => (
            <li key={e._id} className="rounded-xl border border-border px-3 py-2.5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="neutral">{auditActionLabel(e.action)}</Badge>
                <span className="text-[11px] text-slate-500">{new Date(e.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
              </div>
              <p className="mt-1 text-slate-200 [overflow-wrap:anywhere]">{e.summary}</p>
              <p className="text-[11px] text-slate-500">by {e.actor} ({e.actorRole})</p>
            </li>
          ))}
        </ol>
      )
    ),
  }[tab];

  const statusVerb = p.isActive ? 'Deactivate' : 'Activate';

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-5 pb-10">
        <Link to={`${base}/users`} className="btn-ghost -ml-2 inline-flex min-h-[36px] items-center gap-1 px-2 text-sm">← Users</Link>

        {/* Profile header */}
        <section className="card-glass !p-5 sm:!p-6" aria-labelledby="member-name">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar name={p.name} src={p.profileImage} size={16} role={p.role} className="flex-shrink-0 ring-2 ring-cyan-400/40 ring-offset-2 ring-offset-[#0B1220]" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 id="member-name" className="truncate font-display text-2xl font-bold text-slate-50 sm:text-3xl">{p.name}</h1>
                  <Badge variant={p.role === 'admin' ? 'primary' : p.role === 'librarian' ? 'info' : 'neutral'}>{ROLE_LABEL[p.role] || p.role}</Badge>
                  <Badge variant={p.isActive ? 'success' : 'danger'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  <span className="font-mono text-slate-100">{p.libraryId || 'No Library ID'}</span>
                  <span className="text-slate-500"> · </span>Member since {memberSince(p.memberSince)}
                  <span className="text-slate-500"> · </span>Card v{p.cardVersion}
                </p>
                {(p.phone || p.address) && (
                  <p className="mt-0.5 truncate text-xs text-slate-400" title={[p.phone, p.address].filter(Boolean).join(' · ')}>
                    {[p.phone, p.address].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {perm.canIssue && (
                <Button fullWidth={false} onClick={() => setIssueOpen(true)} disabled={!!busy}>{DASH_ICONS.book}Issue book</Button>
              )}
              {p.libraryId && <Button fullWidth={false} variant="secondary" onClick={openCard}>{DASH_ICONS.card}Library card</Button>}
              {perm.canReissueCard && (
                <Button fullWidth={false} variant="secondary" onClick={() => setConfirm({ kind: 'reissue' })} disabled={!!busy}>Reissue card</Button>
              )}
              {perm.canChangeStatus && (
                <Button fullWidth={false} variant={p.isActive ? 'danger' : 'success'} onClick={() => setConfirm({ kind: 'status' })} disabled={!!busy}>{statusVerb}</Button>
              )}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 transition-opacity ${state.loading ? 'opacity-60' : ''}`}>
          {statCards.map((c) => <SummaryCard key={c.label} {...c} value={typeof c.value === 'number' ? c.value.toLocaleString('en-IN') : c.value} />)}
        </div>

        <ProfileTabs tabs={tabs} active={tab} onChange={setTab} label="Member sections" idPrefix="member" />
        <section id={`member-panel-${tab}`} role="tabpanel" aria-labelledby={`member-tab-${tab}`} className={state.loading ? 'opacity-60 transition-opacity' : ''}>
          <SectionCard title={active.label} subtitle={active.description}>{panel}</SectionCard>
        </section>
      </div>

      {issueOpen && (
        <IssueBookModal
          open
          presetStudent={{ _id: p._id, name: p.name, libraryId: p.libraryId, profileImage: p.profileImage }}
          onClose={() => setIssueOpen(false)}
          onIssued={() => load({ quiet: true })}
        />
      )}
      {waiving && <WaiveFineModal loan={waiving} onClose={() => setWaiving(null)} onWaived={() => load({ quiet: true })} />}
      <ConfirmModal
        isOpen={confirm?.kind === 'status'}
        title={`${statusVerb} ${p.name}?`}
        description={p.isActive
          ? 'They will not be able to sign in until the account is activated again. Their loans and history are kept.'
          : 'They will be able to sign in and borrow again.'}
        confirmText={statusVerb}
        loading={busy === 'status'}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => { await act('status', () => adminAPI.deleteUser(p._id), `${statusVerb}d`); setConfirm(null); }}
      />
      <ConfirmModal
        isOpen={confirm?.kind === 'reissue'}
        title="Reissue library card?"
        description={`${p.name} (${p.libraryId}) gets a new card. Their current card QR, printed or saved, stops working at the desk straight away. They are notified.`}
        confirmText="Reissue card"
        loading={busy === 'reissue'}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => { await act('reissue', () => adminAPI.reissueCard(p._id), 'New card issued'); setConfirm(null); }}
      />
      {card && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={(e) => e.target === e.currentTarget && setCard(null)}>
          <div className="modal-amo w-full max-w-lg" role="dialog" aria-modal="true" aria-labelledby="member-card-title" onKeyDown={(e) => e.key === 'Escape' && setCard(null)}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="member-card-title" className="font-display text-lg font-semibold text-slate-100">Library card</h2>
              <button type="button" className="btn-ghost min-h-[36px] px-2 text-sm" onClick={() => setCard(null)} autoFocus>Close</button>
            </div>
            {card.loading ? <Skeleton className="aspect-[1.586/1] w-full !rounded-2xl" />
              : card.error ? <p className="text-sm text-rose-200">{card.error}</p>
                : (
                  <>
                    <FlipCard card={card.data} flipped={card.flipped} onFlip={() => setCard((c) => ({ ...c, flipped: !c.flipped }))} />
                    <p className="mt-3 text-center text-xs text-slate-400">Card version {card.data.cardVersion}. Click the card to see the back.</p>
                  </>
                )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default StudentOverview;
