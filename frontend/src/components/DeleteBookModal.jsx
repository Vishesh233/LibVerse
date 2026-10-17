import React from 'react';

export const DeleteBookModal = ({
  isOpen,
  bookTitle,
  onCancel,
  onConfirm,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div className="modal-amo w-full max-w-md animate-scale-in relative overflow-hidden">
        {/* Subtle gradient glow decoration (clipped layer, so it never adds scroll height to the modal) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <svg className="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-100">Delete Book</h2>
              <p className="mt-1.5 text-sm text-slate-400">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-slate-200">"{bookTitle}"</span>?
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
            <p className="text-xs text-rose-300/90 flex items-center gap-2">
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              This action cannot be undone.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-border bg-slate-800/80 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700 hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(239,68,68,0.25)] transition-all hover:from-rose-600 hover:to-red-700 hover:shadow-[0_10px_35px_rgba(239,68,68,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Book
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};