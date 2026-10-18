import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { booksAPI, transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { BookCard } from '../components/BookCard';
import { Button, Card, EmptyState, PageHeader, Skeleton } from '../components/UI';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { useWishlist } from '../hooks/useWishlist';
import { useActiveBookIds } from '../hooks/useActiveBookIds';
import { bookActionFor, useReservations } from '../hooks/useReservations';
import { GENRES } from '../constants/genres';

const PAGE_SIZE = 12;

const GridSkeleton = ({ count = PAGE_SIZE }) => (
  <div className="book-grid" aria-busy="true" aria-label="Loading books">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card-glass !p-0 overflow-hidden">
        <Skeleton className="aspect-[2/3] w-full !rounded-none" />
        <div className="space-y-2 p-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    ))}
  </div>
);

const FilterField = ({ id, label, children, className = '' }) => (
  <div className={`min-w-0 ${className}`}>
    <label htmlFor={id} className="field-label !mb-1.5 !text-xs !text-slate-400">{label}</label>
    {children}
  </div>
);

export const Books = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [issuingId, setIssuingId] = useState(null);
  const [wishlistBusyId, setWishlistBusyId] = useState(null);
  const [loadError, setLoadError] = useState(null);

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

  // After the first load, keep the current grid visible while refetching (no skeleton flash).
  const hasLoadedRef = useRef(false);

  const debouncedTitle = useDebounce(searchTitle, 300);
  const debouncedAuthor = useDebounce(searchAuthor, 300);

  const { isStudent } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { hasActive, markRequested } = useActiveBookIds();
  const reservations = useReservations();

  const fetchBooks = useCallback(async () => {
    if (!hasLoadedRef.current) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await booksAPI.getBooks({
        title: debouncedTitle,
        author: debouncedAuthor,
        genre,
        rating,
        availability,
        page,
        limit: PAGE_SIZE,
      });

      setBooks(res.data.books || []);
      setTotal(res.data.total ?? (res.data.books || []).length);
      setTotalPages(res.data.pages || 1);
      setLoadError(null);
      hasLoadedRef.current = true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load books';
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedTitle, debouncedAuthor, genre, rating, availability, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Restore filters from URL search params when they change (e.g. back button).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setGenre(params.get('genre') || '');
    setRating(params.get('rating') || '');
    setAvailability(params.get('availability') || '');
    setPage(Math.max(1, Number(params.get('page')) || 1));
    setSearchTitle(params.get('title') || '');
    setSearchAuthor(params.get('author') || '');
  }, [location.search]);

  // Any filter change goes back to page 1
  const updateFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleIssueBook = useCallback(async (bookId) => {
    setIssuingId(bookId);
    try {
      await transactionsAPI.requestIssueBook({ bookId });
      markRequested(bookId);
      toast.success('Request sent. A librarian will review it shortly.');
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setIssuingId(null);
    }
  }, [fetchBooks, markRequested]);

  const handleWishlistToggle = useCallback(async (book) => {
    setWishlistBusyId(book._id);
    try {
      const result = await toggleWishlist(book);
      if (result === 'added') toast.success('Added to your wishlist');
      if (result === 'removed') toast.info('Removed from your wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update your wishlist');
    } finally {
      setWishlistBusyId(null);
    }
  }, [toggleWishlist]);

  const hasFilters = !!(searchTitle || searchAuthor || genre || rating || availability);

  const handleClearFilters = useCallback(() => {
    setSearchTitle('');
    setSearchAuthor('');
    setGenre('');
    setRating('');
    setAvailability('');
    setPage(1);
  }, []);

  // Request / Reserve / Borrow now (held copy) / Cancel reservation
  const actionFor = (book) =>
    bookActionFor(book, {
      isStudent,
      requesting: issuingId === book._id,
      hasActive: hasActive(book._id),
      reservations,
      onRequest: handleIssueBook,
    });

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Browse books"
          subtitle={loading ? 'Loading the catalogue...' : `${total} book${total === 1 ? '' : 's'} ${hasFilters ? 'match your filters' : 'in the collection'}`}
        />

        {/* Filters: wrap on small screens */}
        <Card variant="glass" className="mb-6 !p-4 sm:!p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end">
            <FilterField id="filter-title" label="Title">
              <input
                id="filter-title"
                type="search"
                value={searchTitle}
                onChange={updateFilter(setSearchTitle)}
                placeholder="Search by title"
                className="input-amo w-full"
              />
            </FilterField>
            <FilterField id="filter-author" label="Author">
              <input
                id="filter-author"
                type="search"
                value={searchAuthor}
                onChange={updateFilter(setSearchAuthor)}
                placeholder="Search by author"
                className="input-amo w-full"
              />
            </FilterField>
            <FilterField id="filter-genre" label="Genre">
              <select id="filter-genre" value={genre} onChange={updateFilter(setGenre)} className="input-amo w-full">
                <option value="">All genres</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </FilterField>
            <FilterField id="filter-availability" label="Availability">
              <select id="filter-availability" value={availability} onChange={updateFilter(setAvailability)} className="input-amo w-full">
                <option value="">All</option>
                <option value="available">Available now</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </FilterField>
            <FilterField id="filter-rating" label="Rating">
              <select id="filter-rating" value={rating} onChange={updateFilter(setRating)} className="input-amo w-full">
                <option value="">Any rating</option>
                <option value="4">4★ and up</option>
                <option value="3">3★ and up</option>
                <option value="2">2★ and up</option>
                <option value="1">1★ and up</option>
              </select>
            </FilterField>
            <Button variant="ghost" fullWidth={false} onClick={handleClearFilters} disabled={!hasFilters} className="w-full lg:w-auto">
              Clear
            </Button>
          </div>
        </Card>

        {loading && books.length === 0 ? (
          <GridSkeleton />
        ) : loadError && books.length === 0 ? (
          <EmptyState
            icon="⚠️"
            title="Couldn't load the catalogue"
            message={loadError}
            action={<Button fullWidth={false} onClick={fetchBooks}>Try again</Button>}
          />
        ) : books.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No books found"
            message={hasFilters ? 'No books match these filters. Try a broader search.' : 'The catalogue is empty right now.'}
            action={hasFilters ? <Button fullWidth={false} variant="secondary" onClick={handleClearFilters}>Clear filters</Button> : null}
          />
        ) : (
          <div
            className={`book-grid transition-opacity ${refreshing ? 'opacity-60' : ''}`}
            aria-busy={refreshing || undefined}
          >
            {books.map((book) => {
              const action = actionFor(book);
              return (
                <BookCard
                  key={book._id}
                  book={book}
                  onCardClick={() =>
                    navigate(`/student/books/${book._id}`, {
                      state: { genre, searchTitle, searchAuthor, rating, availability, page },
                    })
                  }
                  onActionClick={() => action.onClick?.()}
                  onWishlistClick={isStudent ? handleWishlistToggle : undefined}
                  isWishlisted={isWishlisted(book._id)}
                  wishlistBusy={wishlistBusyId === book._id}
                  isLoading={issuingId === book._id}
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

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </MainLayout>
  );
};
