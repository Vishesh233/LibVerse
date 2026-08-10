import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { booksAPI, transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { BookCard } from '../components/BookCard';
import { EmptyState } from '../components/UI';
import { Alert } from '../components/Alert';
import { Loader, SkeletonCard } from '../components/Loader';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { useWishlist } from '../hooks/useWishlist';
import { GENRES } from '../constants/genres';

export const Books = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [books, setBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [issuingId, setIssuingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [availability, setAvailability] = useState('');
  const [page, setPage] = useState(1);

  // Sync filter state to URL search params so category/rating/page survive
  // navigation and browser back/forward.
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTitle) params.set('title', searchTitle);
    if (searchAuthor) params.set('author', searchAuthor);
    if (genre) params.set('genre', genre);
    if (rating) params.set('rating', rating);
    if (availability) params.set('availability', availability);
    if (page > 1) params.set('page', String(page));
    const queryString = params.toString();
    const newSearch = queryString ? `?${queryString}` : '';
    if (location.search !== newSearch) {
      navigate({ pathname: location.pathname, search: newSearch }, { replace: true });
    }
  }, [searchTitle, searchAuthor, genre, rating, availability, page, navigate, location.pathname]);

  // Tracks whether the first load has completed. After that, we keep the
  // existing content visible while refetching (no skeleton flash on filters).
  const hasLoadedRef = useRef(false);

  const debouncedTitle = useDebounce(searchTitle, 300);
  const debouncedAuthor = useDebounce(searchAuthor, 300);

  const { isStudent, isAdmin, isLibrarian } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const manageBooksPath = isAdmin ? '/admin/books' : isLibrarian ? '/librarian/books' : null;

  const fetchBooks = useCallback(async () => {
    // Only show the skeleton loader on the initial load. Subsequent fetches
    // (filters, search, pagination, re-issue) keep the existing grid visible
    // to avoid flickering.
    if (!hasLoadedRef.current) {
      setLoading(true);
    }
    try {
      const res = await booksAPI.getBooks({
        title: debouncedTitle,
        author: debouncedAuthor,
        genre,
        rating,
        availability,
        page,
        limit: 12
      });

      setBooks(res.data.books || []);
      setTotalPages(res.data.pages || 1);
      hasLoadedRef.current = true;
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [debouncedTitle, debouncedAuthor, genre, rating, availability, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Restore filters from URL search params when they change (e.g. back button).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const g = params.get('genre') || '';
    const r = params.get('rating') || '';
    const a = params.get('availability') || '';
    const p = params.get('page') || '1';
    const t = params.get('title') || '';
    const au = params.get('author') || '';
    setGenre(g);
    setRating(r);
    setAvailability(a);
    setPage(Number(p));
    setSearchTitle(t);
    setSearchAuthor(au);
  }, [location.search]);

  const handleIssueBook = useCallback(async (bookId) => {
    setIssuingId(bookId);
    try {
      await transactionsAPI.requestIssueBook({ bookId });
      setSuccess('Book request submitted!');
      fetchBooks();
    } catch {
      setError('Request failed');
    } finally {
      setIssuingId(null);
    }
  }, [fetchBooks]);

  const handleWishlistToggle = useCallback((book) => {
    toggleWishlist(book);
    setSuccess(isWishlisted(book._id) ? 'Removed from wishlist' : 'Added to wishlist');
  }, [toggleWishlist, isWishlisted]);

  const handleClearFilters = useCallback(() => {
    setSearchTitle('');
    setSearchAuthor('');
    setGenre('');
    setRating('');
    setAvailability('');
    setPage(1);
  }, []);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">📖 Browse Books</h1>
          <p className="mt-1 text-sm text-slate-400">Discover your next great read from our collection</p>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        {/* Filter Section */}
        <div className="card p-4 sm:p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search by Title
              </label>
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Book title..."
                className="w-full input-amo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search by Author
              </label>
              <input
                type="text"
                value={searchAuthor}
                onChange={(e) => setSearchAuthor(e.target.value)}
                placeholder="Author name..."
                className="w-full input-amo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Filter by Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full input-amo"
              >
                <option value="">All Genres</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Minimum Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full input-amo"
              >
                <option value="">Any Rating</option>
                <option value="4">⭐ 4+</option>
                <option value="3">⭐ 3+</option>
                <option value="2">⭐ 2+</option>
                <option value="1">⭐ 1+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full input-amo"
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <div>
              <button
                onClick={handleClearFilters}
                className="mt-7 w-full btn-warning"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Show skeleton only on the very first load. When books already exist
            (filter/search/pagination changes), keep the current grid stable. */}
        {loading && books.length === 0 ? (
          <SkeletonCard count={12} />
        ) : books.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="No Books Found"
              message="No books match your current search or filters. Try adjusting them."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onCardClick={() =>
                  navigate(`/student/books/${book._id}`, {
                    state: { genre, searchTitle, searchAuthor, rating, availability, page },
                  })
                }
                onActionClick={() => handleIssueBook(book._id)}
                onWishlistClick={handleWishlistToggle}
                isWishlisted={isWishlisted(book._id)}
                isLoading={issuingId === book._id}
                actionLabel={
                  issuingId === book._id
                    ? 'Requesting...'
                    : book.availableCopies > 0
                    ? 'Request Book'
                    : 'Unavailable'
                }
                actionDisabled={!isStudent || book.availableCopies === 0}
              />
            ))}
          </div>
        )}

        {manageBooksPath && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate(manageBooksPath)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transition hover:opacity-95"
            >
              Show All Books
            </button>
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </MainLayout>
  );
};