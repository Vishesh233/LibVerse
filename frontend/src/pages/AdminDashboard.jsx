import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../layouts/MainLayout';
import { transactionsAPI, adminAPI, booksAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { SearchableDropdown } from '../components/SearchableDropdown';
import { CoverImage } from '../components/CoverImage';
import { Avatar } from '../components/Avatar';
import { Card, Button, Badge, EmptyState, Skeleton, PageHeader } from '../components/UI';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const pageTitle = user?.role === 'librarian' ? 'Librarian Dashboard' : 'Admin Dashboard';
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [showIssueDropdown, setShowIssueDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [showReturnDropdown, setShowReturnDropdown] = useState(false);

  // Modals state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ userEmail: '', bookTitle: '' });
  const [returnForm, setReturnForm] = useState({ transactionId: '' });

  // Issue dropdown data
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  // Handle ESC key and body scroll lock
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showIssueModal) setShowIssueModal(false);
        if (showReturnModal) setShowReturnModal(false);
      }
    };

    if (showIssueModal || showReturnModal) {
      document.addEventListener('keydown', handleEsc);
      document.body.classList.add('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.classList.remove('modal-open');
    };
  }, [showIssueModal, showReturnModal]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showIssueDropdown && !e.target.closest('.issue-dropdown-container')) {
        setShowIssueDropdown(false);
      }
      if (showBookDropdown && !e.target.closest('.book-dropdown-container')) {
        setShowBookDropdown(false);
      }
      if (showReturnDropdown && !e.target.closest('.return-dropdown-container')) {
        setShowReturnDropdown(false);
      }
    };

    if (showIssueDropdown || showBookDropdown || showReturnDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showIssueDropdown, showBookDropdown, showReturnDropdown]);

  // Initial Data Load
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboard();
      if (res.data?.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
      toast.error('Failed to load live dashboard data');
    }

    try {
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
      const booksRes = await booksAPI.getBooks({ limit: 100 });
      if (booksRes.data?.books) {
        setBooks(booksRes.data.books);
      }
    } catch (err) {
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadReports();
  }, []);

  const loadReports = async () => {
    setReportLoading(true);
    try {
      const res = await adminAPI.getReports();
      if (res.data?.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setReportLoading(false);
    }
  };

  // Handle Approve Request
  const handleApprove = async (txId) => {
    setApprovingId(txId);
    try {
      await transactionsAPI.approveIssueRequest(txId);
      toast.success('Request approved successfully.');
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve request';
      toast.error(msg);
    } finally {
      setApprovingId(null);
    }
  };

  // Handle Reject/Decline Request
  const handleReject = async (txId) => {
    setRejectingId(txId);
    try {
      await transactionsAPI.rejectIssueRequest(txId);
      toast.success('Request rejected successfully.');
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to decline request';
      toast.error(msg);
    } finally {
      setRejectingId(null);
    }
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
        <p className="text-xs text-slate-400 mt-1">
          ISBN: {book.isbn} • {book.availableCopies ?? 0} available
        </p>
      </div>
    </div>
  );

  // Handle Issue Book Form Submit
  const handleConfirmIssue = async () => {
    if (!issueForm.userEmail && !issueForm.bookTitle) {
      toast.warning('Please select a student and book');
      return;
    }
    setSubmittingIssue(true);
    try {
      const res = await adminAPI.issueBook({
        userEmail: issueForm.userEmail,
        bookTitle: issueForm.bookTitle,
      });
      toast.success(res.data?.message || 'Book issued successfully!');
      setShowIssueModal(false);
      setIssueForm({ userEmail: '', bookTitle: '' });
      setSelectedStudentId('');
      setSelectedBookId('');
      setStudentSearch('');
      setBookSearch('');
      setShowIssueDropdown(false);
      setShowBookDropdown(false);
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to issue book';
      toast.error(msg);
    } finally {
      setSubmittingIssue(false);
    }
  };

  // Handle Return Book Form Submit
  const handleConfirmReturn = async () => {
    if (!returnForm.transactionId) {
      toast.warning('Please enter transaction ID, student email/ID, or book title');
      return;
    }
    setSubmittingReturn(true);
    try {
      const res = await adminAPI.returnBook({
        transactionId: returnForm.transactionId,
        query: returnForm.transactionId,
      });
      toast.success(res.data?.message || 'Book returned successfully!');
      setShowReturnModal(false);
      setReturnForm({ transactionId: '' });
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to return book';
      toast.error(msg);
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Handle Send Reminders
  const handleSendReminders = async () => {
    setSendingReminders(true);
    try {
      const res = await adminAPI.sendReminders();
      const count = Number(res.data?.count) || 0;
      if (count > 0) toast.success(res.data?.message || `Sent ${count} reminder${count === 1 ? '' : 's'}`);
      else toast.info(res.data?.message || 'No reminders due right now');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reminders');
    } finally {
      setSendingReminders(false);
    }
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const totalBooks = analytics?.totalBooks || 0;
    const issuedBooks = analytics?.issuedBooks || 0;
    const overdueBooks = analytics?.overdueBooks || 0;
    const activeUsers = analytics?.activeUsers || 0;
    const totalFines = analytics?.totalFines || 0;

    let csvContent = `data:text/csv;charset=utf-8,Metric,Value\nBooks Available,${totalBooks}\nIssued Books,${issuedBooks}\nOverdue Books,${overdueBooks}\nActive Borrowers,${activeUsers}\nTotal Fines Collected (₹),${totalFines}\n\n`;

    csvContent += `Overdue Member,Library ID,Book Title,Overdue Days,Fine Amount\n`;
    (analytics?.overdueList || []).forEach((item) => {
      csvContent += `"${item.name}","${item.libraryId}","${item.book}","${item.overdueDays}","${item.fine}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `library_management_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Library entries report exported to CSV!');
  };

  const recentActivities = analytics?.recentActivities || [];
  const pendingIssueRequests = analytics?.pendingRequests || [];
  const waitingTotal =
    pendingIssueRequests.length + (analytics?.returnRequests?.length || 0) + (analytics?.paymentPending?.length || 0);
  const overdueFines = (analytics?.overdueList || []).reduce((sum, item) => sum + (item.rawFineAmount || 0), 0);

  // Every number and sub-text below comes from GET /admin/dashboard - no made-up trends
  const statCards = [
    {
      title: 'Total Books',
      value: analytics?.totalBooks || 0,
      icon: '📚',
      sub: 'active titles in the catalogue',
      color: 'indigo',
    },
    {
      title: 'Issued Books',
      value: analytics?.issuedBooks || 0,
      icon: '✅',
      sub: `${analytics?.issuedToday || 0} issued today`,
      color: 'emerald',
    },
    {
      title: 'Pending Requests',
      value: waitingTotal,
      icon: '📥',
      sub: `${pendingIssueRequests.length} issue · ${analytics?.returnRequests?.length || 0} return · ${analytics?.paymentPending?.length || 0} payment`,
      color: 'cyan',
      glow: waitingTotal > 0,
      to: '/admin/pending',
    },
    {
      title: 'Overdue Books',
      value: analytics?.overdueBooks || 0,
      icon: '⏰',
      sub: overdueFines > 0 ? `₹${overdueFines} in fines accruing` : 'nothing overdue',
      color: 'rose',
      glow: (analytics?.overdueBooks || 0) > 0,
    },
    {
      title: 'Active Borrowers',
      value: analytics?.activeUsers || 0,
      icon: '👥',
      sub: `of ${analytics?.totalUsers || 0} active students`,
      color: 'sky',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-300', border: 'border-indigo-500/20' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/20' },
      rose: { bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/20' },
      sky: { bg: 'bg-sky-500/10', text: 'text-sky-300', border: 'border-sky-500/20' },
      cyan: { bg: 'bg-cyan-400/10', text: 'text-cyan-200', border: 'border-cyan-400/20' },
    };
    return colors[color] || colors.indigo;
  };

  const STATUS_BADGE = {
    Pending: 'warning',
    Issued: 'primary',
    'Return Requested': 'info',
    'Payment Pending': 'warning',
    Returned: 'success',
    Rejected: 'danger',
  };

  const formattedCurrentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-14">
        <PageHeader
          title={pageTitle}
          subtitle="Welcome back! Here's what's happening today."
          actions={
            <>
              <span className="text-xs font-medium text-slate-400">{formattedCurrentDate}</span>
              <Button variant="secondary" size="sm" fullWidth={false} loading={sendingReminders} onClick={handleSendReminders}>
                {sendingReminders ? 'Sending...' : 'Send reminders'}
              </Button>
            </>
          }
          className="!mb-2"
        />

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((card) => {
            const colorClasses = getColorClasses(card.color);
            const body = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className={`rounded-2xl px-3.5 py-2.5 text-2xl ${colorClasses.bg}`} aria-hidden="true">
                    {card.icon}
                  </div>
                  {card.to && <span className={`text-xs font-semibold ${colorClasses.text}`}>Review →</span>}
                </div>
                <div className="kpi-body mt-4">
                  {loading && !analytics ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    <p className="kpi-value font-display text-4xl font-bold leading-none text-white">{card.value}</p>
                  )}
                  <p className="mt-2 text-sm font-semibold text-slate-200">{card.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{card.sub}</p>
                </div>
              </>
            );
            return card.to ? (
              <button
                key={card.title}
                onClick={() => navigate(card.to)}
                className={`kpi-card card-glass !p-6 text-left transition hover:-translate-y-0.5 motion-reduce:transform-none ${card.glow ? 'glow-accent' : ''}`}
              >
                {body}
              </button>
            ) : (
              <Card key={card.title} variant="glass" className={`kpi-card !p-6 ${card.glow ? '!shadow-[0_0_0_1px_rgba(244,63,94,0.25),0_10px_40px_rgba(244,63,94,0.18)]' : ''}`}>
                {body}
              </Card>
            );
          })}
        </div>

        {/* Requests queue: first 5 pending issue requests */}
        <Card variant="glass" className="!p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-100">Requests queue</h3>
              <p className="mt-0.5 text-xs text-slate-400">Latest pending issue requests</p>
            </div>
            <Button variant="ghost" size="sm" fullWidth={false} onClick={() => navigate('/admin/pending')}>
              View all →
            </Button>
          </div>
          {loading && !analytics ? (
            <Skeleton lines={3} className="h-12 w-full" />
          ) : pendingIssueRequests.length === 0 ? (
            <EmptyState bare icon="✅" title="No pending requests" message="New issue requests from students will appear here." />
          ) : (
            <ul className="divide-y divide-border">
              {pendingIssueRequests.slice(0, 5).map((req) => (
                <li key={req._id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-indigo-500/10 text-sm font-bold text-indigo-300" aria-hidden="true">
                      {req.initials || 'ST'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-100">{req.bookTitle}</p>
                      <p className="truncate text-xs text-slate-400">
                        {req.studentName}
                        {req.libraryId ? ` · ${req.libraryId}` : ''} · {req.requestTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      fullWidth={false}
                      loading={approvingId === req._id}
                      disabled={rejectingId === req._id}
                      onClick={() => handleApprove(req._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      fullWidth={false}
                      loading={rejectingId === req._id}
                      disabled={approvingId === req._id}
                      onClick={() => handleReject(req._id)}
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - 2 columns */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-display text-lg font-semibold text-slate-100 mb-6">Recent Activity</h3>
            {loading && !analytics ? (
              <Skeleton lines={4} className="h-14 w-full" />
            ) : recentActivities.length === 0 ? (
              <EmptyState bare icon="🕘" title="No activity yet" message="Issues, returns and requests will show up here." />
            ) : (
            <div className="space-y-4">
              {recentActivities.map((activity, idx) => (
                <div
                  key={activity._id || idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-900/30 border border-slate-800/40 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-300 font-bold text-sm flex items-center justify-center flex-shrink-0">
                      {activity.initials || activity.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {activity.name} {activity.action} "{activity.book}"
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant={STATUS_BADGE[activity.status] || 'neutral'} size="md" className="flex-shrink-0">
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Quick Actions - 1 column */}
          <div className="card p-6">
            <h3 className="font-display text-lg font-semibold text-slate-100 mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/books/add')}
                className="w-full btn-primary text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Add New Book
              </button>
              <button
                onClick={() => setShowIssueModal(true)}
                className="w-full btn-success text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Issue Book
              </button>
              <button
                onClick={() => navigate('/admin/pending')}
                className="w-full rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-300 hover:scale-105 transition-all border border-border bg-slate-800/40"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                </svg>
                Review Requests
              </button>
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-300 hover:scale-105 transition-all border border-border bg-slate-800/40"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add User
              </button>
              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-300 hover:scale-105 transition-all border border-border bg-slate-800/40"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Issue Book to Student */}
      {showIssueModal && (
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-[8px] flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIssueModal(false);
          }}
        >
          <div
            className="modal-amo w-full max-w-md"
            style={{
              animation: 'modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <h3 className="text-lg font-bold text-slate-100 mb-4">📚 Issue Book to Student</h3>
            <p className="text-xs text-slate-300 mb-4">
              Enter the student's email or Library ID (e.g. <span className="font-mono text-indigo-300 font-semibold">alice@example.com</span> / <span className="font-mono text-indigo-300 font-semibold">LIB-1001</span>) and the book title (e.g. <span className="font-semibold text-slate-200">Clean Code</span>).
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Select Student *</label>
                <div className="relative issue-dropdown-container">
                  <SearchableDropdown
                    items={students}
                    searchFields={['name', 'email', 'libraryId']}
                    valueKey="_id"
                    selectedId={selectedStudentId}
                    inputValue={studentSearch}
                    onInputChange={setStudentSearch}
                    showDropdown={showIssueDropdown}
                    onToggleDropdown={setShowIssueDropdown}
                    onSelect={(s) => {
                      setSelectedStudentId(s._id);
                      setStudentSearch(s.name);
                      setIssueForm({ ...issueForm, userEmail: s.email });
                    }}
                    onClear={() => {
                      setSelectedStudentId('');
                      setStudentSearch('');
                      setIssueForm({ ...issueForm, userEmail: '' });
                    }}
                    placeholder="Search by name, email, or library ID..."
                    containerClass="issue-dropdown-container"
                    renderItem={renderStudentItem}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Select Book *</label>
                <div className="relative book-dropdown-container">
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
                      setIssueForm({ ...issueForm, bookTitle: b.title });
                    }}
                    onClear={() => {
                      setSelectedBookId('');
                      setBookSearch('');
                      setIssueForm({ ...issueForm, bookTitle: '' });
                    }}
                    placeholder="Search by title, ISBN, or author..."
                    containerClass="book-dropdown-container"
                    renderItem={renderBookItem}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 text-xs font-semibold btn-danger"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmIssue}
                disabled={submittingIssue}
                className="px-4 py-2 text-xs font-semibold btn-primary disabled:opacity-50"
              >
                {submittingIssue ? 'Processing Issue...' : 'Confirm Issue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Return Book */}
      {showReturnModal && (
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-[8px] flex items-center justify-center z-[9999] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReturnModal(false);
          }}
        >
          <div
            className="modal-amo w-full max-w-md"
            style={{
              animation: 'modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <h3 className="text-lg font-bold text-slate-100 mb-4">↻ Return Book</h3>
            <p className="text-xs text-slate-300 mb-4">
              Enter Transaction ID, Student Email / Library ID, or Book Title to process book return.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Book / Student / Transaction Query</label>
              <div className="relative return-dropdown-container">
                <input
                  type="text"
                  value={returnForm.transactionId}
                  onChange={(e) => setReturnForm({ transactionId: e.target.value })}
                  placeholder="e.g. sarah@example.com, LIB-1007, or The Hobbit"
                  className="w-full input-amo pr-8"
                />
                {returnForm.transactionId && (
                  <button
                    type="button"
                    onClick={() => setReturnForm({ transactionId: '' })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-lg leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 text-xs font-semibold btn-danger"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                disabled={submittingReturn}
                className="px-4 py-2 text-xs font-semibold btn-success disabled:opacity-50"
              >
                {submittingReturn ? 'Processing Return...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};