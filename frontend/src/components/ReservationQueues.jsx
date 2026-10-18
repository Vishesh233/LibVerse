import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { reservationsAPI } from '../services/api';
import { Badge, Button, Card, EmptyState, Skeleton } from './UI';
import { CoverImage } from './CoverImage';
import { ConfirmModal } from './ConfirmModal';
import { Pagination } from './Pagination';
import { formatDate } from '../utils/dateUtils';
import { formatHoldEnd, holdTimeLeft } from '../hooks/useReservations';

const PAGE_SIZE = 10;

/**
 * Staff view of every book with a waiting list: held copies first, then the line in order.
 * Staff can cancel any entry; a cancelled hold goes to the next student automatically.
 * @param {Function} onChanged - called after a cancel so the page can refresh its counts
 */
export const ReservationQueues = ({ onChanged }) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ queues: [], pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null); // { reservation, bookTitle }
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await reservationsAPI.getQueues({ page, limit: PAGE_SIZE });
      setData({ queues: res.data.queues || [], pages: res.data.pages || 1, total: res.data.total || 0 });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await reservationsAPI.cancel(confirm.reservation._id);
      toast.success(confirm.reservation.status === 'ready'
        ? 'Reservation cancelled. The held copy went to the next student in line.'
        : 'Reservation cancelled.');
      setConfirm(null);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel the reservation');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading reservations">
        {[0, 1].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
      </div>
    );
  }
  if (error) {
    return (
      <Card>
        <EmptyState icon="⚠️" title="Couldn't load reservations" message={error} action={<Button fullWidth={false} onClick={load}>Try again</Button>} />
      </Card>
    );
  }
  if (data.queues.length === 0) {
    return (
      <Card>
        <EmptyState icon="🔖" title="No waiting lists" message="When students reserve a book with no free copy, its queue shows up here." />
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {data.queues.map(({ book, waiting, ready, reservations }) => (
          <Card key={book._id} variant="glass" className="!p-4 sm:!p-5">
            <div className="flex flex-wrap items-start gap-4">
              <span className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-input">
                <CoverImage book={book} src={book.imageUrl || book.coverImage} alt="" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold leading-snug text-slate-100 line-clamp-2">{book.title}</h3>
                <p className="mt-0.5 text-sm text-slate-400 line-clamp-1">{book.author}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {book.availableCopies ?? 0} free · {book.heldCopies ?? 0} held · {book.issuedCopies ?? 0} on loan · {book.totalCopies ?? 0} total
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ready > 0 && <Badge variant="success">{ready} held</Badge>}
                <Badge variant="info">{waiting} waiting</Badge>
              </div>
            </div>

            <ol className="mt-4 divide-y divide-border rounded-xl border border-border bg-input/40" aria-label={`Waiting list for ${book.title}`}>
              {reservations.map((r) => (
                <li key={r._id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 sm:px-4">
                  <span className="w-24 flex-shrink-0">
                    {r.status === 'ready'
                      ? <Badge variant="success">Held</Badge>
                      : <Badge variant="neutral">#{r.position}</Badge>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-100">{r.userId?.name || 'Unknown student'}</span>
                    <span className="block truncate text-[11px] text-slate-500">
                      {r.userId?.libraryId ? `${r.userId.libraryId} · ` : ''}reserved {formatDate(r.createdAt)}
                    </span>
                  </span>
                  {r.status === 'ready' && (
                    <span className="text-xs text-emerald-300">
                      Until {formatHoldEnd(r.expiresAt)} · {holdTimeLeft(r.expiresAt)}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    fullWidth={false}
                    onClick={() => setConfirm({ reservation: r, bookTitle: book.title, student: r.userId?.name })}
                    className="!min-h-[36px]"
                  >
                    Cancel
                  </Button>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>

      <Pagination currentPage={page} totalPages={data.pages} onPageChange={setPage} />

      <ConfirmModal
        isOpen={!!confirm}
        title="Cancel reservation?"
        description={confirm
          ? `${confirm.student || 'The student'} will be removed from the waiting list for "${confirm.bookTitle}" and notified.${confirm.reservation.status === 'ready' ? ' The held copy goes to the next student in line.' : ''}`
          : ''}
        confirmText="Cancel reservation"
        cancelText="Keep"
        onConfirm={handleCancel}
        onCancel={() => setConfirm(null)}
        loading={cancelling}
      />
    </>
  );
};
