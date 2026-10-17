import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../layouts/MainLayout';
import { BookCard } from '../components/BookCard';
import { Button, EmptyState, PageHeader, Skeleton } from '../components/UI';
import { useWishlist } from '../hooks/useWishlist';

export const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (book) => {
    setRemovingId(book._id);
    try {
      await removeFromWishlist(book._id);
      toast.info(`Removed "${book.title || 'book'}" from your wishlist`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update your wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="My wishlist"
          subtitle={wishlist.length > 0 ? `${wishlist.length} saved book${wishlist.length === 1 ? '' : 's'}` : 'Save books for later and come back to them quickly.'}
          actions={wishlist.length > 0 ? <Button fullWidth={false} variant="secondary" onClick={() => navigate('/student/books')}>Browse books</Button> : null}
        />

        {loading && wishlist.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5" aria-busy="true" aria-label="Loading wishlist">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card-glass !p-0 overflow-hidden">
                <Skeleton className="aspect-[2/3] w-full !rounded-none" />
                <div className="space-y-2 p-3 sm:p-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <EmptyState
            icon="💖"
            title="Your wishlist is empty"
            message="Tap the heart on any book in the catalogue to save it here."
            action={<Button fullWidth={false} onClick={() => navigate('/student/books')}>Browse books</Button>}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {wishlist.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onCardClick={() => navigate(`/student/books/${book._id}`)}
                onActionClick={() => handleRemove(book)}
                actionLabel={removingId === book._id ? 'Removing...' : 'Remove'}
                actionVariant="secondary"
                isLoading={removingId === book._id}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
