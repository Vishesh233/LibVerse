import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI, transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Badge, EmptyState, Alert } from '../components/UI';
import { Loader } from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/dateUtils';

export const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin, isLibrarian } = useAuth();
  const canAccess = isAdmin || isLibrarian;
  const pageTitle = isLibrarian ? 'Librarian Analytics & Insights' : 'Admin Analytics & Insights';

  const mostIssuedBooks = useMemo(() => {
    const source = analytics?.mostIssuedBooks || analytics?.topBooks || [];

    return source.map((item) => {
      const bookData = Array.isArray(item.book) ? item.book[0] : item.book;
      const title = item.title || bookData?.title || item.bookTitle || 'Unknown';
      const author = item.author || bookData?.author || item.bookAuthor || 'Unknown Author';
      const count = item.count ?? item.issuedCount ?? item.timesBorrowed ?? 0;

      return { title, author, count };
    });
  }, [analytics]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (canAccess) {
      fetchAnalytics();
    }
  }, [canAccess]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardRes = await adminAPI.getDashboard();
      setAnalytics(dashboardRes.data.analytics);

      const transRes = await transactionsAPI.getAllTransactions({ limit: 10, page: 1 });
      setRecentTransactions(transRes.data.transactions || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!canAccess) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <p className="text-red-600 font-semibold">Access Denied: Librarian/Admin only</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">📈 {pageTitle}</h1>
          <p className="text-slate-400 mt-1">System statistics and activity overview for librarians and admins.</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        {loading ? (
          <Loader />
        ) : analytics ? (
          <>
            {/* Key Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <div className="text-center">
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">
                    👥 Total Users
                  </h3>
                  <p className="text-3xl font-bold text-blue-400">
                    {analytics.totalUsers}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">
                    📚 Total Books
                  </h3>
                  <p className="text-3xl font-bold text-emerald-400">
                    {analytics.totalBooks}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">
                    📖 Books Issued
                  </h3>
                  <p className="text-3xl font-bold text-amber-400">
                    {analytics.issuedBooks}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">
                    ⚠️ Overdue Books
                  </h3>
                  <p className="text-3xl font-bold text-rose-400">
                    {analytics.overdueBooks}
                  </p>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <h3 className="text-slate-400 text-sm font-semibold mb-2">
                    💰 Total Fines
                  </h3>
                  <p className="text-3xl font-bold text-violet-400">
                    ₹{analytics.totalFines}
                  </p>
                </div>
              </Card>
            </div>

            {/* Most Issued Books */}
            <Card>
              <h2 className="text-xl font-bold mb-4 text-slate-100">
                🏆 Most Issued Books
              </h2>
              {mostIssuedBooks.length > 0 ? (
                <div className="space-y-3">
                  {mostIssuedBooks.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="flex justify-between items-center p-4 bg-input border border-border rounded-xl hover:border-indigo-500/30 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-slate-600">#{index + 1}</span>
                          <div>
                            <p className="font-semibold text-slate-100">
                              {item.title}
                            </p>
                            <p className="text-sm text-slate-400">
                              {item.author}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Badge variant="primary">{item.count} issued</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📚"
                  title="No books borrowed yet"
                  message="The most borrowed books appear here once loans are approved."
                />
              )}
            </Card>

            {/* Recent Activity */}
            <Card>
              <h2 className="text-xl font-bold mb-4 text-slate-100">
                📋 Recent Activity
              </h2>
              {recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table-amo w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">User</th>
                        <th className="px-4 py-2 text-left">Book</th>
                        <th className="px-4 py-2 text-left">Action</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((tx) => (
                        <tr
                          key={tx._id}
                          className="border-b border-border hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-4 py-2 text-slate-300">{tx.userId?.name || 'Unknown'}</td>
                          <td className="px-4 py-2 text-slate-300">{tx.bookId?.title || 'Unknown'}</td>
                          <td className="px-4 py-2 text-slate-400">
                            {tx.status === 'issued'
                              ? 'Issued'
                              : tx.status === 'returned'
                              ? 'Returned'
                              : 'Pending'}
                          </td>
                          <td className="px-4 py-2 text-slate-400">
                            {formatDate(tx.issueDate || tx.createdAt)}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant={
                                tx.status === 'issued'
                                  ? 'success'
                                  : tx.status === 'returned'
                                  ? 'primary'
                                  : 'warning'
                              }
                            >
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState icon="📋" title="No Activity" message="No recent transactions" />
              )}
            </Card>
          </>
        ) : (
          <EmptyState icon="📊" title="No Data" message="Unable to load analytics" />
        )}
      </div>
    </MainLayout>
  );
};
