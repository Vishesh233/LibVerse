import React, { useEffect, useState } from 'react';
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

  const [books, setBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [issuingId, setIssuingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [page, setPage] = useState(1);

  const debouncedTitle = useDebounce(searchTitle, 300);
  const debouncedAuthor = useDebounce(searchAuthor, 300);

  const { isStudent, isAdmin, isLibrarian } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const location = useLocation();
  const manageBooksPath = isAdmin ? '/admin/books' : isLibrarian ? '/librarian/books' : null;

  useEffect(() => {
    fetchBooks();
  }, [debouncedTitle, debouncedAuthor, genre, page]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('title') || params.get('author') || '';
    setSearchTitle(query);
    setSearchAuthor(query);
    setPage(1);
  }, [location.search]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await booksAPI.getBooks({
        title: debouncedTitle,
        author: debouncedAuthor,
        genre,
        page,
        limit: 12
      });

      setBooks(res.data.books || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async (bookId) => {
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
  };

  const handleWishlistToggle = (book) => {
    toggleWishlist(book);
    setSuccess(isWishlisted(book._id) ? 'Removed from wishlist' : 'Added to wishlist');
  };

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
              <button
                onClick={() => {
                  setSearchTitle('');
                  setSearchAuthor('');
                  setGenre('');
                  setPage(1);
                }}
                className="mt-7 w-full btn-warning"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <SkeletonCard count={12} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onCardClick={() => navigate(`/student/books/${book._id}`)}
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