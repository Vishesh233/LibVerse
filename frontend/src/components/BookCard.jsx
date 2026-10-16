import React from 'react';
import { CoverImage } from './CoverImage';

export const BookCard = ({
  book,
  onCardClick,
  onActionClick,
  onWishlistClick,
  actionLabel = 'Request Book',
  wishlistLabel = 'Add to Wishlist',
  isLoading = false,
  actionDisabled = false,
  isWishlisted = false,
  footer,
  statusLabel,
}) => {
  const safeRating = Number(book?.rating) || 0;

  return (
    <div
      onClick={onCardClick}
      className="card cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-glow hover:border-indigo-500/30"
    >
      <div className="flex items-start gap-4">
        <div className="h-28 w-20 overflow-hidden rounded-2xl bg-input flex-shrink-0">
          <CoverImage book={book} alt={book?.title || 'Book cover'} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-slate-100 line-clamp-2">{book?.title || 'Untitled'}</h3>
              <p className="mt-1.5 text-sm text-slate-400 line-clamp-1">{book?.author || 'Author Unknown'}</p>
            </div>
            {safeRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex-shrink-0">
                ⭐ {safeRating.toFixed(1)}
              </span>
            )}
          </div>
          {book?.genre && (
            <span className="mt-2.5 inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">{book.genre}</span>
          )}
        </div>
      </div>

      {footer && (
        <div className="mt-4 pt-4 border-t border-border">
          {footer}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        {onActionClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onActionClick(book?._id || book?.id);
          }}
          disabled={actionDisabled || isLoading}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : actionLabel}
        </button>
        )}

        {onWishlistClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWishlistClick(book);
            }}
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              isWishlisted
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                : 'border-border bg-transparent text-slate-300 hover:border-indigo-500/30 hover:text-indigo-300'
            }`}
          >
            {isWishlisted ? 'Wishlisted' : wishlistLabel}
          </button>
        )}
      </div>
    </div>
  );
};