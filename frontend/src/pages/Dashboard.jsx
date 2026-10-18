import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { transactionsAPI, booksAPI, wishlistAPI } from '../services/api';
import { BookCard } from '../components/BookCard';
import { CoverImage } from '../components/CoverImage';
import { Badge, EmptyState, Skeleton } from '../components/UI';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import {
  AmountStat, DASH_ICONS, DashTabs, KpiLink, QuickTile, SectionCard, SectionLink, formatRupees,
} from '../components/dashboard/DashboardKit';
import { formatDate } from '../utils/dateUtils';
import { ACTIVE_LOAN_STATUSES } from '../hooks/useActiveBookIds';
import { bookActionFor, formatHoldEnd, holdTimeLeft, useReservations } from '../hooks/useReservations';
import { GENRES } from '../constants/genres';

const DUE_SOON_DAYS = 3;
const WEEK_DAYS = 7;
// Loans (not requests): the book was handed out at some point
const LOAN_STATUSES = ['issued', 'return_requested', 'payment_pending', 'returned'];
const FIXED_FINE_STATUSES = ['return_requested', 'payment_pending', 'returned'];
const DISCOVER_TABS = [
  { key: 'picked', label: 'Picked for you' },
  { key: 'new', label: 'New arrivals' },
  { key: 'popular', label: 'Popular' },
];

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const bookOf = (t) => (t?.bookId && typeof t.bookId === 'object' ? t.bookId : {});
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Status badge for a loan, from server values (status, daysRemaining) */
const LoanBadge = ({ t }) => {
  if (t.status === 'return_requested') return <Badge variant="info">Return requested</Badge>;
  if (t.status === 'payment_pending') return <Badge variant="warning">Payment pending</Badge>;
  if (t.status === 'returned') return <Badge variant="success">Returned</Badge>;
  const d = num(t.daysRemaining);
  if (d < 0) return <Badge variant="danger">Overdue · {plural(-d, 'day')}</Badge>;
  if (d === 0) return <Badge variant="warning">Due today</Badge>;
  if (d <= DUE_SOON_DAYS) return <Badge variant="warning">Due in {plural(d, 'day')}</Badge>;
  return <Badge variant="primary">Issued</Badge>;
};

const BookRowSkeleton = () => (
  <div className="dash-book-row" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="card-glass !p-0 overflow-hidden">
        <Skeleton className="aspect-[2/3] w-full !rounded-none" />
        <div className="space-y-2 p-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    ))}
  </div>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLibrarian } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [txError, setTxError] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(null);
  const [heroCovers, setHeroCovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingBookId, setRequestingBookId] = useState(null);
  const [discoverTab, setDiscoverTab] = useState('picked');
  const [genre, setGenre] = useState('');
  const [lists, setLists] = useState({}); // "<tab>|<genre>" -> { loading, books, error }
  const reservations = useReservations();
  const readyReservations = reservations.reservations.filter((r) => r.status === 'ready');

  const loadData = useCallback(async () => {
    const [tx, rec, wish, top] = await Promise.allSettled([
      transactionsAPI.getUserTransactions(),
      booksAPI.getRecommendations(),
      wishlistAPI.getWishlist(),
      booksAPI.getBooks({ sort: 'rating', limit: 8 }),
    ]);
    if (tx.status === 'fulfilled') {
      setTransactions(Array.isArray(tx.value.data?.transactions) ? tx.value.data.transactions : []);
      setTxError(null);
    } else {
      setTxError(tx.reason?.response?.data?.message || 'Failed to load your loans');
    }
    if (rec.status === 'fulfilled') {
      setRecommended(rec.value.data?.recommendations || []);
      setFavoriteGenres(rec.value.data?.favoriteGenres || []);
    }
    if (wish.status === 'fulfilled') setWishlistCount((wish.value.data?.wishlist || []).length);
    if (top.status === 'fulfilled') setHeroCovers(top.value.data?.books || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // New arrivals / Popular: fetched per tab + genre and kept for the session
  const listKey = `${discoverTab}|${genre}`;
  useEffect(() => {
    if (discoverTab === 'picked' || lists[listKey]) return;
    setLists((prev) => ({ ...prev, [listKey]: { loading: true, books: [] } }));
    const params = { limit: 12, ...(genre ? { genre } : {}) };
    const request = discoverTab === 'new'
      ? booksAPI.getBooks({ ...params, sort: 'newest' })
      : booksAPI.getPopular({ ...params, limit: 10 });
    request
      .then((res) => setLists((prev) => ({ ...prev, [listKey]: { loading: false, books: res.data?.books || [] } })))
      .catch((err) => setLists((prev) => ({ ...prev, [listKey]: { loading: false, books: [], error: err.response?.data?.message || 'Failed to load books' } })));
  }, [discoverTab, genre, listKey, lists]);

  const activeBookIds = useMemo(
    () => new Set(transactions.filter((t) => ACTIVE_LOAN_STATUSES.includes(t?.status)).map((t) => String(bookOf(t)._id || t.bookId))),
    [transactions]
  );

  // Every figure below is derived from GET /transactions/user/me (server-calculated fine, daysRemaining)
  const s = useMemo(() => {
    const issued = transactions.filter((t) => t.status === 'issued');
    const overdue = issued.filter((t) => num(t.daysRemaining) < 0);
    const dueWeek = issued.filter((t) => num(t.daysRemaining) >= 0 && num(t.daysRemaining) <= WEEK_DAYS)
      .sort((x, y) => num(x.daysRemaining) - num(y.daysRemaining));
    const dueSoon = dueWeek.filter((t) => num(t.daysRemaining) <= DUE_SOON_DAYS);
    const paid = transactions.filter((t) => t.finePaid).reduce((sum, t) => sum + num(t.fineAmount), 0);
    const fixedUnpaid = transactions
      .filter((t) => !t.finePaid && FIXED_FINE_STATUSES.includes(t.status))
      .reduce((sum, t) => sum + num(t.fineAmount), 0);
    const accruing = issued.reduce((sum, t) => sum + num(t.fine), 0);
    const verifying = transactions.filter((t) => t.status === 'payment_pending').reduce((sum, t) => sum + num(t.fineAmount), 0);
    const payable = transactions.find((t) => t.status === 'return_requested' && num(t.fineAmount) > 0 && !t.finePaid);
    const loans = transactions
      .filter((t) => LOAN_STATUSES.includes(t.status))
      .sort((x, y) => new Date(y.issueDate || y.createdAt) - new Date(x.issueDate || x.createdAt))
      .slice(0, 5);
    return {
      issued: issued.length,
      pendingRequests: transactions.filter((t) => t.status === 'pending').length,
      overdue,
      overdueFine: overdue.reduce((sum, t) => sum + num(t.fine), 0),
      dueWeek,
      dueSoon: dueSoon.length,
      paid,
      pending: fixedUnpaid + accruing,
      accruing,
      verifying,
      payable,
      loans,
    };
  }, [transactions]);

  // Redirects after all hooks (Rules of Hooks)
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isLibrarian) return <Navigate to="/librarian" replace />;
  if (!loading && user?.role === 'student' && user?.isOnboardingCompleted === false) {
    return <Navigate to="/student/onboarding" replace />;
  }

  const handleRequestBook = async (bookId) => {
    if (!bookId) return;
    setRequestingBookId(bookId);
    try {
      await transactionsAPI.requestIssueBook({ bookId });
      toast.success('Request sent. A librarian will review it shortly.');
      setLists({}); // availability may have changed
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request book');
    } finally {
      setRequestingBookId(null);
    }
  };

  // Request / Reserve / Borrow now (held copy) / Cancel reservation
  const actionFor = (book) =>
    bookActionFor(book, {
      isStudent: true,
      requesting: requestingBookId === book._id,
      hasActive: activeBookIds.has(String(book._id)),
      reservations,
      onRequest: handleRequestBook,
    });

  const firstName = (user?.name || '').trim().split(/\s+/)[0];
  const genrePills = ['', ...favoriteGenres, ...GENRES.filter((g) => !favoriteGenres.includes(g))];
  const pickedBooks = genre ? recommended.filter((b) => b.genre === genre) : recommended;
  const current = discoverTab === 'picked' ? { loading, books: pickedBooks } : (lists[listKey] || { loading: true, books: [] });
  const nextDue = s.dueWeek[0];

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-5 pb-10">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {/* Hero */}
          <DashboardHero className="xl:col-span-8" covers={heroCovers} titleId="student-hero-title">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Your library</p>
            <h1 id="student-hero-title" className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Welcome back{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">Find your next read and keep track of due dates and fines.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/student/books" className="btn-primary">{DASH_ICONS.search}Browse books</Link>
              <Link to="/student/my-books" className="btn-secondary">{DASH_ICONS.book}My books</Link>
            </div>
          </DashboardHero>

          {/* Today */}
          <SectionCard id="today" className="xl:col-span-4" title="Today" action={<SectionLink to="/student/my-books?tab=issued">My books</SectionLink>}>
            {loading ? (
              <Skeleton lines={3} className="h-5 w-full" />
            ) : txError ? (
              <EmptyState bare icon="⚠️" title="Couldn't load your loans" message={txError} />
            ) : (
              <div className="space-y-3">
                {readyReservations.map((r) => (
                  <Link
                    key={r._id}
                    to="/student/my-books?tab=reservations"
                    className="flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 transition-colors hover:bg-emerald-500/15"
                  >
                    <span className="mt-0.5 text-emerald-300">{DASH_ICONS.book}</span>
                    <span className="min-w-0 text-sm text-emerald-50">
                      <span className="font-semibold">“{r.bookId?.title || 'A reserved book'}” is ready for you.</span>{' '}
                      Borrow by {formatHoldEnd(r.expiresAt)} <span className="text-emerald-200/80">({holdTimeLeft(r.expiresAt)})</span>
                    </span>
                  </Link>
                ))}
                {s.overdue.length > 0 && (
                  <div className="flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3" role="alert">
                    <span className="mt-0.5 text-rose-300">{DASH_ICONS.alert}</span>
                    <p className="text-sm text-rose-100">
                      <span className="font-semibold">{plural(s.overdue.length, 'book')} overdue.</span>{' '}
                      Fine so far {formatRupees(s.overdueFine)}, growing daily until you return {s.overdue.length === 1 ? 'it' : 'them'}.
                    </p>
                  </div>
                )}
                {s.dueWeek.length > 0 ? (
                  <div>
                    <p className="font-display text-3xl font-bold text-slate-50">{s.dueWeek.length}</p>
                    <p className="text-sm text-slate-300">{s.dueWeek.length === 1 ? 'book is' : 'books are'} due in the next 7 days</p>
                    {nextDue && (
                      <p className="mt-2 text-xs text-slate-400">
                        Next: <span className="font-semibold text-slate-200">{bookOf(nextDue).title || 'A book'}</span> · {formatDate(nextDue.dueDate)}
                        {' '}({num(nextDue.daysRemaining) === 0 ? 'today' : `in ${plural(num(nextDue.daysRemaining), 'day')}`})
                      </p>
                    )}
                  </div>
                ) : s.overdue.length === 0 && readyReservations.length === 0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-300">{DASH_ICONS.check}</span>
                    <p className="text-sm text-slate-200">All clear — nothing due this week.</p>
                  </div>
                ) : null}
                {s.pendingRequests > 0 && (
                  <p className="text-xs text-slate-400">{plural(s.pendingRequests, 'request')} waiting for a librarian.</p>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-busy={loading || undefined}>
          <KpiLink to="/student/my-books?tab=issued" label="Borrowed" value={s.issued} hint={s.pendingRequests ? `${s.pendingRequests} awaiting approval` : 'books with you'} icon={DASH_ICONS.book} tone="indigo" loading={loading} />
          <KpiLink to="/student/my-books?tab=issued" label="Due soon" value={s.dueSoon} hint={`within ${DUE_SOON_DAYS} days`} icon={DASH_ICONS.clock} tone="amber" alert={s.overdue.length > 0} loading={loading} />
          <KpiLink to="/student/fines" label="Fine pending" value={formatRupees(s.pending)} hint={s.accruing ? `${formatRupees(s.accruing)} still growing` : 'unpaid fines'} icon={DASH_ICONS.card} tone="rose" loading={loading} />
          <KpiLink to="/student/wishlist" label="Wishlist" value={wishlistCount ?? 0} hint="saved books" icon={DASH_ICONS.heart} tone="violet" loading={loading && wishlistCount === null} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {/* Discover */}
          <SectionCard id="discover" className="xl:col-span-8" title="Discover" action={<SectionLink to="/student/books">All books</SectionLink>}>
            <DashTabs tabs={DISCOVER_TABS} active={discoverTab} onChange={setDiscoverTab} label="Discover" idPrefix="discover" />
            <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by genre">
              {genrePills.map((g) => (
                <button
                  key={g || 'all'}
                  type="button"
                  aria-pressed={genre === g}
                  onClick={() => setGenre(g)}
                  className={`min-h-[32px] flex-shrink-0 rounded-full border px-3 text-xs font-semibold transition-colors ${
                    genre === g ? 'border-indigo-400/40 bg-indigo-500/15 text-white' : 'border-border text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  {g || 'All genres'}
                </button>
              ))}
            </div>
            <div id="discover-panel" role="tabpanel" aria-labelledby={`discover-tab-${discoverTab}`} className="mt-3">
              {current.loading ? (
                <BookRowSkeleton />
              ) : current.error ? (
                <EmptyState bare icon="⚠️" title="Couldn't load books" message={current.error} />
              ) : current.books.length === 0 ? (
                <EmptyState
                  bare
                  icon={discoverTab === 'popular' ? '📈' : '✨'}
                  title={genre ? `Nothing here for ${genre}` : 'Nothing to show yet'}
                  message={discoverTab === 'picked'
                    ? 'Add favourite genres in Settings to get picks.'
                    : discoverTab === 'popular' ? 'Popular books appear once books are borrowed.' : 'Try another genre.'}
                />
              ) : (
                <div className="dash-book-row">
                  {current.books.map((book) => {
                    const action = actionFor(book);
                    return (
                      <BookCard
                        key={book._id}
                        book={book}
                        onCardClick={() => navigate(`/student/books/${book._id}`)}
                        onActionClick={() => action.onClick?.()}
                        isLoading={requestingBookId === book._id}
                        actionLabel={action.label}
                        actionDisabled={action.disabled || !action.onClick}
                        actionVariant={action.variant}
                        note={action.note}
                        noteTone={action.noteTone}
                        secondaryAction={action.secondary}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </SectionCard>

          {/* My loans */}
          <SectionCard id="my-loans" className="xl:col-span-4" title="My loans" subtitle="Latest 5" action={<SectionLink to="/student/my-books">View all</SectionLink>}>
            {loading ? (
              <Skeleton lines={4} className="h-14 w-full" />
            ) : s.loans.length === 0 ? (
              <EmptyState bare icon="📚" title="No loans yet" message="Request a book and it shows up here." />
            ) : (
              <ul className="divide-y divide-border">
                {s.loans.map((t) => {
                  const book = bookOf(t);
                  return (
                    <li key={t._id}>
                      <Link to={book._id ? `/student/books/${book._id}` : '/student/my-books'} className="flex items-center gap-3 rounded-xl py-2.5 transition-colors hover:bg-white/[0.03]">
                        <span className="h-14 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-input">
                          <CoverImage book={book} src={book.imageUrl || book.coverImage} alt="" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-100">{book.title || 'Unknown title'}</span>
                          <span className="block truncate text-[11px] text-slate-400">
                            {t.status === 'returned' ? `Returned ${formatDate(t.returnDate)}` : `Due ${formatDate(t.dueDate)}`}
                          </span>
                        </span>
                        <span className="flex-shrink-0"><LoanBadge t={t} /></span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          {/* Fines */}
          <SectionCard id="fine-summary" className="xl:col-span-6" title="Fines" subtitle="₹5 per day late" action={<SectionLink to="/student/fines">Details</SectionLink>}>
            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <AmountStat label="Total charged" value={formatRupees(s.paid + s.pending)} hint="paid + pending" />
                <AmountStat label="Paid" value={formatRupees(s.paid)} tone="text-emerald-300" hint="verified by the library" />
                <AmountStat
                  label="Pending"
                  value={formatRupees(s.pending)}
                  tone={s.pending > 0 ? 'text-rose-300' : 'text-slate-50'}
                  hint={s.verifying ? `${formatRupees(s.verifying)} being verified` : s.accruing ? `${formatRupees(s.accruing)} still growing` : 'nothing owed'}
                />
              </div>
            )}
          </SectionCard>

          {/* Quick actions */}
          <SectionCard id="student-quick-actions" className="xl:col-span-6" title="Quick actions">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <QuickTile icon={DASH_ICONS.search} label="Browse books" hint="Search the catalogue" to="/student/books" tone="indigo" />
              <QuickTile icon={DASH_ICONS.book} label="My books" hint="Loans, renewals, returns" to="/student/my-books" tone="cyan" />
              <QuickTile
                icon={DASH_ICONS.card}
                label="Pay fine"
                tone="rose"
                to={s.payable ? `/student/pay-fine/${s.payable._id}` : undefined}
                disabled={!s.payable}
                hint={s.payable
                  ? `${formatRupees(s.payable.fineAmount)} for ${bookOf(s.payable).title || 'a returned book'}`
                  : s.accruing ? 'Request a return first, then pay' : 'Nothing to pay right now'}
              />
              <QuickTile icon={DASH_ICONS.bell} label="Notifications" hint="Requests, reminders, fines" to="/student/notifications" tone="amber" />
            </div>
          </SectionCard>
        </div>
      </div>
    </MainLayout>
  );
};
