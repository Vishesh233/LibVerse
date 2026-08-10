import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { BookCard } from '../components/BookCard';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/dateUtils';
import { CoverImage } from '../components/CoverImage';

export const MyBooks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [borrowed, setBorrowed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await transactionsAPI.getUserTransactions();
        setBorrowed(res.data.transactions || res.data || []);
      } catch (err) {
        console.error('load my books', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (loading || borrowed.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    borrowed.forEach((transaction) => {
      const due = transaction.dueDate ? new Date(transaction.dueDate) : null;
      if (!due || isNaN(due)) return;

      const dueDateOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      if (dueDateOnly.getTime() !== tomorrow.getTime()) return;

      addNotification({
        id: `due-tomorrow-${transaction._id}`,
        title: 'Return due tomorrow',
        message: `${transaction.bookId?.title || transaction.title} is due tomorrow (${formatDate(transaction.dueDate)}). Student: ${user?.name || 'You'} (${user?.email || user?._id || 'N/A'}). Book ID: ${transaction.bookId?._id || transaction.bookId || transaction._id}`,
        read: false,
      });
    });
  }, [borrowed, loading, addNotification, user]);

  const handleReturn = async (id) => {
    setActioningId(id);
    try {
      const res = await transactionsAPI.returnBook(id);
      // If there's a fine, navigate to pay fine page
      if (res.data?.hasFine) {
        navigate(`/student/pay-fine/${id}`);
      } else {
        const txRes = await transactionsAPI.getUserTransactions();
        setBorrowed(txRes.data.transactions || txRes.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const handleRenew = async (id) => {
    setActioningId(id);
    try {
      await transactionsAPI.renewBook(id);
      const res = await transactionsAPI.getUserTransactions();
      setBorrowed(res.data.transactions || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="card p-8">
          <h1 className="text-3xl font-semibold text-slate-100">My Books</h1>
          <p className="mt-2 text-sm text-slate-300">Manage your currently borrowed titles and actions.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="text-center py-12">Loading your books...</div>
          ) : (
            borrowed.map((t) => {
              const issueDate = t.issueDate || t.createdAt || t.issuedAt;
              const rawDueDate = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A';
              const formattedDueDate = t.dueDate && typeof t.dueDate === 'string' && t.dueDate.includes('/') ? t.dueDate : rawDueDate;
              const formattedIssueDate = issueDate ? formatDate(issueDate) : 'N/A';

              return (
                <BookCard
                  key={t._id}
                  book={{
                    title: t.bookId?.title || t.title,
                    author: t.bookId?.author || t.author,
                    genre: t.bookId?.genre || t.genre,
                    coverImage: t.bookId?.coverImage || t.coverImage,
                    imageUrl: t.bookId?.imageUrl || t.imageUrl,
                    isbn: t.bookId?.isbn || t.isbn,
                    rating: t.bookId?.rating || t.rating,
                  }}
                  footer={
                    <div className="space-y-2 text-sm text-slate-500">
                      <div>Issued: {formattedIssueDate}</div>
                      <div>Due: {formattedDueDate}</div>
                      <div>Fine: ₹{t.fine || 0}</div>
                      <div>Status: {t.status || 'Borrowed'}</div>
                    </div>
                  }
                  actionLabel={t.status === 'issued' ? 'Return Book' : 'Renew'}
                  onActionClick={() => t.status === 'issued' ? handleReturn(t._id) : handleRenew(t._id)}
                  statusLabel={t.status || 'Active'}
                  isLoading={actioningId === t._id}
                  actionDisabled={actioningId === t._id}
                />
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
};
