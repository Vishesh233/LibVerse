import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { booksAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { BookForm } from '../components/BookForm';
import { useAuth } from '../hooks/useAuth';

export const EditBook = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, isLibrarian } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canAccess = isAdmin || isLibrarian;
  const backPath = isAdmin ? '/admin/books' : '/librarian/books';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const res = await booksAPI.getBookById(id);
      setBook(res.data.book || res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  if (!canAccess) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <p className="text-rose-400 font-semibold">Access Denied: Librarian/Admin only</p>
        </div>
      </MainLayout>
    );
  }

  const handleSubmit = async (bookData) => {
    setSubmitting(true);
    setError(null);
    try {
      await booksAPI.updateBook(id, bookData);
      toast.success('Book updated successfully!');
      navigate(backPath);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update book';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(backPath)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Book Collection
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">✏️ Edit Book</h1>
          <p className="mt-1 text-sm text-slate-400">Update the details of this book</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="card">
          {loading ? (
            <div className="py-16 text-center text-slate-400">Loading book details...</div>
          ) : book ? (
            <BookForm
              key={book._id}
              initialData={book}
              onSubmit={handleSubmit}
              onCancel={() => navigate(backPath)}
              submitting={submitting}
              submitLabel="💾 Update Book"
              submittingLabel="Updating..."
            />
          ) : (
            <div className="py-16 text-center text-rose-400">Book not found</div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};