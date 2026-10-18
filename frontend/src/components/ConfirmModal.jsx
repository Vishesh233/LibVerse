import React, { useEffect, useId } from 'react';

export const ConfirmModal = ({ isOpen, title, description, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', loading = false }) => {
  const titleId = useId();
  const descId = useId();

  // Escape cancels (unless the action is running)
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-6">
      <div className="modal-amo w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}>
        <h2 id={titleId} className="text-xl font-semibold text-slate-100 mb-2">{title}</h2>
        <p id={descId} className="text-slate-300 mb-6">{description}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg btn-danger"
            disabled={loading}
            autoFocus
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
