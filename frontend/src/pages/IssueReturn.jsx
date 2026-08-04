import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminAPI, booksAPI, transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';

export const IssueReturn = () => {
  const [activeTab, setActiveTab] = useState('issue'); // 'issue' or 'return'
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [issuedTransactions, setIssuedTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Issue Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Return Form State
  const [selectedReturnTxId, setSelectedReturnTxId] = useState('');
  const [returnQuery, setReturnQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Load Students
      const usersRes = await adminAPI.getAllUsers({ limit: 100 });
      if (usersRes.data?.users) {
        const studentUsers = usersRes.data.users.filter(
          (u) => u.role === 'student' || u.role === 'librarian'
        );
        setStudents(studentUsers);
      }
    } catch (err) {
      console.error('Error loading students:', err);
    }

    try {
      // Load Books
      const booksRes = await booksAPI.getBooks({ limit: 100 });
      if (booksRes.data?.books) {
        setBooks(booksRes.data.books);
      }
    } catch (err) {
      console.error('Error loading books:', err);
    }

    try {
      // Load Dashboard Recent Transactions & Issued Transactions
      const dashRes = await adminAPI.getDashboard();
      if (dashRes.data?.analytics) {
        setRecentTransactions(dashRes.data.analytics.recentActivities || []);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }

    try {
      // Load Active Issued Transactions for Return tab
      const txRes = await transactionsAPI.getAllTransactions({ status: 'issued', limit: 100 });
      if (txRes.data?.transactions) {
        setIssuedTransactions(txRes.data.transactions);
      }
    } catch (err) {
      console.error('Error loading active issued transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Issue Book Submit
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.warning('Please select a student');
      return;
    }
    if (!selectedBookId) {
      toast.warning('Please select a book');
      return;
    }

    const studentObj = students.find((s) => s._id === selectedStudentId);
    const bookObj = books.find((b) => b._id === selectedBookId);

    setSubmitting(true);
    try {
      const res = await adminAPI.issueBook({
        userEmail: studentObj?.email,
        libraryId: studentObj?.libraryId,
        bookId: selectedBookId,
        bookTitle: bookObj?.title,
        dueDate,
      });
      toast.success(res.data?.message || 'Book issued successfully!');
      setSelectedStudentId('');
      setSelectedBookId('');
      setDueDate('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Return Book Submit
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReturnTxId && !returnQuery) {
      toast.warning('Please select an active transaction or enter search query');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminAPI.returnBook({
        transactionId: selectedReturnTxId,
        query: returnQuery,
      });
      toast.success(res.data?.message || 'Book returned successfully!');
      setSelectedReturnTxId('');
      setReturnQuery('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Page Top Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Issue & Return Books</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Manage book circulation and returns
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Main Card (2 Cols): Issue/Return Tabs & Form */}
          <div className="lg:col-span-2 bg-slate-950/90 rounded-3xl border border-slate-800/80 shadow-[0_18px_50px_rgba(15,23,42,0.35)] overflow-hidden h-full">
            {/* Tab Headers */}
            <div className="flex border-b border-slate-800 bg-slate-950">
              <button
                onClick={() => setActiveTab('issue')}
                className={`flex-1 py-3.5 text-center text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'issue'
                    ? 'text-indigo-300 border-b-2 border-indigo-500 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Issue Book
              </button>
              <button
                onClick={() => setActiveTab('return')}
                className={`flex-1 py-3.5 text-center text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'return'
                    ? 'text-emerald-300 border-b-2 border-emerald-500 bg-emerald-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                Return Book
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6">
              {activeTab === 'issue' ? (
                <form onSubmit={handleIssueSubmit} className="space-y-5">
                  {/* Select Student */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Select Student *
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full input-amo cursor-pointer"
                    >
                      <option value="">Choose a student...</option>
                      {students.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.libraryId || s.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Book */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Select Book *
                    </label>
                    <select
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      className="w-full input-amo cursor-pointer"
                    >
                      <option value="">Choose a book...</option>
                      {books.map((b) => (
                        <option key={b._id} value={b._id} disabled={b.availableCopies <= 0}>
                          {b.title} by {b.author} ({b.availableCopies} available)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full input-amo"
                    />
                  </div>

                  {/* Big Green Button matching screenshot */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary disabled:opacity-50 mt-6"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {submitting ? 'Issuing Book...' : 'Issue Book'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReturnSubmit} className="space-y-5">
                  {/* Select Active Issued Book */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Select Active Issued Transaction *
                    </label>
                    <select
                      value={selectedReturnTxId}
                      onChange={(e) => setSelectedReturnTxId(e.target.value)}
                      className="w-full input-amo cursor-pointer"
                    >
                      <option value="">Choose an active issue...</option>
                      {issuedTransactions.map((tx) => (
                        <option key={tx._id} value={tx._id}>
                          {tx.userId?.name || 'Student'} - {tx.bookId?.title || 'Book'} (Due: {new Date(tx.dueDate).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Or Search Query */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Or Search Student Email / Library ID / Book Title
                    </label>
                    <input
                      type="text"
                      value={returnQuery}
                      onChange={(e) => setReturnQuery(e.target.value)}
                      placeholder="e.g. john.doe@example.com or Clean Code"
                      className="w-full input-amo"
                    />
                  </div>

                  {/* Big Emerald Button matching screenshot */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-success disabled:opacity-50 mt-6"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {submitting ? 'Processing Return...' : 'Return Book'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Card (1 Col): Recent Transactions matching screenshot 3 */}
          <div className="card p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="font-bold text-slate-100 text-base mb-4">Recent Transactions</h3>

              <div className="space-y-3">
                {recentTransactions.slice(0, 6).map((tx, idx) => {
                  const isIssue = tx.action === 'borrowed' || tx.status === 'Issued';
                  const dateStr = '4/15/2026';

                  return (
                    <div
                      key={tx.id || idx}
                      className="p-3.5 rounded-xl bg-slate-900/25 border border-slate-800/40 space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-bold">
                        {isIssue ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ISSUE
                          </span>
                        ) : (
                          <span className="text-sky-400 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            RETURN
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-100">{tx.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{tx.book}</p>
                      <p className="text-[10px] text-slate-400">{tx.time || dateStr}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
