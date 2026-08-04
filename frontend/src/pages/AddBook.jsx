import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { booksAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { BookForm } from '../components/BookForm';
import { useAuth } from '../hooks/useAuth';

export const AddBook = () => {
  const navigate = useNavigate();
  const { isAdmin, isLibrarian } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canAccess = isAdmin || isLibrarian;
  const backPath = isAdmin ? '/admin/books' : '/librarian/books';

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
      // Log book data size to check if image is too large
      const dataSize = JSON.stringify(bookData).length;
      console.log('Creating book...');
      console.log('Data size:', `${(dataSize / 1024).toFixed(2)} KB`);
      console.log('Has cover image:', !!bookData.coverImage);
      
      const response = await booksAPI.createBook(bookData);
      console.log('Book created successfully:', response.data);
      toast.success('Book created successfully!');
      navigate(backPath);
    } catch (err) {
      console.error('=== BOOK CREATION ERROR ===');
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.message);
      console.error('Error data:', err.response?.data);
      console.error('Full error:', err);
      
      let message = 'Failed to create book';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      
      setError(`${message}${err.response?.status ? ` (Status: ${err.response.status})` : ''}`);
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
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">➕ Add New Book</h1>
          <p className="mt-1 text-sm text-slate-400">Add a new book to the library catalog</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="card">
          <BookForm
            onSubmit={handleSubmit}
            onCancel={() => navigate(backPath)}
            submitting={submitting}
            submitLabel="✨ Create Book"
            submittingLabel="Creating..."
          />
        </div>
      </div>
    </MainLayout>
  );
};