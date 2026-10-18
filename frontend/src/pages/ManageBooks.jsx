import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { booksAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { DeleteBookModal } from '../components/DeleteBookModal';
import { CoverImage } from '../components/CoverImage';
import { GENRES } from '../constants/genres';
import { Pagination } from '../components/Pagination';

const PAGE_SIZE = 24;
const MAX_LABELS = 100; // one label print view (GET /books?ids= returns at most 100)
const pageFrom = (value) => Math.max(1, parseInt(value, 10) || 1);

/** Checkbox shown on each book while choosing books for QR labels */
const SelectBox = ({ book, checked, onToggle }) => (
  <label className="absolute right-3 top-3 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-white/15 bg-slate-950/80" onClick={(e) => e.stopPropagation()}>
    <input
      type="checkbox"
      className="h-4 w-4 cursor-pointer accent-cyan-400"
      checked={checked}
      onChange={() => onToggle(book)}
      aria-label={`Select “${book.title}” for QR labels`}
    />
  </label>
);

export const ManageBooks = () => {
  const navigate = useNavigate();
  const { isAdmin, isLibrarian } = useAuth();
  const canAccess = isAdmin || isLibrarian;
  const addPath = isAdmin ? '/admin/books/add' : '/librarian/books/add';
  const editPath = (id) => (isAdmin ? `/admin/books/${id}/edit` : `/librarian/books/${id}/edit`);
  const detailsPath = (id) => (isAdmin ? `/admin/books/${id}` : `/librarian/books/${id}`);
  const labelsPath = isAdmin ? '/admin/books/labels' : '/librarian/books/labels';

  // QR labels: books picked across pages (id -> title), kept while paging and filtering
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState(() => new Map());
  const toggleSelected = (book) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(book._id)) next.delete(book._id);
      else if (next.size >= MAX_LABELS) {
        toast.info(`You can print up to ${MAX_LABELS} labels at a time.`);
        return prev;
      } else next.set(book._id, book.title);
      return next;
    });
  };
  const openBook = (book) => (selecting ? toggleSelected(book) : navigate(detailsPath(book._id)));

  // Page, search and genre live in the URL (?page=&q=&genre=) so reload and back keep the view
  const [searchParams, setSearchParams] = useSearchParams();
  const page = pageFrom(searchParams.get('page'));
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';

  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState(q);
  const [viewMode, setViewMode] = useState('grid');

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  /** Update URL params; page 1 and empty values are left out of the URL */
  const updateParams = useCallback((changes) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined || (key === 'page' && Number(value) <= 1)) next.delete(key);
        else next.set(key, String(value));
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Debounced search box -> ?q= and back to page 1
  useEffect(() => {
    const value = debouncedSearch.trim();
    if (value !== q) updateParams({ q: value, page: 1 });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Back/forward or a pasted URL: keep the input in sync with ?q=
  useEffect(() => {
    if (q !== debouncedSearch.trim()) setSearch(q);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (q) params.q = q;
      if (genre) params.genre = genre;
      const res = await booksAPI.getBooks(params);
      const serverPages = Math.max(1, res.data.pages || 1);
      // Past the last page (e.g. after deleting the only book on it): go to the last page
      if (page > serverPages && (res.data.total || 0) > 0) {
        updateParams({ page: serverPages });
        return;
      }
      setBooks(res.data.books || []);
      setTotal(res.data.total || 0);
      setPages(serverPages);
      setError(null);
    } catch (err) {
      setError('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [page, q, genre, updateParams]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await booksAPI.deleteBook(confirmDelete._id);
      toast.success('Book deleted successfully!');
      setConfirmDelete(null);
      await fetchBooks(); // the server total and page contents change
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

  const filteredBooks = books; // already filtered and paginated by the server
  const filtered = Boolean(q || genre);
  const copiesLabel = (book) => `${book.availableCopies ?? 0} of ${book.totalCopies ?? 0} available`;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">📚 Book Collection</h1>
            <p className="mt-1 text-sm text-slate-400" aria-live="polite">
              {loading && total === 0
                ? 'Loading books...'
                : `${total.toLocaleString()} ${total === 1 ? 'book' : 'books'}${filtered ? ' match your filters' : ' in the collection'}${pages > 1 ? ` · page ${page} of ${pages}` : ''}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelecting((s) => !s)}
              aria-pressed={selecting}
              className={`${selecting ? 'btn-primary' : 'btn-secondary'} whitespace-nowrap`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              </svg>
              {selecting ? 'Done selecting' : 'Select for labels'}
            </button>
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
        </div>

        {(selecting || selected.size > 0) && (
          <div className="sticky top-2 z-20 mb-6 flex flex-col gap-3 rounded-2xl border border-cyan-400/30 bg-slate-950/90 p-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between" role="region" aria-label="QR label selection">
            <p className="text-sm text-slate-200" aria-live="polite">
              <strong className="text-cyan-300">{selected.size}</strong> book{selected.size === 1 ? '' : 's'} selected for QR labels
              <span className="text-slate-500"> · up to {MAX_LABELS}</span>
              {selecting && <span className="block text-xs text-slate-400">Click books to add or remove them. Your choice is kept when you change page or search.</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {selecting && (
                <button
                  type="button"
                  className="btn-secondary min-h-[40px] px-3 text-xs"
                  onClick={() => setSelected((prev) => {
                    const next = new Map(prev);
                    books.forEach((b) => { if (next.size < MAX_LABELS) next.set(b._id, b.title); });
                    return next;
                  })}
                >
                  Select this page
                </button>
              )}
              <button type="button" className="btn-ghost min-h-[40px] px-3 text-xs" onClick={() => setSelected(new Map())} disabled={selected.size === 0}>
                Clear
              </button>
              <button
                type="button"
                className="btn-primary min-h-[40px] px-4 text-xs"
                disabled={selected.size === 0}
                onClick={() => navigate(`${labelsPath}?ids=${[...selected.keys()].join(',')}`)}
              >
                Print labels{selected.size ? ` (${selected.size})` : ''}
              </button>
            </div>
          </div>
        )}

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
                aria-label="Search books by title or author"
                className="w-full input-amo input-search"
              />
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={genre}
                onChange={(e) => updateParams({ genre: e.target.value, page: 1 })}
                aria-label="Filter by category"
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
                onClick={() => openBook(book)}
                className={`card relative cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-glow hover:border-indigo-500/30 ${selected.has(book._id) ? '!border-cyan-400/60 ring-1 ring-cyan-400/40' : ''}`}
              >
                {selecting && <SelectBox book={book} checked={selected.has(book._id)} onToggle={toggleSelected} />}
                <div className={`flex items-start gap-4 ${selecting ? 'pr-10' : ''}`}>
                  <div className="h-28 w-20 overflow-hidden rounded-2xl bg-input flex-shrink-0">
                    <CoverImage book={book} alt={book.title} />
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
                    <span className="text-xs text-slate-500">Availability</span>
                    <span className={`text-sm font-bold ${(book.availableCopies ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-300'}`}>
                      {copiesLabel(book)}
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
                  {book.rating > 0 && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">Rating</span>
                      <span className="text-sm font-bold text-amber-400">⭐ {book.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className={`mt-4 flex items-center gap-2 ${selecting ? 'hidden' : ''}`}>
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
                onClick={() => openBook(book)}
                className={`card relative cursor-pointer transition-all duration-250 hover:shadow-glow hover:border-indigo-500/30 flex items-center gap-4 ${selecting ? 'pr-16' : ''} ${selected.has(book._id) ? '!border-cyan-400/60 ring-1 ring-cyan-400/40' : ''}`}
              >
                {selecting && <SelectBox book={book} checked={selected.has(book._id)} onToggle={toggleSelected} />}
                <div className="h-20 w-14 overflow-hidden rounded-xl bg-input flex-shrink-0">
                  <CoverImage book={book} alt={book.title} />
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
                    <span className={`text-[11px] font-semibold ${(book.availableCopies ?? 0) > 0 ? 'text-emerald-400' : 'text-rose-300'}`}>
                      {copiesLabel(book)}
                    </span>
                  </div>
                </div>
                <div className={`flex gap-2 flex-shrink-0 ${selecting ? 'hidden' : ''}`}>
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

        {!loading && <Pagination currentPage={page} totalPages={pages} onPageChange={(next) => updateParams({ page: next })} />}
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