import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { formatDate } from '../utils/dateUtils';
import { getDaysUntilDue } from '../utils/fineCalculator';
import { CoverImage } from '../components/CoverImage';
import { Badge, Button, Card, EmptyState, PageHeader, Skeleton } from '../components/UI';
import { ACTIVE_LOAN_STATUSES } from '../hooks/useActiveBookIds';
import { ACTIVE_RESERVATION_STATUSES, formatHoldEnd, holdTimeLeft, useReservations } from '../hooks/useReservations';

const STATUS_META = {
  issued: { label: 'Issued', variant: 'primary' },
  pending: { label: 'Pending approval', variant: 'warning' },
  return_requested: { label: 'Return requested', variant: 'info' },
  payment_pending: { label: 'Payment pending', variant: 'warning' },
  returned: { label: 'Returned', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  overdue: { label: 'Overdue', variant: 'danger' },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'issued', label: 'Issued' },
  { key: 'pending', label: 'Pending' },
  { key: 'return_requested', label: 'Return requested' },
  { key: 'payment_pending', label: 'Payment pending' },
  { key: 'returned', label: 'Returned' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'reservations', label: 'Reservations' },
];

const RESERVATION_META = {
  ready: { label: 'Ready to borrow', variant: 'success' },
  waiting: { label: 'Waiting', variant: 'info' },
  fulfilled: { label: 'Borrowed', variant: 'primary' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
  expired: { label: 'Expired', variant: 'danger' },
};

// Server rule (PUT /transactions/:id/renew): at most 3 renewals, never once overdue
const MAX_RENEWALS = 3;

/** Why an issued loan cannot be renewed right now, or null if it can (server daysRemaining: calendar days) */
const renewBlockReason = (t) => {
  if (Number(t.daysRemaining) < 0) return 'Overdue — return and pay the fine';
  if ((Number(t.renewalCount) || 0) >= MAX_RENEWALS) return 'Renewal limit reached';
  return null;
};

// Loans that are still out with the student, so the due date matters
const ON_LOAN = ['issued', 'return_requested', 'payment_pending', 'overdue'];

const DueBadge = ({ dueDate }) => {
  const due = dueDate ? new Date(dueDate) : null;
  if (!due || Number.isNaN(due.getTime())) return null;
  const days = getDaysUntilDue(due);
  if (days < 0) return <Badge variant="danger">{Math.abs(days)} day{Math.abs(days) === 1 ? '' : 's'} overdue</Badge>;
  if (days === 0) return <Badge variant="warning">Due today</Badge>;
  if (days <= 3) return <Badge variant="warning">{days} day{days === 1 ? '' : 's'} left</Badge>;
  return <Badge variant="success">{days} days left</Badge>;
};

/** One reservation: position in line, or the held copy's countdown with Borrow now */
const ReservationCard = ({ r, requested, busy, borrowing, onOpen, onBorrow, onCancel, now }) => {
  const book = r.bookId && typeof r.bookId === 'object' ? r.bookId : {};
  const meta = RESERVATION_META[r.status] || { label: r.status, variant: 'neutral' };
  const active = ACTIVE_RESERVATION_STATUSES.includes(r.status);

  return (
    <Card variant="glass" className={`!p-4 sm:!p-5 ${active ? '' : 'opacity-75'} ${r.status === 'ready' ? 'border-emerald-400/30' : ''}`}>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => book._id && onOpen(book._id)}
          className="h-32 w-[5.5rem] flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-input"
          aria-label={`${book.title || 'Book'} details`}
        >
          <CoverImage book={book} src={book.imageUrl || book.coverImage} alt="" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold leading-snug text-slate-100 line-clamp-2">{book.title || 'Unknown title'}</h3>
              <p className="mt-0.5 text-sm text-slate-400 line-clamp-1">{book.author || 'Unknown author'}</p>
            </div>
            <Badge variant={meta.variant}>{r.status === 'waiting' && r.position ? `#${r.position} in line` : meta.label}</Badge>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted">Reserved</dt>
              <dd className="text-slate-200">{formatDate(r.createdAt)}</dd>
            </div>
            {r.status === 'ready' && (
              <div>
                <dt className="text-xs text-muted">Borrow by</dt>
                <dd className="text-slate-200">{formatHoldEnd(r.expiresAt)}</dd>
              </div>
            )}
            {r.status === 'waiting' && (
              <div>
                <dt className="text-xs text-muted">Position</dt>
                <dd className="text-slate-200">{r.position === 1 ? 'Next in line' : `#${r.position}`}</dd>
              </div>
            )}
            {!active && (
              <div>
                <dt className="text-xs text-muted">{meta.label}</dt>
                <dd className="text-slate-200">{formatDate(r.updatedAt)}</dd>
              </div>
            )}
          </dl>

          {r.status === 'ready' && (
            <p className="mt-3 text-xs font-semibold text-emerald-300" role="status">
              A copy is held for you · {holdTimeLeft(r.expiresAt, now)}
            </p>
          )}
          {r.status === 'waiting' && (
            <p className="mt-3 text-xs text-slate-400">We'll notify you when a copy is held for you. You then have 48 hours to borrow it.</p>
          )}

          {active && (
            <div className="mt-4 flex flex-wrap gap-2">
              {r.status === 'ready' && (requested ? (
                <Badge variant="warning">Request sent · waiting for the library</Badge>
              ) : (
                <Button size="sm" fullWidth={false} loading={borrowing} disabled={busy} onClick={() => onBorrow(r)}>
                  {borrowing ? 'Requesting...' : 'Borrow now'}
                </Button>
              ))}
              <Button size="sm" fullWidth={false} variant="ghost" loading={busy} disabled={borrowing} onClick={() => onCancel(r)}>
                {busy ? 'Cancelling...' : 'Cancel reservation'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const ListSkeleton = () => (
  <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Loading your books">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="card-glass flex gap-4 !p-4">
        <Skeleton className="h-32 w-[5.5rem] flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

export const MyBooks = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const [renewingId, setRenewingId] = useState(null);
  const [borrowingId, setBorrowingId] = useState(null);
  const reservations = useReservations();
  // Re-render the hold countdowns every minute
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const requestedTab = searchParams.get('tab');
  const activeTab = TABS.some((t) => t.key === requestedTab) ? requestedTab : 'all';

  // Keep the selected tab visible in the scrolling strip (links can open the last tab, Reservations)
  const tablistRef = useRef(null);
  useEffect(() => {
    tablistRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeTab]);
  const setActiveTab = (key) => setSearchParams(key === 'all' ? {} : { tab: key }, { replace: true });

  const load = useCallback(async () => {
    try {
      const res = await transactionsAPI.getUserTransactions();
      setTransactions(Array.isArray(res.data?.transactions) ? res.data.transactions : []);
      setLoadError(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load your books';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { all: transactions.length };
    transactions.forEach((t) => {
      c[t.status] = (c[t.status] || 0) + 1;
    });
    c.reservations = reservations.activeCount;
    return c;
  }, [transactions, reservations.activeCount]);

  // Books with an open request or loan: a ready reservation that was already requested shows that instead of Borrow now
  const openBookIds = useMemo(
    () => new Set(transactions.filter((t) => ACTIVE_LOAN_STATUSES.includes(t.status)).map((t) => String(t.bookId?._id || t.bookId))),
    [transactions]
  );

  const handleBorrow = async (r) => {
    const bookId = r.bookId?._id || r.bookId;
    setBorrowingId(r._id);
    try {
      await transactionsAPI.requestIssueBook({ bookId });
      toast.success('Request sent. Collect the book once a librarian approves it.');
      await Promise.all([load(), reservations.refresh()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not request the book');
    } finally {
      setBorrowingId(null);
    }
  };

  const visible = useMemo(
    () => (activeTab === 'all' ? transactions : transactions.filter((t) => t.status === activeTab)),
    [transactions, activeTab]
  );

  const handleReturn = async (id) => {
    setActioningId(id);
    try {
      const res = await transactionsAPI.returnBook(id);
      toast.success(res.data?.message || 'Return requested');
      if (res.data?.hasFine) {
        navigate(`/student/pay-fine/${id}`);
        return;
      }
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not request the return');
    } finally {
      setActioningId(null);
    }
  };

  const handleRenew = async (id) => {
    setRenewingId(id);
    try {
      const res = await transactionsAPI.renewBook(id);
      const message = (res.data?.message || 'Book renewed').replace(/\.$/, '');
      const newDue = res.data?.newDueDate ? ` New due date: ${formatDate(res.data.newDueDate)}.` : '';
      toast.success(`${message}.${newDue}`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not renew the book');
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="My books"
          subtitle="Everything you have borrowed or requested, with due dates and fines."
          actions={<Button fullWidth={false} variant="secondary" onClick={() => navigate('/student/books')}>Browse books</Button>}
        />

        {/* Status tabs: scroll sideways on small screens */}
        <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div ref={tablistRef} role="tablist" aria-label="Filter by status" className="flex w-max gap-2">
            {TABS.map((tab) => {
              const selected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors ${
                    selected
                      ? 'border-indigo-400/50 bg-indigo-500/20 text-slate-50'
                      : 'border-border bg-surface/60 text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-1.5 text-xs ${selected ? 'bg-white/15' : 'bg-white/5'}`}>{counts[tab.key] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'reservations' ? (
          reservations.loading ? (
            <ListSkeleton />
          ) : reservations.error && reservations.reservations.length === 0 ? (
            <EmptyState
              icon="⚠️"
              title="Couldn't load your reservations"
              message={reservations.error}
              action={<Button fullWidth={false} onClick={reservations.refresh}>Try again</Button>}
            />
          ) : reservations.reservations.length === 0 ? (
            <EmptyState
              icon="🔖"
              title="No reservations"
              message="When a book has no free copy, reserve it from the catalogue to join the waiting list."
              action={<Button fullWidth={false} onClick={() => navigate('/student/books?availability=unavailable')}>Browse unavailable books</Button>}
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {reservations.reservations.map((r) => (
                <ReservationCard
                  key={r._id}
                  r={r}
                  now={now}
                  requested={openBookIds.has(String(r.bookId?._id || r.bookId))}
                  busy={reservations.isBusy(r.bookId?._id || r.bookId)}
                  borrowing={borrowingId === r._id}
                  onOpen={(bookId) => navigate(`/student/books/${bookId}`)}
                  onBorrow={handleBorrow}
                  onCancel={reservations.cancel}
                />
              ))}
            </div>
          )
        ) : loading ? (
          <ListSkeleton />
        ) : loadError && transactions.length === 0 ? (
          <EmptyState
            icon="⚠️"
            title="Couldn't load your books"
            message={loadError}
            action={<Button fullWidth={false} onClick={() => { setLoading(true); load(); }}>Try again</Button>}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="📚"
            title={activeTab === 'all' ? 'No books yet' : `Nothing ${TABS.find((t) => t.key === activeTab)?.label.toLowerCase()}`}
            message={activeTab === 'all' ? 'Find something in the catalogue and request it. It will show up here.' : 'Books with this status will appear here.'}
            action={<Button fullWidth={false} onClick={() => navigate('/student/books')}>Browse books</Button>}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {visible.map((t) => {
              const book = t.bookId && typeof t.bookId === 'object' ? t.bookId : {};
              const meta = STATUS_META[t.status] || { label: t.status || 'Unknown', variant: 'neutral' };
              const onLoan = ON_LOAN.includes(t.status);
              // Still issued: fine grows daily. After a return request: the fixed amount to pay.
              const fine = Number(t.status === 'issued' ? t.fine : t.fineAmount) || 0;
              const canPay = t.status === 'return_requested' && fine > 0 && !t.finePaid;

              return (
                <Card key={t._id} variant="glass" className="!p-4 sm:!p-5">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => book._id && navigate(`/student/books/${book._id}`)}
                      className="h-32 w-[5.5rem] flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-input"
                      aria-label={`${book.title || 'Book'} details`}
                    >
                      <CoverImage book={book} src={book.imageUrl || book.coverImage} alt="" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold leading-snug text-slate-100 line-clamp-2">{book.title || 'Unknown title'}</h3>
                          <p className="mt-0.5 text-sm text-slate-400 line-clamp-1">{book.author || 'Unknown author'}</p>
                        </div>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>

                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <dt className="text-xs text-muted">{t.status === 'pending' ? 'Requested' : 'Issued'}</dt>
                          <dd className="text-slate-200">{formatDate(t.status === 'pending' ? t.createdAt : t.issueDate || t.createdAt)}</dd>
                        </div>
                        {t.status === 'returned' ? (
                          <div>
                            <dt className="text-xs text-muted">Returned</dt>
                            <dd className="text-slate-200">{formatDate(t.returnDate)}</dd>
                          </div>
                        ) : t.status !== 'pending' && t.status !== 'rejected' ? (
                          <div>
                            <dt className="text-xs text-muted">Due</dt>
                            <dd className="text-slate-200">{formatDate(t.dueDate)}</dd>
                          </div>
                        ) : null}
                      </dl>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {onLoan && <DueBadge dueDate={t.dueDate} />}
                        {t.status === 'issued' && (
                          <span className="text-xs text-muted">Renewed {Number(t.renewalCount) || 0}/{MAX_RENEWALS}</span>
                        )}
                        {fine > 0 && (
                          <Badge variant={t.finePaid ? 'success' : 'danger'}>
                            Fine ₹{fine}{t.finePaid ? ' · paid' : ''}
                          </Badge>
                        )}
                      </div>

                      {(t.status === 'issued' || canPay) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {t.status === 'issued' && (
                            <Button
                              size="sm"
                              fullWidth={false}
                              variant="secondary"
                              loading={actioningId === t._id}
                              disabled={renewingId === t._id}
                              onClick={() => handleReturn(t._id)}
                            >
                              {actioningId === t._id ? 'Requesting...' : 'Return book'}
                            </Button>
                          )}
                          {t.status === 'issued' && (
                            <Button
                              size="sm"
                              fullWidth={false}
                              variant="ghost"
                              loading={renewingId === t._id}
                              disabled={!!renewBlockReason(t) || actioningId === t._id}
                              title={renewBlockReason(t) || 'Extend the due date by 7 days'}
                              aria-describedby={renewBlockReason(t) ? `renew-why-${t._id}` : undefined}
                              onClick={() => handleRenew(t._id)}
                            >
                              {renewingId === t._id ? 'Renewing...' : 'Renew'}
                            </Button>
                          )}
                          {canPay && (
                            <Button size="sm" fullWidth={false} onClick={() => navigate(`/student/pay-fine/${t._id}`)}>
                              Pay ₹{fine} fine
                            </Button>
                          )}
                        </div>
                      )}
                      {t.status === 'issued' && renewBlockReason(t) && (
                        <p id={`renew-why-${t._id}`} className="mt-2 text-xs text-slate-400">Can't renew: {renewBlockReason(t)}</p>
                      )}
                      {t.status === 'payment_pending' && (
                        <p className="mt-3 text-xs text-slate-400">Payment submitted. A librarian will verify it and complete the return.</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
