import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Badge, Button, EmptyState, Alert } from '../components/UI';
import { Loader } from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/dateUtils';

export const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const { isAdmin, isLibrarian } = useAuth();
  const canAccess = isAdmin || isLibrarian;
  const pageTitle = isLibrarian ? 'Librarian Pending Requests' : 'Pending Requests';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (canAccess) {
      fetchPendingRequests();
    }
  }, [canAccess]);

  // Auto-clear alerts after 4 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await transactionsAPI.getAllTransactions({ status: 'pending' });
      setRequests(response.data.transactions || []);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError(err.response?.data?.message || 'Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, bookTitle, studentName) => {
    setApprovingId(requestId);
    setError(null);
    setSuccess(null);

    try {
      await transactionsAPI.approveIssueRequest(requestId);
      const message = 'Request approved successfully.';
      setSuccess(message);
      toast.success(message);
      fetchPendingRequests();
    } catch (err) {
      console.error('Error approving request:', err);
      const message = err.response?.data?.message || 'Failed to approve request';
      setError(message);
      toast.error(message);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (requestId, bookTitle, studentName) => {
    setApprovingId(requestId);
    setError(null);
    setSuccess(null);

    try {
      await transactionsAPI.rejectIssueRequest(requestId);
      const message = 'Request rejected successfully.';
      setSuccess(message);
      toast.success(message);
      fetchPendingRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      const message = err.response?.data?.message || 'Failed to reject request';
      setError(message);
      toast.error(message);
    } finally {
      setApprovingId(null);
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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">⏳ {pageTitle}</h1>
          <p className="text-slate-400 mt-1">Review and approve book issue requests from students.</p>
        </div>

        {/* Alerts */}
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Stats Card */}
        <Card className="mb-6">
          <div className="text-center">
            <h3 className="text-slate-400 text-sm font-semibold mb-2">Pending Requests</h3>
            <p className="text-4xl font-bold text-amber-400">{requests.length}</p>
          </div>
        </Card>

        {/* Requests Table */}
        <Card>
          {loading ? (
            <Loader />
          ) : requests.length === 0 ? (
            <EmptyState
              icon="✅"
              title="All Caught Up!"
              message="No pending book issue requests"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table-amo w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left">Student Name</th>
                    <th className="px-6 py-3 text-left">Book Title</th>
                    <th className="px-6 py-3 text-left">Request Date</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr
                      key={req._id}
                      className="border-b border-border hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-100">
                        {req.userId?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {req.bookId?.title || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(req.requestDate || req.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="warning">Pending</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <Button
                          onClick={() =>
                            handleApprove(req._id, req.bookId?.title, req.userId?.name)
                          }
                          variant="success"
                          disabled={approvingId === req._id}
                          className="text-xs px-3 py-1"
                        >
                          {approvingId === req._id ? 'Approving...' : '✅ Approve'}
                        </Button>
                        <Button
                          onClick={() =>
                            handleReject(req._id, req.bookId?.title, req.userId?.name)
                          }
                          variant="danger"
                          disabled={approvingId === req._id}
                          className="text-xs px-3 py-1"
                        >
                          {approvingId === req._id ? 'Rejecting...' : '❌ Reject'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};
