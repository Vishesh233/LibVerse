import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [issuingId, setIssuingId] = useState(null);
  const [wishlistBusyId, setWishlistBusyId] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // The URL is the single source of truth for the filters, so they survive refresh,
  // back/forward and deep links, and one filter change is one render and one request.
  const [searchParams, setSearchParams] = useSearchParams();
  const genre = searchParams.get('genre') || '';
  const rating = searchParams.get('rating') || '';
  const availability = searchParams.get('availability') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const urlTitle = searchParams.get('title') || '';
  const urlAuthor = searchParams.get('author') || '';

  // Text boxes update instantly; their debounced value is what goes into the URL
  const [searchTitle, setSearchTitle] = useState(urlTitle);
  const [searchAuthor, setSearchAuthor] = useState(urlAuthor);
  const debouncedTitle = useDebounce(searchTitle, 300);
  const debouncedAuthor = useDebounce(searchAuthor, 300);

  /** Set (or clear, with '') URL filters; any filter change except paging goes back to page 1 */
  const updateParams = useCallback((changes) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([key, value]) => {
        if (value) next.set(key, String(value));
        else next.delete(key);
      });
      if (!('page' in changes)) next.delete('page');
      if (next.get('page') === '1') next.delete('page');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Debounced search text -> URL (only when it differs, so this can't loop)
  const writtenTextRef = useRef({ title: urlTitle, author: urlAuthor });
  useEffect(() => {
    const title = debouncedTitle.trim();
    const author = debouncedAuthor.trim();
    if (title !== urlTitle || author !== urlAuthor) {
      writtenTextRef.current = { title, author };
      updateParams({ title, author });
    }
  }, [debouncedTitle, debouncedAuthor]); // eslint-disable-line react-hooks/exhaustive-deps

  // URL -> text boxes, only for changes made elsewhere (back/forward, Clear filters),
  // never for the value this page just wrote, so typing is never overwritten
  useEffect(() => {
    const written = writtenTextRef.current;
    if (urlTitle === written.title && urlAuthor === written.author) return;
    writtenTextRef.current = { title: urlTitle, author: urlAuthor };
    setSearchTitle(urlTitle);
    setSearchAuthor(urlAuthor);
  }, [urlTitle, urlAuthor]);

  const { isStudent } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { hasActive, markRequested } = useActiveBookIds();
  const reservations = useReservations();

  // One request per distinct query; a newer query cancels the older one, so a slow
  // response can never overwrite newer results. No automatic retries.
  const queryKey = JSON.stringify({ title: urlTitle, author: urlAuthor, genre, rating, availability, page });
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    booksAPI
      .getBooks({ ...JSON.parse(queryKey), limit: PAGE_SIZE }, { signal: controller.signal })
      .then((res) => {
        const list = res.data.books || [];
        setBooks(list);
        setTotal(res.data.total ?? list.length);
        setTotalPages(res.data.pages || 1);
        setLoadError(null);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setBooks([]);
        setTotal(0);
        setTotalPages(1);
        setLoadError(err.response?.data?.message || 'We couldn’t reach the library right now.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [queryKey, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const handleIssueBook = useCallback(async (bookId) => {
    setIssuingId(bookId);
    try {
      await transactionsAPI.requestIssueBook({ bookId });
      markRequested(bookId);
      toast.success('Request sent. A librarian will review it shortly.');
      reload();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setIssuingId(null);
    }
  }, [reload, markRequested]);

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

  const hasOtherFilters = !!(urlTitle || urlAuthor || genre || rating);
  const hasFilters = hasOtherFilters || !!availability;

  const handleClearFilters = useCallback(() => {
    setSearchTitle('');
    setSearchAuthor('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const selectFilter = (key) => (e) => updateParams({ [key]: e.target.value });

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
          subtitle={loadError ? 'Find your next read'
            : loading && books.length === 0 ? 'Loading the catalogue...'
            : `${total} book${total === 1 ? '' : 's'} ${hasFilters ? 'match your filters' : 'in the collection'}`}
        />

        {/* Filters: wrap on small screens */}
        <Card variant="glass" className="mb-6 !p-4 sm:!p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end">
            <FilterField id="filter-title" label="Title">
              <input
                id="filter-title"
                type="search"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Search by title"
                className="input-amo w-full"
              />
            </FilterField>
            <FilterField id="filter-author" label="Author">
              <input
                id="filter-author"
                type="search"
                value={searchAuthor}
                onChange={(e) => setSearchAuthor(e.target.value)}
                placeholder="Search by author"
                className="input-amo w-full"
              />
            </FilterField>
            <FilterField id="filter-genre" label="Genre">
              <select id="filter-genre" value={genre} onChange={selectFilter('genre')} className="input-amo w-full">
                <option value="">All genres</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </FilterField>
            <FilterField id="filter-availability" label="Availability">
              <select id="filter-availability" value={availability} onChange={selectFilter('availability')} className="input-amo w-full">
                <option value="">All</option>
                <option value="available">Available now</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </FilterField>
            <FilterField id="filter-rating" label="Rating">
              <select id="filter-rating" value={rating} onChange={selectFilter('rating')} className="input-amo w-full">
                <option value="">Any rating</option>
                <option value="4">4★ and up</option>
                <option value="3">3★ and up</option>
                <option value="2">2★ and up</option>
                <option value="1">1★ and up</option>
              </select>
            </FilterField>
            <Button variant="ghost" fullWidth={false} onClick={handleClearFilters} disabled={!hasFilters && !searchTitle && !searchAuthor} className="w-full lg:w-auto">
              Clear
            </Button>
          </div>
        </Card>

        {/* While a new query loads, the current grid stays (dimmed); the skeleton only
            shows when there is no grid to keep, so nothing flashes between states */}
        {loading && books.length === 0 ? (
          <GridSkeleton />
        ) : loadError ? (
          <EmptyState
            icon="⚠️"
            title="Couldn't load the catalogue"
            message={loadError}
            action={<Button fullWidth={false} onClick={reload}>Try again</Button>}
          />
        ) : books.length === 0 ? (
          availability === 'unavailable' ? (
            <EmptyState
              icon="✅"
              title="Every title has a free copy right now"
              message={hasOtherFilters
                ? 'Nothing matching these filters is fully borrowed, so you can request any of them.'
                : 'No book is fully borrowed or on hold, so you can request any title straight away.'}
              action={<Button fullWidth={false} variant="secondary" onClick={() => updateParams({ availability: '' })}>Show all books</Button>}
            />
          ) : (
            <EmptyState
              icon="🔍"
              title={availability === 'available' ? 'No free copies match these filters' : 'No books found'}
              message={hasFilters
                ? availability === 'available'
                  ? 'Try a broader search, or switch Availability to Unavailable to join a waiting list.'
                  : 'No books match these filters. Try a broader search.'
                : 'The catalogue is empty right now.'}
              action={hasFilters ? <Button fullWidth={false} variant="secondary" onClick={handleClearFilters}>Clear filters</Button> : null}
            />
          )
        ) : (
          <div
            className={`book-grid transition-opacity duration-200 ${loading ? 'opacity-60' : ''}`}
            aria-busy={loading || undefined}
          >
            {books.map((book) => {
              const action = actionFor(book);
              return (
                <BookCard
                  key={book._id}
                  book={book}
                  onCardClick={() =>
                    navigate(`/student/books/${book._id}`, {
                      // Lets the details page go back to this list with the same filters
                      state: { fromBooksList: true, booksSearch: searchParams.toString() },
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

        {!loadError && books.length > 0 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => updateParams({ page: p })} />
        )}
      </div>
    </MainLayout>
  );
};
