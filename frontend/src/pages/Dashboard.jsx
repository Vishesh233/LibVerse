import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { transactionsAPI, booksAPI } from '../services/api';
import { CoverImage } from '../components/CoverImage';
import { Badge, Button, Card, EmptyState, PageHeader, Skeleton } from '../components/UI';
import { getDaysUntilDue } from '../utils/fineCalculator';
import { formatDate } from '../utils/dateUtils';
import { ACTIVE_LOAN_STATUSES } from '../hooks/useActiveBookIds';
import { genreAccentStyle } from '../constants/genres';

const MAX_RENEWALS = 3;
const DUE_SOON_DAYS = 3;
// Statuses where the book is still with the student
const ON_LOAN = ['issued', 'return_requested', 'payment_pending'];

const toSafeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const daysLeftOf = (t) => {
  const due = t?.dueDate ? new Date(t.dueDate) : null;
  if (!due || Number.isNaN(due.getTime())) return null;
  return getDaysUntilDue(due);
};

// Still issued: fine grows daily. After a return request: the fixed amount to pay.
const fineOf = (t) => toSafeNumber(t?.status === 'issued' ? t.fine : t.fineAmount, 0);

const bookOf = (t) => (t?.bookId && typeof t.bookId === 'object' ? t.bookId : {});

const DaysBadge = ({ days }) => {
  if (days === null) return null;
  if (days < 0) return <Badge variant="danger">{Math.abs(days)} day{Math.abs(days) === 1 ? '' : 's'} overdue</Badge>;
  if (days === 0) return <Badge variant="warning">Due today</Badge>;
  if (days <= DUE_SOON_DAYS) return <Badge variant="warning">{days} day{days === 1 ? '' : 's'} left</Badge>;
  return <Badge variant="success">{days} days left</Badge>;
};

const KpiCard = ({ label, value, hint, tone, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`card-glass flex w-full items-center gap-4 !p-5 text-left transition-all duration-250 hover:-translate-y-0.5 hover:shadow-glow motion-reduce:hover:translate-y-0 ${tone.ring}`}
  >
    <div className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl border ${tone.icon}`} aria-hidden="true">{icon}</div>
    <div className="min-w-0">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="font-display text-2xl font-bold leading-tight text-slate-50">{value}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-muted">{hint}</p>}
    </div>
  </button>
);

const ICONS = {
  book: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  ),
  clock: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  alert: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
  ),
};

const DashboardSkeleton = () => (
  <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
    <div className="grid gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
    </div>
    <Skeleton className="h-56 w-full" />
    <div className="flex gap-4 overflow-hidden">
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-[2/3] w-40 flex-shrink-0" />)}
    </div>
  </div>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLibrarian } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState(null);
  const [requestingBookId, setRequestingBookId] = useState(null);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [txResponse, recResponse] = await Promise.all([
        transactionsAPI.getUserTransactions(),
        booksAPI.getRecommendations(),
      ]);

      setTransactions(Array.isArray(txResponse.data?.transactions) ? txResponse.data.transactions : []);

      const recData = recResponse.data;
      if (recData?.success && Array.isArray(recData.recommendations)) {
        setRecommended(recData.recommendations);
        setFavoriteGenres(recData.favoriteGenres || []);
      } else {
        setRecommended([]);
        setFavoriteGenres([]);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load dashboard data. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onLoan = useMemo(
    () => transactions
      .filter((t) => ON_LOAN.includes(t?.status))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [transactions]
  );
  const pendingCount = useMemo(() => transactions.filter((t) => t?.status === 'pending').length, [transactions]);
  const activeBookIds = useMemo(
    () => new Set(transactions.filter((t) => ACTIVE_LOAN_STATUSES.includes(t?.status)).map((t) => String(bookOf(t)._id || t.bookId))),
    [transactions]
  );

  const stats = useMemo(() => {
    const issued = onLoan.filter((t) => t.status === 'issued');
    const dueSoon = issued.filter((t) => {
      const d = daysLeftOf(t);
      return d !== null && d >= 0 && d <= DUE_SOON_DAYS;
    });
    const overdue = onLoan.filter((t) => {
      const d = daysLeftOf(t);
      return d !== null && d < 0;
    });
    // Server-calculated fine on books still out (and not yet paid)
    const fineTotal = onLoan.reduce((sum, t) => (t.finePaid ? sum : sum + fineOf(t)), 0);
    const nextDue = issued.map(daysLeftOf).filter((d) => d !== null && d >= 0).sort((a, b) => a - b)[0];
    return { borrowed: onLoan.length, dueSoon: dueSoon.length, overdue: overdue.length, fineTotal, nextDue };
  }, [onLoan]);

  // If user is librarian or admin, redirect directly to their dashboard
  // NOTE: Placed after all hooks to respect the Rules of Hooks
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isLibrarian) {
    return <Navigate to="/librarian" replace />;
  }

  // Onboarding should ONLY appear for brand-new users who have NOT completed onboarding.
  // Existing users (isOnboardingCompleted === true) must NEVER be redirected to onboarding,
  // even if favoriteGenres is empty. This preserves existing accounts.
  if (!loading && user?.role === 'student' && user?.isOnboardingCompleted === false) {
    return <Navigate to="/student/onboarding" replace />;
  }

  const handleRenew = async (txId) => {
    if (!txId) {
      toast.error('Unable to renew this book');
      return;
    }
    setRenewingId(txId);
    try {
      await transactionsAPI.renewBook(txId);
      toast.success('Renewed. Your due date moved 7 days later.');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew book');
    } finally {
      setRenewingId(null);
    }
  };

  const handleRequestBook = async (bookId) => {
    if (!bookId) {
      toast.error('Unable to request this book');
      return;
    }
    setRequestingBookId(bookId);
    try {
      await transactionsAPI.requestIssueBook({ bookId });
      toast.success('Request sent. A librarian will review it shortly.');
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request book');
    } finally {
      setRequestingBookId(null);
    }
  };

  // Helper to get recommendation reason for a book
  const getRecommendationReason = (book) => {
    if (!book || !favoriteGenres || favoriteGenres.length === 0) return null;
    if (book.genre && favoriteGenres.includes(book.genre)) return `Because you like ${book.genre}`;
    return `Based on your interest in ${favoriteGenres[0]}`;
  };

  const firstName = (user?.name || '').trim().split(/\s+/)[0];

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title={firstName ? `Hi, ${firstName}` : 'My library'}
          subtitle="Your loans, due dates and books picked for you."
          actions={<Button fullWidth={false} onClick={() => navigate('/student/books')}>Browse books</Button>}
        />

        {loading ? (
          <DashboardSkeleton />
        ) : error && transactions.length === 0 && recommended.length === 0 ? (
          <EmptyState
            icon="⚠️"
            title="Unable to load your dashboard"
            message={error}
            action={<Button fullWidth={false} onClick={() => { setLoading(true); loadData(); }}>Try again</Button>}
          />
        ) : (
          <div className="space-y-8">
            {/* KPI cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <KpiCard
                label="Currently borrowed"
                value={stats.borrowed}
                hint={pendingCount > 0 ? `${pendingCount} request${pendingCount === 1 ? '' : 's'} awaiting approval` : 'Books with you right now'}
                tone={{ icon: 'border-indigo-500/25 bg-indigo-500/10 text-indigo-300', ring: '' }}
                icon={ICONS.book}
                onClick={() => navigate('/student/my-books')}
              />
              <KpiCard
                label="Due soon"
                value={stats.dueSoon}
                hint={stats.nextDue === undefined ? 'Nothing due soon' : stats.nextDue === 0 ? 'Next one is due today' : `Next due in ${stats.nextDue} day${stats.nextDue === 1 ? '' : 's'}`}
                tone={{ icon: 'border-amber-500/25 bg-amber-500/10 text-amber-300', ring: stats.dueSoon > 0 ? '!border-amber-500/30' : '' }}
                icon={ICONS.clock}
                onClick={() => navigate('/student/my-books?tab=issued')}
              />
              <KpiCard
                label="Overdue + fine"
                value={`${stats.overdue} · ₹${stats.fineTotal}`}
                hint={stats.overdue > 0 ? '₹5 per day until returned' : 'No overdue books'}
                tone={{ icon: 'border-rose-500/25 bg-rose-500/10 text-rose-300', ring: stats.overdue > 0 ? '!border-rose-500/40' : '' }}
                icon={ICONS.alert}
                onClick={() => navigate('/student/fines')}
              />
            </div>

            {/* Currently borrowed */}
            <section aria-labelledby="borrowed-heading">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 id="borrowed-heading" className="text-lg font-semibold text-slate-100">Currently borrowed</h2>
                {onLoan.length > 0 && (
                  <Button size="sm" variant="ghost" fullWidth={false} onClick={() => navigate('/student/my-books')}>View all</Button>
                )}
              </div>

              {onLoan.length === 0 ? (
                <EmptyState
                  icon="📚"
                  title="Nothing borrowed right now"
                  message={pendingCount > 0 ? `You have ${pendingCount} request${pendingCount === 1 ? '' : 's'} waiting for a librarian.` : 'Pick a book from the catalogue and request it.'}
                  action={<Button fullWidth={false} variant="secondary" onClick={() => navigate(pendingCount > 0 ? '/student/my-books?tab=pending' : '/student/books')}>{pendingCount > 0 ? 'View requests' : 'Browse books'}</Button>}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {onLoan.map((t) => {
                    const book = bookOf(t);
                    const days = daysLeftOf(t);
                    const isOverdue = days !== null && days < 0;
                    const renewals = toSafeNumber(t.renewalCount, 0);
                    const canRenew = t.status === 'issued' && !isOverdue && renewals < MAX_RENEWALS;
                    const fine = fineOf(t);

                    return (
                      <Card key={t._id} variant="glass" className={`!p-4 ${isOverdue ? '!border-rose-500/30' : ''}`}>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => book._id && navigate(`/student/books/${book._id}`)}
                            aria-label={`${book.title || 'Book'} details`}
                            className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-input"
                          >
                            <CoverImage book={book} src={book.imageUrl || book.coverImage} alt="" />
                          </button>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold leading-snug text-slate-100 line-clamp-2">{book.title || 'Unknown title'}</h3>
                            <p className="mt-0.5 text-sm text-slate-400 line-clamp-1">{book.author || 'Unknown author'}</p>
                            <p className="mt-2 text-xs text-muted">Due {formatDate(t.dueDate)}</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              <DaysBadge days={days} />
                              {fine > 0 && !t.finePaid && <Badge variant="danger">Fine ₹{fine}</Badge>}
                              {t.status === 'return_requested' && <Badge variant="info">Return requested</Badge>}
                              {t.status === 'payment_pending' && <Badge variant="warning">Payment pending</Badge>}
                            </div>
                          </div>
                        </div>
                        {t.status === 'issued' && (
                          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                            <span className="text-xs text-muted">
                              {isOverdue ? 'Overdue books cannot be renewed' : `Renewed ${renewals}/${MAX_RENEWALS}`}
                            </span>
                            <Button
                              size="sm"
                              variant="secondary"
                              fullWidth={false}
                              loading={renewingId === t._id}
                              disabled={!canRenew}
                              onClick={() => handleRenew(t._id)}
                            >
                              {renewingId === t._id ? 'Renewing...' : 'Renew'}
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recommendations */}
            <section aria-labelledby="recs-heading">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <h2 id="recs-heading" className="text-lg font-semibold text-slate-100">Picked for you</h2>
                <span className="text-xs text-slate-400">Based on your favorite genres</span>
              </div>

              {recommended.length === 0 ? (
                <EmptyState
                  icon="✨"
                  title="No recommendations yet"
                  message="Add favorite genres to your profile to get better picks."
                  action={<Button fullWidth={false} variant="secondary" onClick={() => navigate('/student/profile')}>Edit favorite genres</Button>}
                />
              ) : (
                <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
                  {recommended.slice(0, 8).map((book) => {
                    if (!book || typeof book !== 'object' || !book._id) return null;
                    const available = toSafeNumber(book.availableCopies, 0);
                    const requested = activeBookIds.has(String(book._id));
                    const reason = getRecommendationReason(book);
                    let label = 'Request';
                    if (requestingBookId === book._id) label = 'Requesting...';
                    else if (requested) label = 'Requested';
                    else if (available <= 0) label = 'Unavailable';

                    return (
                      <div key={book._id} style={genreAccentStyle(book.genre)} className="book-card !h-auto w-40 flex-shrink-0 snap-start sm:w-44">
                        <button
                          type="button"
                          onClick={() => navigate(`/student/books/${book._id}`)}
                          aria-label={`${book.title || 'Book'} details`}
                          className="book-card__frame focus-visible:[outline-offset:-3px]"
                        >
                          <CoverImage book={book} src={book.imageUrl || book.coverImage} alt="" className="book-card__cover" />
                          <span className="book-card__scrim" />
                          <span className={`glass-pill absolute left-2 top-2 ${available > 0 ? 'glass-pill--success' : 'glass-pill--danger'}`}>
                            {available > 0 ? `${available} available` : 'Not available'}
                          </span>
                          {toSafeNumber(book.rating, 0) > 0 && (
                            <span className="glass-pill glass-pill--rating absolute bottom-2 left-2">
                              <span aria-hidden="true">★</span>
                              <span className="sr-only">Rating</span>
                              {toSafeNumber(book.rating, 0).toFixed(1)}
                            </span>
                          )}
                        </button>
                        <div className="flex flex-1 flex-col p-3">
                          <h3 className="text-sm font-semibold leading-snug text-slate-100 line-clamp-2">{book.title || 'Untitled'}</h3>
                          <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{book.author || 'Unknown author'}</p>
                          {book.genre && (
                            <div className="mt-2">
                              <span className="genre-badge">{book.genre}</span>
                            </div>
                          )}
                          {reason && <p className="mt-1.5 text-[11px] leading-snug text-cyan-300/90 line-clamp-2">{reason}</p>}
                          <div className="mt-auto pt-3">
                            <Button
                              size="sm"
                              loading={requestingBookId === book._id}
                              disabled={requested || available <= 0}
                              onClick={() => handleRequestBook(book._id)}
                            >
                              {label}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
