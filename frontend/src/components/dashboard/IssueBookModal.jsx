import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminAPI, booksAPI } from '../../services/api';
import { SearchableDropdown } from '../SearchableDropdown';
import { CoverImage } from '../CoverImage';
import { Avatar } from '../Avatar';

/**
 * Desk issue (staff): pick a student and a book, POST /admin/issue-book.
 * Students and books load when the modal opens (not on every dashboard load).
 * `presetStudent` ({ _id, name, libraryId }, e.g. from Student 360) fixes the student: only the book is chosen.
 */
export const IssueBookModal = ({ open, onClose, onIssued, presetStudent = null }) => {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [student, setStudent] = useState(presetStudent);
  const [book, setBook] = useState(null);
  const [studentSearch, setStudentSearch] = useState(presetStudent?.name || '');
  const [bookSearch, setBookSearch] = useState('');
  const [showStudents, setShowStudents] = useState(false);
  const [showBooks, setShowBooks] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    Promise.allSettled([presetStudent ? Promise.resolve(null) : adminAPI.getAllUsers({ limit: 100 }), booksAPI.getBooks({ limit: 100 })]).then(([u, b]) => {
      if (cancelled) return;
      if (u.status === 'fulfilled' && u.value) setStudents((u.value.data?.users || []).filter((x) => x.role === 'student' || x.role === 'librarian'));
      if (b.status === 'fulfilled') setBooks(b.value.data?.books || []);
    });
    const onEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    document.body.classList.add('modal-open');
    return () => {
      cancelled = true;
      document.removeEventListener('keydown', onEsc);
      document.body.classList.remove('modal-open');
    };
  }, [open, onClose, presetStudent?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close the dropdown lists on an outside click
  useEffect(() => {
    if (!showStudents && !showBooks) return undefined;
    const onClick = (e) => {
      if (showStudents && !e.target.closest('.issue-dropdown-container')) setShowStudents(false);
      if (showBooks && !e.target.closest('.book-dropdown-container')) setShowBooks(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [showStudents, showBooks]);

  if (!open) return null;

  const reset = () => {
    setStudent(presetStudent);
    setBook(null);
    setStudentSearch(presetStudent?.name || '');
    setBookSearch('');
    setShowStudents(false);
    setShowBooks(false);
  };

  const handleConfirm = async () => {
    if (!student || !book) {
      toast.warning('Please select a student and a book');
      return;
    }
    setSubmitting(true);
    try {
      const who = student.email ? { userEmail: student.email } : { libraryId: student.libraryId };
      const res = await adminAPI.issueBook({ ...who, bookId: book._id });
      toast.success(res.data?.message || 'Book issued successfully!');
      reset();
      onClose();
      onIssued?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-[8px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-amo w-full max-w-md" role="dialog" aria-modal="true" aria-labelledby="issue-book-title" style={{ animation: 'modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <h3 id="issue-book-title" className="mb-2 text-lg font-bold text-slate-100">Issue a book</h3>
        <p className="mb-4 text-xs text-slate-300">Search by name, email or library ID, then by title, ISBN or author.</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="issue-student" className="mb-1 block text-xs font-semibold text-slate-300">Student *</label>
            {presetStudent ? (
              <div id="issue-student" className="flex items-center gap-3 rounded-xl border border-border bg-input/60 px-3 py-2.5">
                <Avatar name={presetStudent.name || ''} src={presetStudent.profileImage} size={9} className="flex-shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-100">{presetStudent.name}</p>
                  <p className="font-mono text-xs text-slate-400">{presetStudent.libraryId}</p>
                </div>
              </div>
            ) : (
            <div className="relative issue-dropdown-container">
              <SearchableDropdown
                id="issue-student"
                items={students}
                searchFields={['name', 'email', 'libraryId']}
                valueKey="_id"
                selectedId={student?._id || ''}
                inputValue={studentSearch}
                onInputChange={setStudentSearch}
                showDropdown={showStudents}
                onToggleDropdown={setShowStudents}
                onSelect={(s) => { setStudent(s); setStudentSearch(s.name); }}
                onClear={() => { setStudent(null); setStudentSearch(''); }}
                placeholder="Search by name, email, or library ID..."
                containerClass="issue-dropdown-container"
                renderItem={(s) => (
                  <div className="flex items-start gap-3">
                    <Avatar name={s.name || ''} src={s.profileImage} size={2} className="flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200">{s.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{s.libraryId}</p>
                    </div>
                  </div>
                )}
              />
            </div>
            )}
          </div>

          <div>
            <label htmlFor="issue-book" className="mb-1 block text-xs font-semibold text-slate-300">Book *</label>
            <div className="relative book-dropdown-container">
              <SearchableDropdown
                id="issue-book"
                items={books}
                searchFields={['title', 'isbn', 'author']}
                valueKey="_id"
                selectedId={book?._id || ''}
                inputValue={bookSearch}
                onInputChange={setBookSearch}
                showDropdown={showBooks}
                onToggleDropdown={setShowBooks}
                onSelect={(b) => { setBook(b); setBookSearch(b.title); }}
                onClear={() => { setBook(null); setBookSearch(''); }}
                placeholder="Search by title, ISBN, or author..."
                containerClass="book-dropdown-container"
                renderItem={(b) => (
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-10 flex-shrink-0 overflow-hidden rounded border border-border bg-input">
                      <CoverImage book={b} alt="" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200">{b.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">by {b.author}</p>
                      <p className="mt-1 text-xs text-slate-400">{b.availableCopies ?? 0} available</p>
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 text-xs font-semibold">Cancel</button>
          <button type="button" onClick={handleConfirm} disabled={submitting} className="btn-primary px-4 py-2 text-xs font-semibold disabled:opacity-50">
            {submitting ? 'Issuing...' : 'Confirm issue'}
          </button>
        </div>
      </div>
    </div>
  );
};
