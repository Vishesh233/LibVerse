import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { adminAPI, booksAPI, transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { SearchableDropdown } from '../components/SearchableDropdown';
import { CoverImage } from '../components/CoverImage';
import { Avatar } from '../components/Avatar';

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
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  // Return Form State
  const [selectedReturnTxId, setSelectedReturnTxId] = useState('');
  const [returnSearchQuery, setReturnSearchQuery] = useState('');
  const [showReturnDropdown, setShowReturnDropdown] = useState(false);
  const [selectedReturnTx, setSelectedReturnTx] = useState(null);

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

  // Filter transactions for return based on search query
  const filteredTransactions = useMemo(() => {
    if (!returnSearchQuery.trim()) return issuedTransactions;
    const query = returnSearchQuery.toLowerCase();
    return issuedTransactions.filter((tx) => {
      const studentName = tx.userId?.name?.toLowerCase() || '';
      const studentEmail = tx.userId?.email?.toLowerCase() || '';
      const libraryId = tx.userId?.libraryId?.toLowerCase() || '';
      const bookTitle = tx.bookId?.title?.toLowerCase() || '';
      const txId = tx._id?.toLowerCase() || '';
      return (
        studentName.includes(query) ||
        studentEmail.includes(query) ||
        libraryId.includes(query) ||
        bookTitle.includes(query) ||
        txId.includes(query)
      );
    });
  }, [issuedTransactions, returnSearchQuery]);

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
      setStudentSearch('');
      setBookSearch('');
      setShowStudentDropdown(false);
      setShowBookDropdown(false);
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
    if (!selectedReturnTxId) {
      toast.warning('Please select a transaction');
      return;
    }

    setSubmitting(true);
    try {
      const res = await transactionsAPI.returnBook(selectedReturnTxId);
      toast.success(res.data?.message || 'Return request submitted successfully!');
      setSelectedReturnTxId('');
      setReturnSearchQuery('');
      setSelectedReturnTx(null);
      setShowReturnDropdown(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle selecting a return transaction
  const handleSelectReturnTx = (tx) => {
    setSelectedReturnTxId(tx._id);
    setSelectedReturnTx(tx);
    setShowReturnDropdown(false);
  };

  // Render a student dropdown item with avatar
  const renderStudentItem = (student, isSelected) => (
    <div className="flex items-start gap-3">
      <Avatar
        name={student.name || ''}
        src={student.profileImage}
        size={2}
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">{student.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {student.email} • {student.libraryId}
        </p>
      </div>
    </div>
  );

  // Render a book dropdown item with thumbnail
  const renderBookItem = (book, isSelected) => (
    <div className="flex items-start gap-3">
      <div className="h-14 w-10 overflow-hidden rounded flex-shrink-0 bg-input border border-border">
        <CoverImage book={book} alt={book.title} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">{book.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">by {book.author}</p>
        <p className="text-xs text-slate-500 mt-1">
          ISBN: {book.isbn} • {book.availableCopies ?? 0} available
        </p>
      </div>
    </div>
  );

  // Render a return transaction dropdown item
  const renderTransactionItem = (tx, isSelected) => {
    const dueDate = new Date(tx.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = dueDate < today;

    return (
      <div className="flex items-start gap-3">
        <Avatar
          name={tx.userId?.name || 'Student'}
          src={tx.userId?.profileImage}
          size={2}
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
            {tx.userId?.name || 'Student'} - {tx.bookId?.title || 'Book'}
            {isOverdue && (
              <span className="ml-2 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                OVERDUE
              </span>
            )}
          </p>
          <p className={`text-xs mt-0.5 ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`}>
            {tx.userId?.email} • {tx.userId?.libraryId} • Due: {dueDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    );
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
                  {/* Select Student with Search */}
                  <div className="relative student-dropdown-container">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Select Student *
                    </label>
                    <SearchableDropdown
                      items={students}
                      searchFields={['name', 'email', 'libraryId']}
                      valueKey="_id"
                      selectedId={selectedStudentId}
                      inputValue={studentSearch}
                      onInputChange={setStudentSearch}
                      showDropdown={showStudentDropdown}
                      onToggleDropdown={setShowStudentDropdown}
                      onSelect={(s) => {
                        setSelectedStudentId(s._id);
                        setStudentSearch(`${s.name} (${s.libraryId || s.email})`);
                      }}
                      onClear={() => {
                        setSelectedStudentId('');
                        setStudentSearch('');
                      }}
                      placeholder="Search by name, email, or library ID..."
                      containerClass="student-dropdown-container"
                      renderItem={renderStudentItem}
                    />
                  </div>

                  {/* Select Book with Search */}
                  <div className="relative book-dropdown-container">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Select Book *
                    </label>
                    <SearchableDropdown
                      items={books}
                      searchFields={['title', 'isbn', 'author']}
                      valueKey="_id"
                      selectedId={selectedBookId}
                      inputValue={bookSearch}
                      onInputChange={setBookSearch}
                      showDropdown={showBookDropdown}
                      onToggleDropdown={setShowBookDropdown}
                      onSelect={(b) => {
                        setSelectedBookId(b._id);
                        setBookSearch(b.title);
                      }}
                      onClear={() => {
                        setSelectedBookId('');
                        setBookSearch('');
                      }}
                      placeholder="Search by title, ISBN, or author..."
                      containerClass="book-dropdown-container"
                      renderItem={renderBookItem}
                    />
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
                  {/* Select Active Issued Transaction with Search */}
                  <div className="relative return-dropdown-container">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Select Transaction to Return *
                    </label>
                    <SearchableDropdown
                      items={issuedTransactions}
                      searchFields={['userId.name', 'userId.email', 'userId.libraryId', 'bookId.title', '_id']}
                      valueKey="_id"
                      selectedId={selectedReturnTxId}
                      inputValue={returnSearchQuery}
                      onInputChange={setReturnSearchQuery}
                      showDropdown={showReturnDropdown}
                      onToggleDropdown={setShowReturnDropdown}
                      onSelect={handleSelectReturnTx}
                      onClear={() => {
                        setSelectedReturnTxId('');
                        setReturnSearchQuery('');
                        setSelectedReturnTx(null);
                      }}
                      placeholder="Search by Transaction ID, student name, email, library ID, or book title..."
                      containerClass="return-dropdown-container"
                      renderItem={renderTransactionItem}
                    />
                  </div>

                  {/* Show selected transaction details */}
                  {selectedReturnTx && (() => {
                    const selDueDate = new Date(selectedReturnTx.dueDate);
                    selDueDate.setHours(0, 0, 0, 0);
                    const selToday = new Date();
                    selToday.setHours(0, 0, 0, 0);
                    const selIsOverdue = selDueDate < selToday;

                    return (
                      <div className={`bg-slate-900/50 border rounded-xl p-4 space-y-3 ${selIsOverdue ? 'border-rose-500/50' : 'border-slate-700'}`}>
                        <h4 className="text-sm font-semibold text-slate-200 mb-2">Return Details</h4>
                        {selectedReturnTx.bookId?.coverImage && (
                          <img
                            src={selectedReturnTx.bookId.coverImage}
                            alt={selectedReturnTx.bookId?.title}
                            className="w-16 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="space-y-1.5">
                          <p className="text-sm font-medium text-slate-200">
                            <span className="text-slate-400">Book:</span> {selectedReturnTx.bookId?.title || 'N/A'}
                          </p>
                          <p className="text-sm text-slate-300">
                            <span className="text-slate-400">Student:</span> {selectedReturnTx.userId?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-slate-300">
                            <span className="text-slate-400">Issue Date:</span> {new Date(selectedReturnTx.issueDate).toLocaleDateString()}
                          </p>
                          <p className={`text-sm ${selIsOverdue ? 'text-rose-400' : 'text-slate-300'}`}>
                            <span className="text-slate-400">Due Date:</span> {selDueDate.toLocaleDateString()}
                            {selIsOverdue && (
                              <span className="ml-2 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded">
                                OVERDUE
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Big Emerald Button matching screenshot */}
                  <button
                    type="submit"
                    disabled={submitting || !selectedReturnTxId}
                    className="w-full btn-success disabled:opacity-50 mt-6"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {submitting ? 'Processing...' : 'Submit Return Request'}
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
                  // Label by the real status (from getDashboard recentActivities)
                  const TX_LABELS = {
                    Pending: { label: 'REQUEST', className: 'text-amber-400' },
                    Issued: { label: 'ISSUE', className: 'text-emerald-400' },
                    'Return Requested': { label: 'RETURN REQUEST', className: 'text-violet-300' },
                    'Payment Pending': { label: 'PAYMENT PENDING', className: 'text-orange-400' },
                    Returned: { label: 'RETURN', className: 'text-sky-400' },
                    Rejected: { label: 'REJECTED', className: 'text-rose-400' },
                  };
                  const txLabel = TX_LABELS[tx.status] || { label: (tx.status || 'UPDATED').toUpperCase(), className: 'text-slate-400' };

                  return (
                    <div
                      key={tx.id || idx}
                      className="p-3.5 rounded-xl bg-slate-900/25 border border-slate-800/40 space-y-1"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] font-bold">
                        <span className={`${txLabel.className} flex items-center gap-1`}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {txLabel.label}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-100">{tx.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{tx.book}</p>
                      <p className="text-[10px] text-slate-400">{tx.time}</p>
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


