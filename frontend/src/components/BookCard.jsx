import React, { useState } from 'react';

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
  const [imageError, setImageError] = useState(false);

  const placeholder = 'https://via.placeholder.com/400x300?text=No+Cover';
  const imageUrl = imageError || !book.coverImage ? placeholder : book.coverImage;

  return (
    <div
      onClick={onCardClick}
      className="card cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:shadow-glow hover:border-indigo-500/30"
    >
      <div className="flex items-start gap-4">
        <div className="h-28 w-20 overflow-hidden rounded-2xl bg-input flex-shrink-0">
          <img
            src={imageUrl}
            alt={book.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-100 line-clamp-2">{book.title}</h3>
          <p className="mt-1.5 text-sm text-slate-400 line-clamp-1">{book.author}</p>
          {book.genre && (
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onActionClick?.(book._id || book.id);
          }}
          disabled={actionDisabled || isLoading}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : actionLabel}
        </button>

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