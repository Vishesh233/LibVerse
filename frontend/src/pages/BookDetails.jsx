import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../layouts/MainLayout';
import { booksAPI, transactionsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { DeleteBookModal } from '../components/DeleteBookModal';

const PLACEHOLDER_COVER = 'https://via.placeholder.com/400x300?text=No+Cover';

export const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isLibrarian, isStudent } = useAuth();
  const canManage = isAdmin || isLibrarian;
  const backPath = isAdmin ? '/admin/books' : isLibrarian ? '/librarian/books' : '/student/books';
  const editPath = isAdmin ? `/admin/books/${id}/edit` : `/librarian/books/${id}/edit`;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
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

  const handleIssue = async () => {
    setIssuing(true);
    try {
      await transactionsAPI.requestIssueBook({ bookId: id });
      toast.success('Book request submitted successfully.');
      fetchBook();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setIssuing(false);
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

  if (loading) {
    return (
      <MainLayout>
        <div className="p-16 text-center text-slate-400">Loading...</div>
      </MainLayout>
    );
  }

  if (error || !book) {
    return (
      <MainLayout>
        <div className="p-16 text-center text-rose-400">{error}</div>
      </MainLayout>
    );
  }

  const coverSrc = imageError ? PLACEHOLDER_COVER : book.coverImage || book.image || PLACEHOLDER_COVER;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Back button */}
        <button
          onClick={() => navigate(backPath)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to {canManage ? 'Book Collection' : 'Books'}
        </button>

        <div className="card">
          <div className="grid gap-8 xl:grid-cols-[400px_minmax(0,1fr)]">
            <div className="relative group">
              {/* Soft glow behind image */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Book cover container */}
              <div className="relative rounded-3xl p-6 bg-input">
                <img
                  src={coverSrc}
                  alt={book.title}
                  onError={() => setImageError(true)}
                  className="h-[500px] w-full rounded-2xl object-cover shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-indigo-500/30"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">Book details</p>
                  <h1 className="mt-4 text-4xl font-semibold text-slate-100">{book.title}</h1>
                  <p className="mt-2 text-lg text-slate-300">{book.author}</p>
                </div>

                {/* Edit & Delete buttons - Admin/Librarian only */}
                {canManage && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(editPath)}
                      className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-all hover:bg-rose-500/20"
                    >
                      🗑 Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-[24px] border border-border bg-input p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Publisher</p>
                    <p className="mt-2 font-semibold text-slate-100">{book.publisher || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">ISBN</p>
                    <p className="mt-2 font-semibold text-slate-100">{book.isbn || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Published Year</p>
                    <p className="mt-2 font-semibold text-slate-100">{book.publicationYear || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Genre</p>
                    <span className="mt-2 inline-flex rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-sm font-semibold text-indigo-300">
                      {book.genre || 'General'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Available</p>
                    <p className="mt-2 font-semibold text-emerald-400">
                      {book.copiesAvailable ?? book.availableCopies ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Copies</p>
                    <p className="mt-2 font-semibold text-slate-100">{book.totalCopies ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Issued Copies</p>
                    <p className="mt-2 font-semibold text-amber-400">{book.issuedCopies ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Rating</p>
                    <p className="mt-2 font-semibold text-slate-100">
                      {book.rating ? (
                        <span className="flex items-center gap-2">
                          <span className="text-amber-400">⭐</span>
                          <span>{book.rating.toFixed(1)} / 5</span>
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>
                </div>

                {isStudent && (
                  <button
                    className="mt-8 w-full btn-primary"
                    onClick={handleIssue}
                    disabled={issuing || book.availableCopies === 0}
                  >
                    {issuing
                      ? 'Processing...'
                      : book.availableCopies > 0
                      ? 'Request Book'
                      : 'Unavailable'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-semibold text-slate-100">Overview</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {book.description || 'No description is available for this title.'}
          </p>
        </div>
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