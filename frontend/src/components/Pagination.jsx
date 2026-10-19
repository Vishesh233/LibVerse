import React from 'react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-3" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="btn-secondary"
      >
        <span aria-hidden="true">←</span> Previous
      </button>

      <p className="min-w-[7rem] text-center text-sm text-slate-400" aria-live="polite">
        Page <span className="font-semibold text-slate-100">{currentPage}</span> of{' '}
        <span className="font-semibold text-slate-100">{totalPages}</span>
      </p>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="btn-secondary"
      >
        Next <span aria-hidden="true">→</span>
      </button>
    </nav>
  );
};
