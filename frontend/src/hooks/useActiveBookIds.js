import { useCallback, useEffect, useState } from 'react';
import { transactionsAPI } from '../services/api';
import { useAuth } from './useAuth';

// Statuses where the student already holds or has asked for the book; the server
// refuses a second issue request for the same book while one of these is open.
export const ACTIVE_LOAN_STATUSES = ['pending', 'issued', 'return_requested', 'payment_pending'];

const bookIdOf = (transaction) =>
  typeof transaction?.bookId === 'object' ? transaction.bookId?._id : transaction?.bookId;

/**
 * Book ids the signed-in student already has an open request or loan for.
 * Lets pages disable "Request" up front instead of waiting for the server to refuse.
 */
export const useActiveBookIds = () => {
  const { isStudent } = useAuth();
  const [activeIds, setActiveIds] = useState(() => new Set());

  const refresh = useCallback(async () => {
    if (!isStudent) return;
    try {
      const res = await transactionsAPI.getUserTransactions();
      const list = Array.isArray(res.data?.transactions) ? res.data.transactions : [];
      setActiveIds(new Set(
        list
          .filter((t) => ACTIVE_LOAN_STATUSES.includes(t?.status))
          .map(bookIdOf)
          .filter(Boolean)
          .map(String)
      ));
    } catch {
      // Non-critical: the server still refuses duplicate requests
    }
  }, [isStudent]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRequested = useCallback((bookId) => {
    if (!bookId) return;
    setActiveIds((prev) => new Set(prev).add(String(bookId)));
  }, []);

  const hasActive = useCallback((bookId) => !!bookId && activeIds.has(String(bookId)), [activeIds]);

  return { hasActive, markRequested, refresh };
};
