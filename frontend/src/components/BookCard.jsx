import React from 'react';
import { CoverImage } from './CoverImage';
import { Button } from './UI';
import { genreAccentStyle } from '../constants/genres';

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/**
 * Catalogue card: cover on top, then title, author, a genre + availability row and one action.
 * - showAvailability: availability text next to the genre (from availableCopies)
 * - onWishlistClick: renders a heart toggle over the cover
 * - actionVariant: Button variant for the main action
 */
export const BookCard = ({
  book,
  onCardClick,
  onActionClick,
  onWishlistClick,
  actionLabel = 'Request Book',
  actionVariant = 'primary',
  isLoading = false,
  actionDisabled = false,
  isWishlisted = false,
  wishlistBusy = false,
  showAvailability = true,
  footer,
}) => {
  const safeRating = Number(book?.rating) || 0;
  const available = Number(book?.availableCopies) || 0;
  const title = book?.title || 'Untitled';

  const handleKeyDown = (e) => {
    if (!onCardClick || e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCardClick();
    }
  };

  return (
    <div
      onClick={onCardClick}
      onKeyDown={handleKeyDown}
      role={onCardClick ? 'link' : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      aria-label={onCardClick ? `${title} details` : undefined}
      style={genreAccentStyle(book?.genre)}
      className={`book-card ${onCardClick ? 'cursor-pointer' : ''}`}
    >
      <div className="book-card__frame">
        {/* Whole cover (contain) over a blurred copy of itself, so nothing is cropped */}
        <CoverImage
          book={book}
          src={book?.imageUrl || book?.coverImage}
          alt={`Cover of ${title}`}
          className="book-card__cover"
          size="M"
          backdrop
        />
        <div className="book-card__scrim" />

        {onWishlistClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onWishlistClick(book);
            }}
            disabled={wishlistBusy}
            aria-pressed={isWishlisted}
            aria-label={isWishlisted ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
            className="glass-icon-btn absolute right-2 top-2"
          >
            <HeartIcon filled={isWishlisted} />
          </button>
        )}

        {/* Rating 0 means no ratings yet: hide the chip on the card */}
        {safeRating > 0 && (
          <span className="glass-pill glass-pill--rating absolute bottom-2.5 left-2.5">
            <span aria-hidden="true">★</span>
            <span className="sr-only">Rating</span>
            {safeRating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="book-card__title text-sm font-semibold leading-snug text-slate-100 line-clamp-2">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{book?.author || 'Author unknown'}</p>
        {(book?.genre || showAvailability) && (
          <div className="book-card__meta mt-2">
            {book?.genre && <span className="genre-badge">{book.genre}</span>}
            {showAvailability && (
              <span className={`book-card__availability ${available > 0 ? 'book-card__availability--yes' : 'book-card__availability--no'}`}>
                {available > 0 ? `${available} available` : 'Not available'}
              </span>
            )}
          </div>
        )}

        {footer && <div className="mt-3 border-t border-border pt-3">{footer}</div>}

        {onActionClick && (
          <div className="mt-auto pt-3">
            <Button
              size="sm"
              className="!min-h-[40px]"
              variant={actionVariant}
              loading={isLoading}
              disabled={actionDisabled}
              onClick={(e) => {
                e.stopPropagation();
                onActionClick(book?._id || book?.id);
              }}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
