import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as echarts from 'echarts';
import { MainLayout } from '../layouts/MainLayout';
import { transactionsAPI, adminAPI, booksAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { SearchableDropdown } from '../components/SearchableDropdown';
import { CoverImage } from '../components/CoverImage';
import { Avatar } from '../components/Avatar';
import { Card, Skeleton, PageHeader } from '../components/UI';

export const LibrarianDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [approvingReturnId, setApprovingReturnId] = useState(null);
  const [approvingPaymentId, setApprovingPaymentId] = useState(null);
  const categoryChartRef = useRef(null);
  const categoryChartInstance = useRef(null);

  // Modals state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ userEmail: '', bookTitle: '' });
  const [returnForm, setReturnForm] = useState({ transactionId: '' });
  const [submittingIssue, setSubmittingIssue] = useState(false);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [showIssueDropdown, setShowIssueDropdown] = useState(false);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [showReturnDropdown, setShowReturnDropdown] = useState(false);
  const [issueSearchResults, setIssueSearchResults] = useState({ users: [], books: [] });
  const [returnSearchResults, setReturnSearchResults] = useState({ transactions: [], users: [], books: [] });

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

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getDashboard();
      if (res.data?.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error('Error fetching librarian analytics:', err);
      toast.error('Failed to load dashboard data');
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
  }, []);

  // Initialize category donut chart
  useEffect(() => {
    if (!loading && analytics && categoryChartRef.current) {
      initCategoryChart();
    }

    return () => {
      if (categoryChartInstance.current) {
        categoryChartInstance.current.dispose();
      }
    };
  }, [loading, analytics]);

  useEffect(() => {
    const handleResize = () => {
      categoryChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Handle Approve Return (CASE A: no fine, or after fine paid)
  const handleApproveReturn = async (txId) => {
    setApprovingReturnId(txId);
    try {
      await transactionsAPI.approveReturn(txId);
      toast.success('Book return approved successfully.');
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve return';
      toast.error(msg);
    } finally {
      setApprovingReturnId(null);
    }
  };

  // Handle Approve Payment (CASE B: fine paid → book returned)
  const handleApprovePayment = async (txId) => {
    setApprovingPaymentId(txId);
    try {
      await transactionsAPI.approvePayment(txId);
      toast.success('Payment approved. Book returned successfully.');
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve payment';
      toast.error(msg);
    } finally {
      setApprovingPaymentId(null);
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
      // First, search for the transaction using the query
      const searchRes = await adminAPI.globalSearch(returnForm.transactionId);
      const transactions = searchRes.data?.results?.filter(r => r.type === 'transaction') || [];
      
      if (transactions.length === 0) {
        toast.error('No active transaction found matching your query');
        setSubmittingReturn(false);
        return;
      }

      // Use the first matching transaction
      const txId = transactions[0].id;
      
      // Submit return request using the student endpoint to follow proper workflow
      const res = await transactionsAPI.returnBook(txId);
      
      const hasFine = res.data?.hasFine;
      const message = hasFine 
        ? `Return request submitted with fine of ₹${res.data.fine}. Student needs to pay before you can approve.`
        : res.data?.message || 'Return request submitted successfully!';
      
      toast.success(message);
      setShowReturnModal(false);
      setReturnForm({ transactionId: '' });
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process return request';
      toast.error(msg);
    } finally {
      setSubmittingReturn(false);
    }
  };

  const initCategoryChart = () => {
    if (!categoryChartRef.current) return;

    categoryChartInstance.current = echarts.init(categoryChartRef.current);

    // Process category data - show top 4-5, group rest as "Others"
    const categoryData = analytics?.booksByCategory || [
      { category: 'Technology', count: 45 },
      { category: 'Fiction', count: 32 },
      { category: 'Science', count: 28 },
      { category: 'History', count: 19 },
      { category: 'Business', count: 15 },
      { category: 'Arts', count: 8 },
      { category: 'Philosophy', count: 6 },
    ];

    // Sort by count descending
    const sorted = [...categoryData].sort((a, b) => b.count - a.count);

    // Take top 4-5 categories
    const topCategories = sorted.slice(0, 5);
    const othersCount = sorted.slice(5).reduce((sum, cat) => sum + cat.count, 0);

    const chartData = [...topCategories];
    if (othersCount > 0) {
      chartData.push({ category: 'Others', count: othersCount });
    }

    const colors = ['#6366F1', '#22C55E', '#0EA5E9', '#F59E0B', '#EC4899', '#64748B'];

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: '#1E293B',
        borderWidth: 1,
        textStyle: {
          color: '#F8FAFC',
          fontSize: 13
        },
        padding: [12, 16],
        formatter: function (params) {
          const percentage = ((params.value / sorted.reduce((sum, cat) => sum + cat.count, 0)) * 100).toFixed(1);
          return `<div style="font-weight: 600; margin-bottom: 8px; color: #F8FAFC; font-size: 14px;">${params.name}</div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${params.color}; box-shadow: 0 0 10px ${params.color};"></span>
                    <span style="color: #94A3B8;">Count:</span>
                    <span style="color: #F8FAFC; font-weight: 600;">${params.value} books</span>
                  </div>
                  <div style="margin-top: 4px; color: #64748B; font-size: 12px;">${percentage}% of total</div>`;
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center',
        textStyle: {
          color: '#94A3B8',
          fontSize: 12
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 12,
        formatter: function (name) {
          const item = chartData.find(cat => cat.category === name);
          if (item) {
            return `${name}  ${item.count}`;
          }
          return name;
        }
      },
      series: [
        {
          name: 'Books by Category',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['65%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#0F172A',
            borderWidth: 3,
            color: function (params) {
              return colors[params.dataIndex % colors.length];
            }
          },
          label: {
            show: true,
            position: 'center',
            formatter: function () {
              const total = sorted.reduce((sum, cat) => sum + cat.count, 0);
              return `{total|${total}}\n{label|Total Books}`;
            },
            rich: {
              total: {
                fontSize: 28,
                fontWeight: 'bold',
                color: '#F8FAFC',
                lineHeight: 35
              },
              label: {
                fontSize: 12,
                color: '#64748B',
                lineHeight: 20
              }
            }
          },
          emphasis: {
            scale: true,
            scaleSize: 10,
            itemStyle: {
              shadowBlur: 30,
              shadowColor: 'rgba(99, 102, 241, 0.5)'
            },
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData.map((cat, idx) => ({
            value: cat.count,
            name: cat.category,
            itemStyle: {
              color: colors[idx % colors.length]
            }
          })),
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDuration: 2000
        }
      ]
    };

    categoryChartInstance.current.setOption(option, true);
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
    link.setAttribute('download', `library_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported to CSV!');
  };

  const recentActivities = analytics?.recentActivities?.length > 0 ? analytics.recentActivities : [];

  const waitingTotal =
    (analytics?.pendingRequests?.length || 0) + (analytics?.returnRequests?.length || 0) + (analytics?.paymentPending?.length || 0);
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
      sub: `${analytics?.pendingRequests?.length || 0} issue · ${analytics?.returnRequests?.length || 0} return · ${analytics?.paymentPending?.length || 0} payment`,
      color: 'cyan',
      glow: waitingTotal > 0,
      to: '/librarian/pending',
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

  const formattedCurrentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Pending requests for librarian
  const pendingRequests = analytics?.pendingRequests || [];
  const returnRequests = analytics?.returnRequests || [];
  const paymentPending = analytics?.paymentPending || [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-14">
        <PageHeader
          title="Librarian Dashboard"
          subtitle="Welcome back! Here's what's happening today."
          actions={<span className="text-xs font-medium text-slate-400">{formattedCurrentDate}</span>}
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

        {/* Quick Actions Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setShowIssueModal(true)}
            className="bg-card rounded-3xl border border-border p-6 shadow-card transition hover:-translate-y-0.5 hover:border-indigo-500/30 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
                📤
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Issue Book</h3>
                <p className="text-xs text-slate-400 mt-0.5">Issue a book to a student</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowReturnModal(true)}
            className="bg-card rounded-3xl border border-border p-6 shadow-card transition hover:-translate-y-0.5 hover:border-indigo-500/30 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl">
                📥
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Return Book</h3>
                <p className="text-xs text-slate-400 mt-0.5">Process a book return</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-card rounded-3xl border border-border p-6 shadow-card transition hover:-translate-y-0.5 hover:border-indigo-500/30 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <h3 className="font-bold text-slate-100">Export</h3>
                <p className="text-xs text-slate-400 mt-0.5">Download CSV report</p>
              </div>
            </div>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-slate-100 text-lg mb-4">Pending Requests</h3>
                <div className="space-y-3">
                  {pendingRequests.slice(0, 5).map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-900/30 border border-slate-800/40"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-300 font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {req.userId?.name?.substring(0, 2).toUpperCase() || 'ST'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">
                            {req.userId?.name || 'Student'} - {req.bookId?.title || 'Book'}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{req.userId?.email || ''}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req._id)}
                          disabled={approvingId === req._id}
                          className="px-3 py-1.5 text-xs font-semibold btn-success disabled:opacity-50"
                        >
                          {approvingId === req._id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          disabled={rejectingId === req._id}
                          className="px-3 py-1.5 text-xs font-semibold btn-danger disabled:opacity-50"
                        >
                          {rejectingId === req._id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Return Requests - Awaiting Librarian Approval */}
            {returnRequests.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-slate-100 text-lg mb-4">Return Requests</h3>
                <div className="space-y-3">
                  {returnRequests.slice(0, 5).map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-900/30 border border-slate-800/40"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-300 font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {req.initials || 'RT'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">
                            {req.studentName} - {req.bookTitle}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {req.userEmail || ''} {req.fineAmount > 0 ? `• Fine: ₹${req.fineAmount}` : '• No fine'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApproveReturn(req._id)}
                        disabled={approvingReturnId === req._id}
                        className="px-3 py-1.5 text-xs font-semibold btn-success disabled:opacity-50"
                      >
                        {approvingReturnId === req._id ? 'Approving...' : 'Approve Return'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Pending - Awaiting Librarian Payment Approval */}
            {paymentPending.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-slate-100 text-lg mb-4">Payment Approvals</h3>
                <div className="space-y-3">
                  {paymentPending.slice(0, 5).map((req) => (
                    <div
                      key={req._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-900/30 border border-slate-800/40"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-300 font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {req.initials || 'PY'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">
                            {req.studentName} - {req.bookTitle}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {req.userEmail || ''} • Fine: ₹{req.fineAmount} {req.hasScreenshot ? '• 📎 Screenshot' : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApprovePayment(req._id)}
                        disabled={approvingPaymentId === req._id}
                        className="px-3 py-1.5 text-xs font-semibold btn-success disabled:opacity-50"
                      >
                        {approvingPaymentId === req._id ? 'Approving...' : 'Approve Payment'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Tasks */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-100 text-lg mb-4">Today's Tasks</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Pending Approvals</span>
                    <span className="text-2xl font-bold text-indigo-300">{pendingRequests.length}</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(pendingRequests.length * 20, 100)}%` }}></div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Books Issued Today</span>
                    <span className="text-2xl font-bold text-emerald-300">{analytics?.issuedToday ?? 0}</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2" aria-hidden="true">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${analytics?.issuedBooks ? Math.min(100, Math.round(((analytics?.issuedToday || 0) / analytics.issuedBooks) * 100)) : 0}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">of {analytics?.issuedBooks || 0} books currently on loan</p>
                </div>
              </div>
            </div>

            {/* Books by Category - Donut Chart */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-100 text-lg mb-4">Books by Category</h3>
              <div ref={categoryChartRef} style={{ width: '100%', height: '350px' }} />
            </div>

            {/* Issue vs Return Chart */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-100 text-lg mb-4">Issue vs Return</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-3xl font-bold text-emerald-300 mb-1">{analytics?.issuedBooks || 0}</div>
                  <div className="text-xs text-slate-400">Books Issued</div>
                </div>
                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
                  <div className="text-3xl font-bold text-sky-300 mb-1">{analytics?.returnedBooks || 0}</div>
                  <div className="text-xs text-slate-400">Books Returned</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 1 col */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-100 text-lg mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivities.slice(0, 6).map((activity, idx) => (
                  <div
                    key={activity._id || activity.id || idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-800/40"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-300 font-bold text-xs flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {activity.avatar ? (
                        <img src={activity.avatar} alt={activity.name} className="w-full h-full object-cover" />
                      ) : (
                        activity.initials || activity.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-100 truncate">
                        {activity.name} {activity.action} "{activity.book}"
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{activity.time}</p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                        activity.status === 'Issued'
                          ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                          : activity.status === 'Returned'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}
                    >
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Books */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-100 text-lg mb-4">Top Books</h3>
              <div className="space-y-3">
                {(analytics?.topBooks || []).map((book, idx) => (
                  <div key={book._id || idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-800/40">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-100 truncate">{book.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{book.author}</p>
                      <p className="text-[10px] text-indigo-300 mt-1">{book.count} borrows</p>
                      {book.rating ? (
                        <p className="text-[10px] text-amber-300 mt-0.5">⭐ {book.rating}/5</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
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
            className="modal-amo w-full max-w-md animate-in fade-in zoom-in duration-200"
            style={{
              animation: 'modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <h3 className="text-lg font-bold text-slate-100 mb-4">📚 Issue Book to Student</h3>
            <p className="text-xs text-slate-300 mb-4">
              Enter the student's email or Library ID and the book title.
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
                {submittingIssue ? 'Processing...' : 'Confirm Issue'}
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
            className="modal-amo w-full max-w-md animate-in fade-in zoom-in duration-200"
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
              <div className="relative">
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
                {submittingReturn ? 'Processing...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};