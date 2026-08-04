import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { booksAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { DeleteBookModal } from '../components/DeleteBookModal';
import { GENRES } from '../constants/genres';

const PLACEHOLDER_COVER = 'https://via.placeholder.com/400x300?text=No+Cover';

export const ManageBooks = () => {
  const navigate = useNavigate();
  const { isAdmin, isLibrarian } = useAuth();
  const canAccess = isAdmin || isLibrarian;
  const addPath = isAdmin ? '/admin/books/add' : '/librarian/books/add';
  const editPath = (id) => (isAdmin ? `/admin/books/${id}/edit` : `/librarian/books/${id}/edit`);
  const detailsPath = (id) => (isAdmin ? `/admin/books/${id}` : `/librarian/books/${id}`);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await booksAPI.getBooks({ limit: 100 });
      setBooks(res.data.books || []);
      setError(null);
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await booksAPI.deleteBook(confirmDelete._id);
      toast.success('Book deleted successfully!');
      setBooks((prev) => prev.filter((b) => b._id !== confirmDelete._id));
      setConfirmDelete(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete book';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  if (!canAccess) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <p className="text-rose-400 font-semibold">Access Denied: Librarian/Admin only</p>
        </div>
      </MainLayout>
    );
  }

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      !debouncedSearch ||
      book.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      book.author?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesGenre = !genre || book.genre === genre;
    return matchesSearch && matchesGenre;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">📚 Book Collection</h1>
            <p className="mt-1 text-sm text-slate-400">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} available
            </p>
          </div>
          <button
            onClick={() => navigate(addPath)}
            className="btn-primary whitespace-nowrap"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New Book
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Search & Filters */}
        <div className="card p-4 sm:p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full input-amo input-search"
              />
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full input-amo"
              >
                <option value="">All Categories</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid/List Toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-input p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`grid h-9 w-9 place-items-center rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Grid view"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`grid h-9 w-9 place-items-center rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="List view"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Books Display */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-28 w-20 rounded-2xl bg-slate-800" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-3/4 rounded bg-slate-800" />
                    <div className="h-3 w-1/2 rounded bg-slate-800" />
                    <div className="h-6 w-20 rounded-full bg-slate-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-400 font-medium">No books found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                onClick={() => navigate(detailsPath(book._id))}
                className="card cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-glow hover:border-indigo-500/30"
              >
                <div className="flex items-start gap-4">
                  <div className="h-28 w-20 overflow-hidden rounded-2xl bg-input flex-shrink-0">
                    <img
                      src={book.coverImage || PLACEHOLDER_COVER}
                      alt={book.title}
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_COVER; }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-slate-100 line-clamp-2">{book.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-400 line-clamp-1">{book.author}</p>
                    {book.genre && (
                      <span className="mt-2.5 inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                        {book.genre}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Available Copies</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {book.availableCopies ?? book.copiesAvailable ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">Total Copies</span>
                    <span className="text-sm font-bold text-slate-100">{book.totalCopies ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">Issued Copies</span>
                    <span className="text-sm font-bold text-amber-400">{book.issuedCopies ?? 0}</span>
                  </div>
                  {book.rating && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">Rating</span>
                      <span className="text-sm font-bold text-amber-400">⭐ {book.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(editPath(book._id));
                    }}
                    className="flex-1 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(book);
                    }}
                    className="flex-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/20"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBooks.map((book) => (
              <div
                key={book._id}
                onClick={() => navigate(detailsPath(book._id))}
                className="card cursor-pointer transition-all duration-250 hover:shadow-glow hover:border-indigo-500/30 flex items-center gap-4"
              >
                <div className="h-20 w-14 overflow-hidden rounded-xl bg-input flex-shrink-0">
                  <img
                    src={book.coverImage || PLACEHOLDER_COVER}
                    alt={book.title}
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_COVER; }}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-100 line-clamp-1">{book.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-1">by {book.author}</p>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    {book.genre && (
                      <span className="inline-flex rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-500/20">
                        {book.genre}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500">
                      {book.availableCopies ?? book.copiesAvailable ?? 0} copies available
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(editPath(book._id));
                    }}
                    className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(book);
                    }}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/20"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteBookModal
        isOpen={!!confirmDelete}
        bookTitle={confirmDelete?.title}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </MainLayout>
  );
};