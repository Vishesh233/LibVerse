import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { transactionsAPI, booksAPI } from '../services/api';

const toSafeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const CoverFallback = ({ className = '' }) => (
  <div className={`h-full w-full flex items-center justify-center bg-input ${className}`}>
    <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  </div>
);

const BookCover = ({ src, alt, iconClassName = 'text-slate-500' }) => {
  const [failed, setFailed] = useState(false);
  const coverSrc = src || '/default-book-cover.png';

  if (failed || !coverSrc) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-input">
        <svg className={`w-10 h-10 ${iconClassName}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={coverSrc}
      alt={alt || 'Book cover'}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLibrarian } = useAuth();
  const [borrowed, setBorrowed] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState(null);
  const [requestingBookId, setRequestingBookId] = useState(null);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [txResponse, recResponse] = await Promise.all([
        transactionsAPI.getUserTransactions(),
        booksAPI.getRecommendations()
      ]);

      const userTx = Array.isArray(txResponse.data?.transactions) ? txResponse.data.transactions : [];
      const activeBorrowed = userTx.filter((t) => t?.status === 'issued' || t?.status === 'pending');
      setBorrowed(activeBorrowed);

      const recData = recResponse.data;
      if (recData?.success && Array.isArray(recData.recommendations)) {
        setRecommended(recData.recommendations);
        setFavoriteGenres(recData.favoriteGenres || []);
      } else {
        setRecommended([]);
        setFavoriteGenres([]);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
      setBorrowed([]);
      setRecommended([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Use actual borrowed books only - no demo/placeholder data
  const displayBorrowed = useMemo(() => {
    return Array.isArray(borrowed) ? borrowed : [];
  }, [borrowed]);

  const safeRecommended = useMemo(() => {
    return Array.isArray(recommended) ? recommended : [];
  }, [recommended]);

  const stats = useMemo(() => {
    const borrowedBooks = displayBorrowed.length;
    const nextDueDates = displayBorrowed
      .map((item) => (item?.dueDate ? new Date(item.dueDate) : null))
      .filter((d) => d && !Number.isNaN(d.getTime()))
      .sort((a, b) => a - b);
    let nextDueDateText = '—';
    if (nextDueDates.length > 0) {
      const diffDays = Math.ceil((nextDueDates[0] - new Date()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) nextDueDateText = `${Math.abs(diffDays)}d overdue`;
      else if (diffDays === 0) nextDueDateText = 'Today';
      else nextDueDateText = `${diffDays} day${diffDays === 1 ? '' : 's'}`;
    }
    const outstandingFines = toSafeNumber(user?.fineAmount, 0);
    return { borrowedBooks, nextDueDateText, outstandingFines };
  }, [displayBorrowed, user]);

  // If user is librarian or admin, redirect directly to their dashboard
  // NOTE: Placed after all hooks to respect the Rules of Hooks
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isLibrarian) {
    return <Navigate to="/librarian" replace />;
  }

  // If user has no favorite genres, redirect to onboarding
  if (!loading && (!user?.favoriteGenres || user.favoriteGenres.length === 0)) {
    return <Navigate to="/student/onboarding" replace />;
  }

  const handleRenew = async (txId) => {
    if (!txId) {
      toast.error('Unable to renew this book');
      return;
    }
    setRenewingId(txId);
    if (typeof txId === 'string' && txId.startsWith('demo-')) {
      setTimeout(() => {
        toast.success('Book renewed successfully! Due date extended by 7 days.');
        setRenewingId(null);
      }, 500);
      return;
    }

    try {
      await transactionsAPI.renewBook(txId);
      toast.success('Book renewed successfully! Extended by 7 days.');
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to renew book';
      toast.error(msg);
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
      toast.success('Issue request submitted to admin!');
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request book';
      toast.error(msg);
    } finally {
      setRequestingBookId(null);
    }
  };

  // Helper to get recommendation reason for a book
  const getRecommendationReason = (book) => {
    if (!book || !favoriteGenres || favoriteGenres.length === 0) return null;
    const bookGenre = book.genre;
    if (bookGenre && favoriteGenres.includes(bookGenre)) {
      return `Recommended because you like ${bookGenre}`;
    }
    return `Based on your interest in ${favoriteGenres[0]}`;
  };

  const statCards = [
    {
      label: 'Borrowed Books',
      value: stats.borrowedBooks,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      accent: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    },
    {
      label: 'Next Due Date',
      value: stats.nextDueDateText,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      accent: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },
    {
      label: 'Outstanding Fines',
      value: `$${toSafeNumber(stats.outstandingFines, 0).toFixed(2)}`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 8v2m0-6c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    },
  ];

  // Show error state if data loading failed
  if (error && !loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-8 p-2 sm:p-4 lg:p-0">
          <div className="card p-8 text-center">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 text-rose-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Unable to Load Dashboard</h2>
              <p className="text-slate-400 mb-6">{error}</p>
              <button
                onClick={loadData}
                className="btn-primary px-6 py-3"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8 p-2 sm:p-4 lg:p-0">
        {/* Title Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">My Library</h1>
          <p className="mt-1 text-sm text-slate-400">Track your borrowed books and discover new ones</p>
        </div>

        {/* Top 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="card flex items-center gap-4 p-5 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div className={`h-14 w-14 rounded-2xl border flex items-center justify-center flex-shrink-0 ${card.accent}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100 leading-none">{card.value}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Section: Currently Borrowed - Only show if user has borrowed books */}
        {displayBorrowed.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-100">Currently Borrowed</h2>
              <span className="badge-amo badge-primary">{displayBorrowed.length} active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {displayBorrowed.map((item, index) => {
                // bookId may be a populated object OR a bare id string
                const book = item?.bookId && typeof item.bookId === 'object' ? item.bookId : {};
                const bookTitle = book.title || item?.title || 'Unknown Title';
                const bookAuthor = book.author || item?.author || 'Unknown Author';
                const bookPublisher =
                  typeof book.publisher === 'string'
                    ? book.publisher
                    : book.publisher?.name || 'Unknown Publisher';
                const bookYear = book.publicationYear || 'N/A';
                const bookGenre = book.genre || 'Uncategorized';
                const safeRating = toSafeNumber(book.rating, 0);
                const rawDueDate = item?.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A';
                const formattedDueDate =
                  item?.dueDate && typeof item.dueDate === 'string' && item.dueDate.includes('/')
                    ? item.dueDate
                    : rawDueDate;

                // Theme palette matching the 3 cards (Purple, Green, Blue)
                const themes = [
                  { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/20' },
                  { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' },
                  { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/20' },
                ];
                const theme = themes[index % 3];

                // Calculate days remaining
                const getDaysRemaining = (dueDate) => {
                  if (!dueDate) return null;
                  const due = new Date(dueDate);
                  if (Number.isNaN(due.getTime())) return null;
                  const now = new Date();
                  const diffTime = due - now;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays;
                };

                const daysRemaining = getDaysRemaining(item?.dueDate);
                const bookId = book._id || (typeof item?.bookId === 'string' ? item.bookId : null);

                const handleCardClick = () => {
                  if (bookId) {
                    navigate(`/student/books/${bookId}`);
                  }
                };

                return (
                  <div
                    key={item?._id || index}
                    onClick={handleCardClick}
                    className="rounded-2xl border border-border p-5 bg-input flex flex-col justify-between hover:shadow-glow transition-all duration-250 hover:-translate-y-0.5 cursor-pointer"
                  >
                    {/* Top Row: Rating Badge */}
                    {safeRating > 0 && (
                      <div className="flex justify-end mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {safeRating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Middle Section: Cover + Metadata */}
                    <div className="flex gap-4">
                      {/* Book Cover — safe fallback, no nextSibling access */}
                      <div className="h-28 w-20 overflow-hidden rounded-2xl bg-input border border-border flex-shrink-0">
                        <BookCover src={book.coverImage} alt={bookTitle} iconClassName={theme.text} />
                      </div>

                      {/* Book Metadata */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Publisher</p>
                          <p className="text-xs font-medium text-slate-300 truncate">{bookPublisher}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Year</p>
                          <p className="text-xs font-medium text-slate-300">{bookYear}</p>
                        </div>
                        <div>
                          <span className="inline-flex rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-500/20">
                            {bookGenre}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section: Title, Author, Due Date, Renew */}
                    <div className="mt-4 pt-3 border-t border-border space-y-2">
                      <h3 className="font-bold text-slate-100 text-sm leading-snug line-clamp-2">{bookTitle}</h3>
                      <p className="text-xs text-slate-400 font-normal">by {bookAuthor}</p>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex flex-col">
                          <span className="text-slate-400 font-medium">Due: {formattedDueDate}</span>
                          {daysRemaining !== null && (
                            <span
                              className={`text-[11px] font-semibold mt-0.5 ${
                                daysRemaining < 0
                                  ? 'text-rose-400'
                                  : daysRemaining <= 3
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {daysRemaining < 0
                                ? `${Math.abs(daysRemaining)} days overdue`
                                : daysRemaining === 0
                                ? 'Due today'
                                : `${daysRemaining} days remaining`}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenew(item?._id);
                          }}
                          disabled={renewingId === item?._id}
                          className="btn-warning text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {renewingId === item?._id ? 'Renewing...' : 'Renew'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Section: Recommended for You */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-100">Books Picked Just For You</h2>
            <span className="text-xs text-slate-400 font-medium">Based on your interests and favorite genres</span>
          </div>

          {loading && safeRecommended.length === 0 ? (
            <div className="card p-8 text-center text-sm text-slate-400">
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-indigo-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading recommendations...
              </div>
            </div>
          ) : safeRecommended.length === 0 && !error ? (
            <div className="card p-8 text-center text-sm text-slate-400">
              <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              No recommendations available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {safeRecommended.slice(0, 6).map((book, index) => {
                if (!book || typeof book !== 'object') return null;
                const id = book._id || book.id || `rec-${index}`;
                const bookPath = `/student/books/${id}`;
                const availableCopies = toSafeNumber(book.availableCopies, 0);

                return (
                  <div
                    key={id}
                    onClick={() => book._id && navigate(bookPath)}
                    className="card p-5 transition-all duration-250 hover:-translate-y-1 hover:shadow-glow hover:border-indigo-500/30 cursor-pointer flex flex-col"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-28 w-20 overflow-hidden rounded-2xl bg-input flex-shrink-0">
                        {/* Safe cover: no nextSibling access that can throw */}
                        <BookCover src={book.coverImage} alt={book.title || 'Book'} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-slate-100 line-clamp-2">
                          {book.title || 'Untitled'}
                        </h3>
                        <p className="mt-2 text-sm text-slate-300 line-clamp-1">{book.author || 'Unknown Author'}</p>
                        {book.genre && (
                          <span className="mt-3 inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                            {book.genre}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Recommendation Reason Label */}
                    {getRecommendationReason(book) && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-indigo-300 font-medium flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {getRecommendationReason(book)}
                        </p>
                      </div>
                    )}
                    <div className="mt-5 flex-1">
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                        {book.description || book.summary || 'A great read to help improve your knowledge and skills.'}
                      </p>
                    </div>
                    <div className="mt-5 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestBook(book._id);
                        }}
                        disabled={requestingBookId === book._id || availableCopies <= 0}
                        className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {requestingBookId === book._id
                          ? 'Requesting...'
                          : availableCopies > 0
                          ? 'Request Book'
                          : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
