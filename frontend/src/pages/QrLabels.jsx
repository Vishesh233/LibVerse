import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { booksAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { Button, EmptyState, PageHeader, Skeleton } from '../components/UI';
import { QrCode } from '../components/QrCode';
import { useAuth } from '../hooks/useAuth';
import { bookCode } from '../utils/qrConfig';

export const LABELS_PER_SHEET = 21; // 3 x 7 on A4
export const MAX_LABELS = 100; // one page of GET /books?ids=
const A4_WIDTH_PX = (210 / 25.4) * 96;

const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n));

/** Fit the A4 preview to the screen (print always uses the real size) */
const usePreviewZoom = () => {
  const ref = useRef(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / A4_WIDTH_PX)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, zoom];
};

/**
 * Printable QR label sheets for the books chosen in Manage Books (?ids=a,b,c).
 * Each label: the desk QR ("LV1:B:<bookId>"), title, author and shelf location.
 */
export const QrLabels = () => {
  const { isAdmin, isLibrarian } = useAuth();
  const base = isAdmin ? '/admin' : '/librarian';
  const [params] = useSearchParams();
  const ids = useMemo(
    () => [...new Set((params.get('ids') || '').split(',').map((s) => s.trim()).filter((s) => /^[a-f0-9]{24}$/i.test(s)))].slice(0, MAX_LABELS),
    [params]
  );
  const [state, setState] = useState({ loading: true, books: [], error: null });
  const [wrapRef, zoom] = usePreviewZoom();

  useEffect(() => {
    if (ids.length === 0) {
      setState({ loading: false, books: [], error: null });
      return undefined;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    booksAPI.getBooks({ ids: ids.join(','), limit: MAX_LABELS }, { signal: controller.signal })
      .then((res) => {
        // Keep the order the books were picked in
        const byId = new Map((res.data.books || []).map((b) => [String(b._id), b]));
        setState({ loading: false, books: ids.map((id) => byId.get(id)).filter(Boolean), error: null });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({ loading: false, books: [], error: err.response?.data?.message || 'The books could not be loaded. Please try again.' });
      });
    return () => controller.abort();
  }, [ids]);

  if (!(isAdmin || isLibrarian)) {
    return (
      <MainLayout>
        <EmptyState icon="🔒" title="Staff only" message="QR labels are for librarians and admins." />
      </MainLayout>
    );
  }

  const sheets = chunk(state.books, LABELS_PER_SHEET);
  const missing = ids.length - state.books.length;

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl space-y-5 pb-10 print:max-w-none print:space-y-0 print:pb-0">
        <div className="print:hidden">
          <PageHeader
            title="QR labels"
            subtitle="Stick a label inside each book. The scan desk reads it to issue and return the book."
            className="!mb-0"
            actions={(
              <div className="flex flex-wrap gap-2">
                <Link to={`${base}/books`} className="btn-secondary min-h-[44px] px-4 text-sm">Back to books</Link>
                <Button fullWidth={false} onClick={() => window.print()} disabled={state.loading || state.books.length === 0}>Print labels</Button>
              </div>
            )}
          />
          {!state.loading && state.books.length > 0 && (
            <p className="mt-3 text-sm text-slate-400" aria-live="polite">
              {state.books.length} label{state.books.length === 1 ? '' : 's'} on {sheets.length} A4 sheet{sheets.length === 1 ? '' : 's'} (3 × 7 labels, 60 × 37.5 mm).
              {missing > 0 ? ` ${missing} selected book${missing === 1 ? ' was' : 's were'} not found and left out.` : ''}
              {' '}Print at 100% scale (no “fit to page”).
            </p>
          )}
        </div>

        {state.loading ? (
          <Skeleton className="mx-auto h-[60vh] w-full max-w-[794px] !rounded-xl" />
        ) : state.error ? (
          <EmptyState icon="⚠️" title="Labels unavailable" message={state.error} />
        ) : state.books.length === 0 ? (
          <EmptyState
            icon="🏷️"
            title="No books selected"
            message="Choose books on the Books page with “Select for labels”, then open the print view."
            action={<Link to={`${base}/books`} className="btn-primary min-h-[44px] px-4 text-sm">Choose books</Link>}
          />
        ) : (
          <div ref={wrapRef} className="w-full">
            <div className="label-preview" style={{ zoom }}>
              {sheets.map((sheet, i) => (
                <section key={i} className="label-page" aria-label={`Label sheet ${i + 1} of ${sheets.length}`}>
                  <div className="label-sheet">
                    {sheet.map((book) => (
                      <article key={book._id} className="qr-label">
                        <span className="qr-label__qr">
                          <QrCode value={bookCode(book._id)} title={`QR code for ${book.title}`} />
                        </span>
                        <span className="qr-label__text">
                          <span className="qr-label__title">{book.title}</span>
                          <span className="qr-label__author">{book.author}</span>
                          <span className="qr-label__shelf">{book.location ? `Shelf ${book.location}` : 'Shelf —'}</span>
                          <span className="qr-label__brand">LibVerse library</span>
                        </span>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default QrLabels;
