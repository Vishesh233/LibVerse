import React, { useEffect, useId, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { transactionsAPI } from '../services/api';
import { formatRupees } from './dashboard/DashboardKit';

const MIN_REASON = 10;
const MAX_REASON = 500;

/**
 * Waive all or part of a loan's unpaid fine (staff).
 * @param {object} props
 * @param {{ id: string, book: string, student?: string, fine: number, waived?: number, payable: number }} props.loan
 * @param {() => void} props.onClose
 * @param {(transaction: object) => void} [props.onWaived] - after a successful waiver
 */
export const WaiveFineModal = ({ loan, onClose, onWaived }) => {
  const titleId = useId();
  const amountId = useId();
  const reasonId = useId();
  const errorId = useId();
  const dialogRef = useRef(null);
  const amountRef = useRef(null);
  const openerRef = useRef(typeof document !== 'undefined' ? document.activeElement : null);

  const [amount, setAmount] = useState(String(loan.payable));
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    amountRef.current?.focus();
    amountRef.current?.select();
    const opener = openerRef.current;
    return () => opener?.focus?.();
  }, []);

  // Escape closes; Tab stays inside the dialog
  const onKeyDown = (e) => {
    if (e.key === 'Escape' && !saving) {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll('button:not([disabled]), input, textarea');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const value = Math.round(Number(amount) * 100) / 100;
    if (!Number.isFinite(value) || value <= 0) return setError('Enter an amount greater than ₹0.');
    if (value > loan.payable) return setError(`You can waive at most ${formatRupees(loan.payable)}.`);
    if (reason.trim().length < MIN_REASON) return setError(`Give a reason of at least ${MIN_REASON} characters.`);

    setSaving(true);
    setError('');
    try {
      const res = await transactionsAPI.waiveFine(loan.id, { amount: value, reason: reason.trim() });
      toast.success(res.data?.message || 'Fine waived');
      onWaived?.(res.data?.transaction);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not waive this fine. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const reasonLength = reason.trim().length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 modal-overlay" onClick={() => !saving && onClose()} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="modal-amo relative w-full max-w-md animate-scale-in"
      >
        <h2 id={titleId} className="font-display text-lg font-semibold text-slate-100">Waive fine</h2>
        <p className="mt-1 text-sm text-slate-400">
          “{loan.book}”{loan.student ? ` · ${loan.student}` : ''}
        </p>

        <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-border bg-white/[0.03] p-2">
            <dt className="text-[11px] uppercase tracking-wider text-slate-500">Fine</dt>
            <dd className="font-semibold text-slate-100">{formatRupees(loan.fine)}</dd>
          </div>
          <div className="rounded-xl border border-border bg-white/[0.03] p-2">
            <dt className="text-[11px] uppercase tracking-wider text-slate-500">Waived</dt>
            <dd className="font-semibold text-pink-300">{formatRupees(loan.waived || 0)}</dd>
          </div>
          <div className="rounded-xl border border-border bg-white/[0.03] p-2">
            <dt className="text-[11px] uppercase tracking-wider text-slate-500">Payable</dt>
            <dd className="font-semibold text-rose-300">{formatRupees(loan.payable)}</dd>
          </div>
        </dl>

        <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor={amountId} className="text-sm font-medium text-slate-200">Amount to waive (₹)</label>
              <button type="button" onClick={() => { setAmount(String(loan.payable)); setError(''); }} className="text-xs font-semibold text-indigo-300 hover:text-white">
                Full {formatRupees(loan.payable)}
              </button>
            </div>
            <input
              ref={amountRef}
              id={amountId}
              type="number"
              inputMode="decimal"
              min="1"
              max={loan.payable}
              step="1"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              className="input-amo mt-1.5 w-full"
              aria-describedby={error ? errorId : undefined}
              required
            />
          </div>

          <div>
            <label htmlFor={reasonId} className="text-sm font-medium text-slate-200">Reason</label>
            <textarea
              id={reasonId}
              rows={3}
              maxLength={MAX_REASON}
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(''); }}
              placeholder="For example: book returned late because the library was closed"
              className="input-amo mt-1.5 w-full resize-y"
              aria-describedby={`${reasonId}-hint${error ? ` ${errorId}` : ''}`}
              required
            />
            <p id={`${reasonId}-hint`} className={`mt-1 text-xs ${reasonLength && reasonLength < MIN_REASON ? 'text-amber-300' : 'text-slate-500'}`}>
              At least {MIN_REASON} characters · {reasonLength}/{MAX_REASON}. The student is told the amount, not the reason.
            </p>
          </div>

          {error && <p id={errorId} className="text-sm text-rose-400" role="alert">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={saving} className="btn-secondary min-h-[40px] px-4 text-sm">Cancel</button>
            <button type="submit" disabled={saving} aria-busy={saving || undefined} className="btn-primary min-h-[40px] px-4 text-sm">
              {saving ? 'Waiving...' : 'Waive fine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/** Props for WaiveFineModal from a transaction-shaped object (list rows, dashboard items, report rows) */
export const waiverLoanFrom = (t) => ({
  id: t._id,
  book: t.bookId?.title || t.bookTitle || t.book || 'Book',
  student: t.userId?.name || t.studentName || t.student || '',
  fine: Number(t.fineAmount ?? t.fine) || 0,
  waived: Number(t.fineWaived ?? t.waived) || 0,
  payable: Number(t.payableFine ?? t.payable) || 0,
});
