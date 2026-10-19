import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { reservationsAPI } from '../services/api';
import { useAuth } from './useAuth';

export const ACTIVE_RESERVATION_STATUSES = ['waiting', 'ready'];

const bookIdOf = (r) => String((typeof r?.bookId === 'object' ? r.bookId?._id : r?.bookId) || '');

/** "Mon 20 Oct, 3:30 pm" - when a held copy stops being held */
export const formatHoldEnd = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

/** "1 day 4 h left" / "35 min left" / "Expiring" for a ready reservation */
export const holdTimeLeft = (expiresAt, now = Date.now()) => {
  const ms = new Date(expiresAt).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return 'Expiring';
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ${hours % 24} h left`;
  if (hours > 0) return `${hours} h ${minutes % 60} min left`;
  return `${Math.max(1, minutes)} min left`;
};

/** One-line status of an active reservation, as shown on book cards and the details page */
export const reservationNote = (r) =>
  r?.status === 'ready' ? `Ready for you — borrow by ${formatHoldEnd(r.expiresAt)}` : `You're #${r?.position || '?'} in line`;

/**
 * The signed-in student's reservations, with reserve / cancel actions.
 * Non-students get an empty list and no requests are made.
 */
export const useReservations = () => {
  const { isStudent } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(isStudent);
  const [error, setError] = useState(null);
  const [busyBookId, setBusyBookId] = useState(null);

  const refresh = useCallback(async () => {
    if (!isStudent) {
      setLoading(false);
      return;
    }
    try {
      const res = await reservationsAPI.getMine();
      setReservations(Array.isArray(res.data?.reservations) ? res.data.reservations : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your reservations');
    } finally {
      setLoading(false);
    }
  }, [isStudent]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeByBook = useMemo(() => {
    const map = new Map();
    reservations.filter((r) => ACTIVE_RESERVATION_STATUSES.includes(r.status)).forEach((r) => map.set(bookIdOf(r), r));
    return map;
  }, [reservations]);

  const reservationFor = useCallback((bookId) => (bookId ? activeByBook.get(String(bookId)) || null : null), [activeByBook]);

  /** Reserve a book; resolves to the new reservation, or null if the server refused (toast shown) */
  const reserve = useCallback(async (bookId) => {
    setBusyBookId(String(bookId));
    try {
      const res = await reservationsAPI.reserve(bookId);
      toast.success(res.data?.message || 'Reserved');
      await refresh();
      return res.data?.reservation || null;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reserve this book');
      return null;
    } finally {
      setBusyBookId(null);
    }
  }, [refresh]);

  /** Cancel a reservation; resolves to true on success (toast shown either way) */
  const cancel = useCallback(async (reservation) => {
    setBusyBookId(bookIdOf(reservation));
    try {
      await reservationsAPI.cancel(reservation._id);
      toast.info('Reservation cancelled');
      await refresh();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel the reservation');
      return false;
    } finally {
      setBusyBookId(null);
    }
  }, [refresh]);

  return {
    reservations,
    loading,
    error,
    refresh,
    reservationFor,
    reserve,
    cancel,
    isBusy: (bookId) => !!bookId && busyBookId === String(bookId),
    activeCount: activeByBook.size,
  };
};

/**
 * Main action (and optional secondary action) for a book card, for a student:
 * request when a copy is free, reserve when none is, borrow when a held copy is ready,
 * and cancel an existing reservation.
 * @returns {{ label, disabled, variant, onClick, note, noteTone, secondary }}
 */
export const bookActionFor = (book, { isStudent, requesting, hasActive, reservations, onRequest }) => {
  const id = book?._id;
  const available = Number(book?.availableCopies) || 0;
  const reservation = reservations.reservationFor(id);
  const busy = reservations.isBusy(id);

  if (requesting) return { label: 'Requesting...', disabled: true };
  if (hasActive) return { label: 'Already requested', disabled: true };
  if (!isStudent) return { label: available > 0 ? 'Request book' : 'Not available', disabled: true };

  const cancelAction = {
    label: busy ? 'Cancelling...' : 'Cancel reservation',
    disabled: busy,
    onClick: () => reservations.cancel(reservation),
  };
  if (reservation?.status === 'ready') {
    return { label: 'Borrow now', onClick: () => onRequest(id), note: reservationNote(reservation), noteTone: 'ready', secondary: cancelAction };
  }
  if (reservation) {
    return { ...cancelAction, variant: 'secondary', note: reservationNote(reservation), noteTone: 'waiting' };
  }
  if (available > 0) return { label: 'Request book', onClick: () => onRequest(id) };
  return { label: busy ? 'Reserving...' : 'Reserve', disabled: busy, variant: 'secondary', onClick: () => reservations.reserve(id) };
};
