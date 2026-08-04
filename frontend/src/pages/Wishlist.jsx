import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { BookCard } from '../components/BookCard';
import { Card, EmptyState } from '../components/UI';
import { useWishlist } from '../hooks/useWishlist';

export const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, isWishlisted } = useWishlist();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">💖 My Wishlist</h1>
          <p className="mt-1 text-slate-400">
            Save books for later and keep quick access to your favorites.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <Card>
            <div className="text-center py-16">
              <p className="text-2xl">📭</p>
              <h2 className="text-xl font-semibold mt-4 text-slate-100">No books in your wishlist</h2>
              <p className="text-slate-400 mt-2">Browse books and add your favorites to wishlist.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onCardClick={() => navigate(`/student/books/${book._id}`)}
                onActionClick={() => removeFromWishlist(book._id)}
                actionLabel="Remove"
                actionDisabled={false}
                isWishlisted={isWishlisted(book._id)}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};