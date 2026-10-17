import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../layouts/MainLayout';
import { booksAPI, transactionsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import { useActiveBookIds } from '../hooks/useActiveBookIds';
import { DeleteBookModal } from '../components/DeleteBookModal';
import { CoverImage } from '../components/CoverImage';
import { Badge, Button, Card, EmptyState, Skeleton } from '../components/UI';
import { formatDate } from '../utils/dateUtils';

const COMMENT_MAX = 500;

const Stars = ({ value, size = 'h-4 w-4' }) => (
  <span className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg key={n} viewBox="0 0 20 20" className={`${size} ${n <= Math.round(value) ? '' : 'text-slate-600'}`} fill="currentColor" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </span>
);

const Meta = ({ label, children }) => (
  <div className="min-w-0">
    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</dt>
    <dd className="mt-1 break-words font-medium text-slate-100">{children}</dd>
  </div>
);

const DetailsSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading book">
    <Skeleton className="h-5 w-32" />
    <div className="card-glass grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
      <Skeleton className="mx-auto aspect-[2/3] w-full max-w-[300px]" />
      <div className="space-y-4">
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4" lines={5} />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

export const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isLibrarian, isStudent } = useAuth();
  const canManage = isAdmin || isLibrarian;
  const backPath = isAdmin ? '/admin/books' : isLibrarian ? '/librarian/books' : '/student/books';
  const editPath = isAdmin ? `/admin/books/${id}/edit` : `/librarian/books/${id}/edit`;
  const previousState = location.state;

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { toggleWishlist, isWishlisted } = useWishlist();
  const { hasActive, markRequested } = useActiveBookIds();

  const fetchBook = async () => {
    try {
      const res = await booksAPI.getBookById(id);
      setBook(res.data.book || res.data);
      setReviews(Array.isArray(res.data.reviews) ? res.data.reviews : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchBook();
  }, [id]);

  const goBack = () => navigate(backPath, previousState ? { state: previousState } : undefined);

  const handleIssue = async () => {
    setIssuing(true);
    try {
      await transactionsAPI.requestIssueBook({ bookId: id });
      markRequested(id);
      toast.success('Request sent. A librarian will review it shortly.');
      fetchBook();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request this book');
    } finally {
      setIssuing(false);
    }
  };

  const handleWishlist = async () => {
    setWishlistBusy(true);
    try {
      const result = await toggleWishlist(book);
      if (result === 'added') toast.success('Added to your wishlist');
      if (result === 'removed') toast.info('Removed from your wishlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update your wishlist');
    } finally {
      setWishlistBusy(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await booksAPI.deleteBook(id);
      toast.success('Book deleted successfully!');
      navigate(backPath);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError('Choose a rating from 1 to 5 stars');
      return;
    }
    setReviewError('');
    setSubmittingReview(true);
    try {
      await booksAPI.addReview(id, { rating: reviewRating, comment: reviewComment.trim() });
      toast.success('Thanks! Your review was posted.');
      setReviewRating(0);
      setReviewComment('');
      fetchBook();
    } catch (err) {
      const message = err.response?.data?.message || 'Could not post your review';
      setReviewError(message);
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-6xl"><DetailsSkeleton /></div>
      </MainLayout>
    );
  }

  if (error || !book) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-3xl">
          <EmptyState
            icon="📕"
            title="Book not available"
            message={error || 'This book could not be found.'}
            action={<Button fullWidth={false} variant="secondary" onClick={goBack}>Back to books</Button>}
          />
        </div>
      </MainLayout>
    );
  }

  const available = Number(book.copiesAvailable ?? book.availableCopies ?? 0) || 0;
  const rating = Number(book.rating) || 0;
  const userId = String(user?._id || user?.id || '');
  const myReview = reviews.find((r) => String(r.userId?._id || r.userId || '') === userId);
  const alreadyRequested = hasActive(id);
  const wishlisted = isWishlisted(book._id);

  let requestLabel = 'Request this book';
  if (issuing) requestLabel = 'Requesting...';
  else if (alreadyRequested) requestLabel = 'Already requested';
  else if (available <= 0) requestLabel = 'Not available right now';

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-medium text-slate-400 transition-colors hover:text-slate-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to {canManage ? 'book collection' : 'books'}
        </button>

        <Card variant="glass">
          <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="mx-auto w-full max-w-[260px] sm:max-w-[300px]">
              {/* Large cover: full image (contain) over a blurred copy of itself */}
              <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-input shadow-2xl">
                <CoverImage book={book} src={book.imageUrl || book.coverImage} alt={`Cover of ${book.title}`} eager size="L" backdrop />
              </div>
            </div>

            <div className="min-w-0 space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={available > 0 ? 'success' : 'danger'} size="md">
                      {available > 0 ? `${available} of ${book.totalCopies ?? available} available` : 'Unavailable'}
                    </Badge>
                    {book.genre && <Badge variant="primary" size="md">{book.genre}</Badge>}
                  </div>
                  <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-slate-50 sm:text-4xl">{book.title}</h1>
                  <p className="mt-1.5 text-lg text-slate-300">{book.author}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                    {rating > 0 ? (
                      <>
                        <Stars value={rating} />
                        <span className="font-semibold text-slate-200">{rating.toFixed(1)}</span>
                        <span>· {reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
                      </>
                    ) : (
                      <span>No ratings yet</span>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="flex flex-shrink-0 gap-2">
                    <Button size="sm" variant="secondary" fullWidth={false} onClick={() => navigate(editPath)}>Edit</Button>
                    <Button size="sm" variant="danger" fullWidth={false} onClick={() => setConfirmDelete(true)}>Delete</Button>
                  </div>
                )}
              </div>

              {isStudent && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    onClick={handleIssue}
                    loading={issuing}
                    disabled={alreadyRequested || available <= 0}
                    className="sm:flex-1"
                  >
                    {requestLabel}
                  </Button>
                  <Button
                    size="lg"
                    variant={wishlisted ? 'danger' : 'secondary'}
                    fullWidth={false}
                    onClick={handleWishlist}
                    loading={wishlistBusy}
                    aria-pressed={wishlisted}
                    className="w-full sm:w-auto"
                  >
                    {wishlisted ? '♥ In wishlist' : '♡ Add to wishlist'}
                  </Button>
                </div>
              )}
              {isStudent && alreadyRequested && (
                <p className="-mt-3 text-sm text-slate-400">You already have an open request or loan for this book. See My Books for its status.</p>
              )}

              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-border bg-input/60 p-5 sm:grid-cols-3">
                <Meta label="Publisher">{book.publisher || 'Unknown'}</Meta>
                <Meta label="Published">{book.publicationYear || 'N/A'}</Meta>
                <Meta label="Language">{book.language || 'N/A'}</Meta>
                <Meta label="Pages">{book.pages || 'N/A'}</Meta>
                <Meta label="ISBN">{book.isbn || 'N/A'}</Meta>
                <Meta label="Total copies">{book.totalCopies ?? 0}</Meta>
              </dl>

              <div>
                <h2 className="text-lg font-semibold text-slate-100">Overview</h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {book.description || 'No description is available for this title.'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Reviews */}
        <Card variant="glass">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-semibold text-slate-50">Reviews</h2>
            <span className="text-sm text-slate-400">{reviews.length} total</span>
          </div>

          {isStudent && !myReview && (
            <form onSubmit={handleSubmitReview} noValidate className="mb-6 rounded-2xl border border-border bg-input/60 p-4 sm:p-5">
              <h3 className="font-semibold text-slate-100">Write a review</h3>
              <fieldset className="mt-3">
                <legend className="field-label">Your rating</legend>
                <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={reviewRating === n}
                      aria-label={`${n} star${n === 1 ? '' : 's'}`}
                      onClick={() => {
                        setReviewRating(n);
                        setReviewError('');
                      }}
                      className={`grid h-11 w-11 place-items-center rounded-lg text-2xl transition-colors hover:bg-white/5 ${n <= reviewRating ? 'text-amber-400' : 'text-slate-600'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="mt-3">
                <label htmlFor="review-comment" className="field-label">Comment (optional)</label>
                <textarea
                  id="review-comment"
                  rows={3}
                  maxLength={COMMENT_MAX}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you think of this book?"
                  className="input-amo w-full resize-y"
                />
                <p className="mt-1 text-right text-xs text-muted">{reviewComment.length}/{COMMENT_MAX}</p>
              </div>
              {reviewError && <p role="alert" className="field-error">{reviewError}</p>}
              <div className="mt-3 flex justify-end">
                <Button type="submit" fullWidth={false} loading={submittingReview} className="w-full sm:w-auto">
                  {submittingReview ? 'Posting...' : 'Post review'}
                </Button>
              </div>
            </form>
          )}
          {isStudent && myReview && (
            <p className="mb-5 text-sm text-slate-400">You have reviewed this book. Thanks for sharing!</p>
          )}

          {reviews.length === 0 ? (
            <EmptyState bare icon="💬" title="No reviews yet" message={isStudent ? 'Be the first to share what you thought.' : 'Students have not reviewed this book yet.'} />
          ) : (
            <ul className="divide-y divide-border">
              {reviews.map((review) => (
                <li key={review._id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-100">{review.userId?.name || 'Library member'}</span>
                      <Stars value={Number(review.rating) || 0} />
                    </div>
                    <time className="text-xs text-muted" dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
                  </div>
                  {review.comment && <p className="mt-2 text-sm leading-6 text-slate-300">{review.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteBookModal
        isOpen={confirmDelete}
        bookTitle={book.title}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </MainLayout>
  );
};
