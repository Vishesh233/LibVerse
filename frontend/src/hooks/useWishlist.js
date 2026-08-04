import { useCallback, useEffect, useState } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './useAuth';

export const useWishlist = () => {
  const { isAuthenticated, user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from database when user is authenticated
  useEffect(() => {
    let isMounted = true;

    const fetchWishlist = async () => {
      if (!isAuthenticated || !user) {
        setWishlist([]);
        return;
      }

      setLoading(true);
      try {
        const res = await wishlistAPI.getWishlist();
        if (isMounted) {
          setWishlist(res.data.wishlist || []);
        }
      } catch (err) {
        // Silently fail - wishlist will be empty
        if (isMounted) setWishlist([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchWishlist();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?._id]);

  const addToWishlist = useCallback(
    async (book) => {
      if (!isAuthenticated || !user) return;
      try {
        await wishlistAPI.addToWishlist(book._id);
        setWishlist((current) => {
          if (current.some((item) => item._id === book._id)) return current;
          return [...current, book];
        });
      } catch (err) {
        // ignore
      }
    },
    [isAuthenticated, user]
  );

  const removeFromWishlist = useCallback(
    async (bookId) => {
      if (!isAuthenticated || !user) return;
      try {
        await wishlistAPI.removeFromWishlist(bookId);
        setWishlist((current) => current.filter((item) => item._id !== bookId));
      } catch (err) {
        // ignore
      }
    },
    [isAuthenticated, user]
  );

  const toggleWishlist = useCallback(
    async (book) => {
      if (!isAuthenticated || !user) return;
      const isCurrentlyWishlisted = wishlist.some((item) => item._id === book._id);
      if (isCurrentlyWishlisted) {
        await removeFromWishlist(book._id);
      } else {
        await addToWishlist(book);
      }
    },
    [isAuthenticated, user, wishlist, addToWishlist, removeFromWishlist]
  );

  const isWishlisted = useCallback(
    (bookId) => wishlist.some((item) => item._id === bookId),
    [wishlist]
  );

  return {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isWishlisted,
  };
};