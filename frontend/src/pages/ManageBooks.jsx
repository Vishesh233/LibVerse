import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { booksAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { DeleteBookModal } from '../components/DeleteBookModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { CoverImage } from '../components/CoverImage';
import { PageHeader, Card, EmptyState } from '../components/UI';
import { DASH_ICONS, KpiLink } from '../components/dashboard/DashboardKit';
import { ServerTable, FilterChips, PageFooter, StockMeter } from '../components/staff/ServerTable';
import { GENRES } from '../constants/genres';
import { toCsv, downloadCsv } from '../utils/csv';

const PAGE_SIZE = 25;
const MAX_LABELS = 100; // one label print view (GET /books?ids= returns at most 100)
const VIEW_KEY = 'libverse:books-view';
const pageFrom = (value) => Math.max(1, parseInt(value, 10) || 1);
const STOCK_FILTERS = [
  { value: '', label: 'All' },
  { value: 'available', label: 'On the shelf' },
  { value: 'low', label: 'Low stock' },
  { value: 'unavailable', label: 'Out of stock' },
];
const SORT_KEYS = ['title', 'author', 'genre', 'available', 'total', 'added'];

const readView = () => {
  try { return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'table'; } catch (e) { return 'table'; }
};

const ViewToggle = ({ view, onChange }) => (
  <div role="radiogroup" aria-label="View" className="flex items-center gap-1 rounded-xl border border-border bg-input p-1">
    {[['table', 'Table', 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'], ['grid', 'Covers', 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6Zm0 9.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z']].map(([key, label, d]) => (
      <button
        key={key}
        type="button"
        role="radio"
        aria-checked={view === key}
        aria-label={`${label} view`}
        title={`${label} view`}
        onClick={() => onChange(key)}
        className={`grid h-9 w-9 place-items-center rounded-lg transition-colors ${view === key ? 'border border-indigo-500/30 bg-indigo-500/20 text-indigo-200' : 'text-slate-500 hover:text-slate-200'}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>
      </button>
    ))}
  </div>
);

const IconButton = ({ label, onClick, tone = 'indigo', children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors ${tone === 'rose' ? 'hover:bg-rose-500/10 hover:text-rose-300' : 'hover:bg-indigo-500/10 hover:text-indigo-200'}`}
  >
    {children}
  </button>
);
const EditIcon = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m16.86 4.49 1.69-1.69a1.88 1.88 0 1 1 2.65 2.65L10.58 16.07a4.5 4.5 0 0 1-1.9 1.13L6 18l.8-2.68a4.5 4.5 0 0 1 1.13-1.9l8.93-8.93Zm0 0L19.5 7.13" /></svg>;
const TrashIcon = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.35 9m-4.78 0L9.26 9m9.97-3.21c.34.05.68.1 1.02.16m-1.02-.16L18.16 19.67a2.25 2.25 0 0 1-2.24 2.08H8.08a2.25 2.25 0 0 1-2.24-2.08L4.77 5.79m14.46 0a48.1 48.1 0 0 0-3.48-.4m-12 .56c.34-.06.68-.11 1.02-.16m0 0a48.1 48.1 0 0 1 3.48-.4m7.5 0v-.92c0-1.18-.91-2.16-2.09-2.2a51.96 51.96 0 0 0-3.32 0c-1.18.04-2.09 1.02-2.09 2.2v.92m7.5 0a48.67 48.67 0 0 0-7.5 0" /></svg>;

export const ManageBooks = () => {
  const navigate = useNavigate();
  const { isAdmin, isLibrarian } = useAuth();
  const canAccess = isAdmin || isLibrarian;
  const base = isAdmin ? '/admin' : '/librarian';
  const addPath = `${base}/books/add`;
  const editPath = (id) => `${base}/books/${id}/edit`;
  const detailsPath = (id) => `${base}/books/${id}`;
  const labelsPath = `${base}/books/labels`;

  // Page, search, genre, stock filter and sort live in the URL so reload and back keep the view
  const [searchParams, setSearchParams] = useSearchParams();
  const page = pageFrom(searchParams.get('page'));
  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || '';
  const stockParam = searchParams.get('stock') || '';
  const stock = STOCK_FILTERS.some((f) => f.value === stockParam) ? stockParam : '';
  const sortParam = searchParams.get('sort') || 'title';
  const sortKey = SORT_KEYS.includes(sortParam.replace(/^-/, '')) ? sortParam : 'title';
  const sort = { key: sortKey.replace(/^-/, ''), dir: sortKey.startsWith('-') ? 'desc' : 'asc' };

  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState(q);
  const [view, setView] = useState(readView);
  const debouncedSearch = useDebounce(search, 300);

  // Selected books (kept across pages and filters): id -> book
  const [selected, setSelected] = useState(() => new Map());
  const selectedIds = useMemo(() => new Set(selected.keys()), [selected]);

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkRemove, setBulkRemove] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const updateParams = useCallback((changes) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([key, value]) => {
        const isDefault = value === '' || value === null || value === undefined
          || (key === 'page' && Number(value) <= 1) || (key === 'sort' && value === 'title');
        if (isDefault) next.delete(key);
        else next.set(key, String(value));
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    const value = debouncedSearch.trim();
    if (value !== q) updateParams({ q: value, page: 1 });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (q !== debouncedSearch.trim()) setSearch(q);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSummary = useCallback(() => {
    booksAPI.getStockSummary().then((res) => setSummary(res.data.summary)).catch(() => setSummary(null));
  }, []);
  useEffect(() => { loadSummary(); }, [loadSummary]);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: PAGE_SIZE, sort: sortKey };
      if (q) params.q = q;
      if (genre) params.genre = genre;
      if (stock) params.availability = stock;
      const res = await booksAPI.getBooks(params);
      const serverPages = Math.max(1, res.data.pages || 1);
      if (page > serverPages && (res.data.total || 0) > 0) {
        updateParams({ page: serverPages });
        return;
      }
      setBooks(res.data.books || []);
      setTotal(res.data.total || 0);
      setPages(serverPages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the books. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [page, q, genre, stock, sortKey, updateParams]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const changeView = (next) => {
    setView(next);
    try { localStorage.setItem(VIEW_KEY, next); } catch (e) { /* storage unavailable */ }
  };
  const onSort = (key) => updateParams({ sort: sort.key === key && sort.dir === 'asc' ? `-${key}` : key, page: 1 });

  const toggle = (book) => setSelected((prev) => {
    const next = new Map(prev);
    if (next.has(book._id)) next.delete(book._id);
    else next.set(book._id, book);
    return next;
  });
  const toggleAll = (all) => setSelected((prev) => {
    const next = new Map(prev);
    books.forEach((b) => (all ? next.set(b._id, b) : next.delete(b._id)));
    return next;
  });

  const afterChange = async () => {
    await fetchBooks();
    loadSummary();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await booksAPI.deleteBook(confirmDelete._id);
      toast.success(`“${confirmDelete.title}” removed from the catalogue`);
      setSelected((prev) => { const next = new Map(prev); next.delete(confirmDelete._id); return next; });
      setConfirmDelete(null);
      await afterChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'The book could not be removed');
    } finally {
      setDeleting(false);
    }
  };

  const removeSelected = async () => {
    setBulkBusy(true);
    const ids = [...selected.keys()];
    let removed = 0;
    for (const id of ids) {
      try {
        await booksAPI.deleteBook(id); // one at a time: each removal also cancels that book's waiting list
        removed += 1;
      } catch (e) { /* counted below */ }
    }
    setBulkBusy(false);
    setBulkRemove(false);
    setSelected(new Map());
    if (removed === ids.length) toast.success(`${removed} book${removed === 1 ? '' : 's'} removed from the catalogue`);
    else toast.warning(`${removed} of ${ids.length} books removed. Try the others again.`);
    await afterChange();
  };

  const exportSelected = () => {
    const rows = [...selected.values()];
    const csv = toCsv([
      { label: 'Title', value: (b) => b.title },
      { label: 'Author', value: (b) => b.author },
      { label: 'Genre', value: (b) => b.genre },
      { label: 'ISBN', value: (b) => b.isbn || '' },
      { label: 'Available', value: (b) => b.availableCopies ?? 0 },
      { label: 'On loan', value: (b) => b.issuedCopies ?? 0 },
      { label: 'Held', value: (b) => b.heldCopies ?? 0 },
      { label: 'Total copies', value: (b) => b.totalCopies ?? 0 },
      { label: 'Shelf', value: (b) => b.location || '' },
    ], rows);
    downloadCsv(`libverse-books-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const printLabels = () => {
    if (selected.size > MAX_LABELS) {
      toast.info(`Labels print ${MAX_LABELS} books at a time. Unselect ${selected.size - MAX_LABELS} first.`);
      return;
    }
    navigate(`${labelsPath}?ids=${[...selected.keys()].join(',')}`);
  };

  if (!canAccess) {
    return (
      <MainLayout>
        <EmptyState icon="🔒" title="Staff only" message="This page is for librarians and admins." />
      </MainLayout>
    );
  }

  const filtered = Boolean(q || genre || stock);
  const stockLink = (value) => `${base}/books${value ? `?stock=${value}` : ''}`;
  const columns = [
    {
      key: 'title', label: 'Title', sortKey: 'title', className: 'min-w-[16rem]',
      render: (b) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded-md bg-input">
            <CoverImage book={b} alt="" size="S" />
          </div>
          <div className="min-w-0">
            <Link to={detailsPath(b._id)} className="block font-medium text-slate-100 line-clamp-2 hover:text-indigo-200 hover:underline">{b.title}</Link>
            {b.isbn && <p className="font-mono text-[11px] text-slate-500">{b.isbn}</p>}
          </div>
        </div>
      ),
    },
    { key: 'author', label: 'Author', sortKey: 'author', render: (b) => <span className="line-clamp-2">{b.author}</span> },
    { key: 'genre', label: 'Genre', sortKey: 'genre', render: (b) => <span className="genre-badge whitespace-nowrap">{b.genre}</span> },
    { key: 'available', label: 'Available', sortKey: 'available', render: (b) => <StockMeter available={b.availableCopies ?? 0} total={b.totalCopies ?? 0} /> },
    {
      key: 'out', label: 'On loan · held', align: 'right',
      render: (b) => <span className="tabular-nums text-slate-300">{b.issuedCopies ?? 0} · {b.heldCopies ?? 0}</span>,
    },
    { key: 'shelf', label: 'Shelf', render: (b) => <span className="whitespace-nowrap text-slate-400">{b.location || '—'}</span> },
    {
      key: 'actions', label: <span className="sr-only">Actions</span>, align: 'right',
      render: (b) => (
        <div className="flex justify-end gap-1">
          <IconButton label={`Edit “${b.title}”`} onClick={() => navigate(editPath(b._id))}><EditIcon /></IconButton>
          <IconButton label={`Remove “${b.title}”`} tone="rose" onClick={() => setConfirmDelete(b)}><TrashIcon /></IconButton>
        </div>
      ),
    },
  ];

  const card = (b) => (
    <div className="flex gap-3">
      <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-input"><CoverImage book={b} alt="" size="S" /></div>
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug text-slate-100 line-clamp-2">{b.title}</p>
        <p className="text-xs text-slate-400 line-clamp-1">{b.author}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="genre-badge">{b.genre}</span>
          <StockMeter available={b.availableCopies ?? 0} total={b.totalCopies ?? 0} compact />
          {b.location && <span className="text-[11px] text-slate-500">{b.location}</span>}
        </div>
        <div className="mt-2 flex gap-1">
          <IconButton label={`Edit “${b.title}”`} onClick={() => navigate(editPath(b._id))}><EditIcon /></IconButton>
          <IconButton label={`Remove “${b.title}”`} tone="rose" onClick={() => setConfirmDelete(b)}><TrashIcon /></IconButton>
        </div>
      </div>
    </div>
  );

  const emptyState = (
    <EmptyState
      icon="🔎"
      title={filtered ? 'No books match' : 'No books yet'}
      message={filtered ? 'Try another search, genre or stock filter.' : 'Add the first book to the catalogue.'}
      action={filtered
        ? <button type="button" className="btn-secondary" onClick={() => { setSearch(''); updateParams({ q: '', genre: '', stock: '', page: 1 }); }}>Clear filters</button>
        : <button type="button" className="btn-primary" onClick={() => navigate(addPath)}>Add a book</button>}
    />
  );

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6 pb-24">
        <PageHeader
          className="!mb-0"
          title="Books"
          subtitle={summary
            ? `${summary.titles.toLocaleString('en-IN')} titles · ${summary.copies.toLocaleString('en-IN')} copies in the catalogue`
            : 'The catalogue: stock, shelves and QR labels'}
          actions={(
            <div className="flex flex-wrap gap-2">
              <Link to={`${base}/books/import`} className="btn-secondary whitespace-nowrap">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                Import CSV
              </Link>
              <button type="button" onClick={() => navigate(addPath)} className="btn-primary whitespace-nowrap">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add book
              </button>
            </div>
          )}
        />

        {/* Stock at a glance: each tile filters the list */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <KpiLink to={stockLink('')} label="Titles" value={summary ? summary.titles.toLocaleString('en-IN') : '—'} hint={summary ? `${summary.copies.toLocaleString('en-IN')} copies` : ''} icon={DASH_ICONS.library} tone="indigo" loading={!summary} />
          <KpiLink to={stockLink('available')} label="On the shelf" value={summary ? summary.available.toLocaleString('en-IN') : '—'} hint="copies to lend now" icon={DASH_ICONS.book} tone="emerald" loading={!summary} />
          <KpiLink to={`${base}/issue-return`} label="On loan" value={summary ? summary.issued.toLocaleString('en-IN') : '—'} hint={summary ? `${summary.held} held for reservations` : ''} icon={DASH_ICONS.clock} tone="violet" loading={!summary} />
          <KpiLink to={stockLink('low')} label="Low stock" value={summary ? summary.lowStock.toLocaleString('en-IN') : '—'} hint={summary ? `${summary.outOfStock} out of stock` : ''} icon={DASH_ICONS.alert} tone="amber" alert={Boolean(summary?.outOfStock)} loading={!summary} />
        </div>

        <Card variant="glass" className="!p-4 sm:!p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.2-5.2m0 0A7.5 7.5 0 1 0 5.2 5.2a7.5 7.5 0 0 0 10.6 10.6Z" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or author"
                aria-label="Search books by title or author"
                className="input-amo input-search w-full"
              />
            </div>
            <select
              value={genre}
              onChange={(e) => updateParams({ genre: e.target.value, page: 1 })}
              aria-label="Filter by genre"
              className="input-amo w-full lg:w-56"
            >
              <option value="">All genres</option>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <div className="hidden lg:block"><ViewToggle view={view} onChange={changeView} /></div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <FilterChips
              label="Stock"
              value={stock}
              onChange={(value) => updateParams({ stock: value, page: 1 })}
              options={STOCK_FILTERS.map((f) => ({
                ...f,
                count: f.value === 'low' ? summary?.lowStock : f.value === 'unavailable' ? summary?.outOfStock : undefined,
              }))}
            />
            <p className="hidden text-xs text-slate-400 sm:block" aria-live="polite">
              {loading ? 'Loading…' : `${total.toLocaleString('en-IN')} ${total === 1 ? 'book' : 'books'}${filtered ? ' match' : ''}`}
            </p>
          </div>
        </Card>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
            {error}
            <button type="button" className="btn-secondary min-h-[36px] px-3 text-xs" onClick={fetchBooks}>Retry</button>
          </div>
        )}

        {view === 'table' ? (
          <ServerTable
            caption="Books in the catalogue"
            columns={columns}
            rows={books}
            loading={loading}
            sort={sort}
            onSort={onSort}
            onRowClick={(b) => navigate(detailsPath(b._id))}
            rowLabel={(b) => `${b.title} by ${b.author}, ${b.availableCopies ?? 0} of ${b.totalCopies ?? 0} available`}
            selected={selectedIds}
            onToggle={toggle}
            onToggleAll={toggleAll}
            selectLabel={(b) => `Select “${b.title}”`}
            cardRender={card}
            empty={emptyState}
          />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton aspect-[2/3] w-full !rounded-2xl" />)}
          </div>
        ) : books.length === 0 ? emptyState : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" aria-label="Books in the catalogue">
            {books.map((b) => {
              const isSel = selectedIds.has(b._id);
              return (
                <li key={b._id} className={`card-glass group relative flex flex-col !p-3 transition-colors ${isSel ? '!border-cyan-400/50' : 'hover:!border-indigo-400/30'}`}>
                  <label className="absolute right-4 top-4 z-10 grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-white/10 bg-slate-950/70">
                    <input type="checkbox" className="staff-check" checked={isSel} onChange={() => toggle(b)} aria-label={`Select “${b.title}”`} />
                  </label>
                  <Link to={detailsPath(b._id)} className="block">
                    <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-input"><CoverImage book={b} alt="" size="M" /></div>
                    <p className="mt-2.5 text-sm font-medium leading-snug text-slate-100 line-clamp-2 group-hover:text-indigo-200">{b.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{b.author}</p>
                  </Link>
                  <div className="mt-auto pt-2"><StockMeter available={b.availableCopies ?? 0} total={b.totalCopies ?? 0} /></div>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && (
          <PageFooter page={page} pages={pages} total={total} pageSize={PAGE_SIZE} noun="books" onPage={(next) => { updateParams({ page: next }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        )}
      </div>

      {/* Bulk actions: appears once something is selected */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 sm:px-6 sm:pb-5 lg:pl-[17rem]" role="region" aria-label="Selected books">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 rounded-2xl border border-cyan-400/30 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-200" aria-live="polite">
              <strong className="tabular-nums text-cyan-200">{selected.size}</strong> book{selected.size === 1 ? '' : 's'} selected
              <span className="hidden text-slate-400 sm:inline"> · kept while you change page or filters</span>
              <span className="block text-xs text-slate-400">Select books, then print their QR labels, export them or remove them.</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-primary min-h-[40px] px-4 text-xs" onClick={printLabels}>Print QR labels</button>
              <button type="button" className="btn-secondary min-h-[40px] px-3 text-xs" onClick={exportSelected}>Export CSV</button>
              <button type="button" className="btn-danger min-h-[40px] px-3 text-xs" onClick={() => setBulkRemove(true)}>Remove</button>
              <button type="button" className="btn-ghost min-h-[40px] px-3 text-xs" onClick={() => setSelected(new Map())}>Clear</button>
            </div>
          </div>
        </div>
      )}

      <DeleteBookModal
        isOpen={!!confirmDelete}
        bookTitle={confirmDelete?.title}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
      <ConfirmModal
        isOpen={bulkRemove}
        title={`Remove ${selected.size} book${selected.size === 1 ? '' : 's'} from the catalogue?`}
        description="Students can no longer find or request them, and their waiting lists are cancelled (those students are told). Loans already out stay open until the books come back."
        confirmText={bulkBusy ? 'Removing…' : `Remove ${selected.size}`}
        onConfirm={removeSelected}
        onCancel={() => setBulkRemove(false)}
        loading={bulkBusy}
      />
    </MainLayout>
  );
};
