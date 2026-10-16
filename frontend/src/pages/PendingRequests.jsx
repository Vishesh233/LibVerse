import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Badge, Button, EmptyState } from '../components/UI';
import { Loader } from '../components/Loader';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/dateUtils';

// One tab per status that needs librarian/admin action
const TABS = [
  { key: 'issue', status: 'pending', label: 'Issue Requests', emptyIcon: '✅', emptyMessage: 'No pending book issue requests' },
  { key: 'return', status: 'return_requested', label: 'Return Requests', emptyIcon: '📚', emptyMessage: 'No books waiting for return approval' },
  { key: 'payment', status: 'payment_pending', label: 'Payment Verification', emptyIcon: '💳', emptyMessage: 'No fine payments waiting for verification' },
];

export const PendingRequests = () => {
  const [activeTab, setActiveTab] = useState('issue');
  const [lists, setLists] = useState({ issue: [], return: [], payment: [] });
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const { isAdmin, isLibrarian } = useAuth();
  const canAccess = isAdmin || isLibrarian;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const responses = await Promise.all(
        TABS.map((tab) => transactionsAPI.getAllTransactions({ status: tab.status, limit: 100 }))
      );
      const next = {};
      TABS.forEach((tab, i) => {
        next[tab.key] = responses[i].data.transactions || [];
      });
      setLists(next);
    } catch (err) {
      console.error('Error fetching requests:', err);
      toast.error(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canAccess) {
      fetchAll();
    }
  }, [canAccess, fetchAll]);

  // Run an approval action, then refresh every list
  const runAction = async (txId, apiCall, successMessage, failureMessage) => {
    setActioningId(txId);
    try {
      await apiCall(txId);
      toast.success(successMessage);
    } catch (err) {
      console.error(failureMessage, err);
      toast.error(err.response?.data?.message || failureMessage);
    } finally {
      setActioningId(null);
      fetchAll();
    }
  };

  const handleApprove = (txId) =>
    runAction(txId, transactionsAPI.approveIssueRequest, 'Request approved successfully.', 'Failed to approve request');
  const handleReject = (txId) =>
    runAction(txId, transactionsAPI.rejectIssueRequest, 'Request rejected successfully.', 'Failed to reject request');
  const handleApproveReturn = (txId) =>
    runAction(txId, transactionsAPI.approveReturn, 'Return approved successfully.', 'Failed to approve return');
  const handleApprovePayment = (txId) =>
    runAction(txId, transactionsAPI.approvePayment, 'Payment approved. Book returned.', 'Failed to approve payment');

  if (!canAccess) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <p className="text-red-600 font-semibold">Access Denied: Librarian/Admin only</p>
        </div>
      </MainLayout>
    );
  }

  const tab = TABS.find((t) => t.key === activeTab);
  const rows = lists[activeTab];

  const renderActions = (tx) => {
    const busy = actioningId === tx._id;
    if (activeTab === 'issue') {
      return (
        <>
          <Button onClick={() => handleApprove(tx._id)} variant="success" disabled={busy} className="text-xs px-3 py-1">
            {busy ? 'Working...' : '✅ Approve'}
          </Button>
          <Button onClick={() => handleReject(tx._id)} variant="danger" disabled={busy} className="text-xs px-3 py-1">
            ❌ Reject
          </Button>
        </>
      );
    }
    if (activeTab === 'return') {
      const waitingForFine = tx.fineAmount > 0 && !tx.finePaid;
      return (
        <Button
          onClick={() => handleApproveReturn(tx._id)}
          variant="success"
          disabled={busy || waitingForFine}
          className="text-xs px-3 py-1"
        >
          {waitingForFine ? 'Waiting for fine payment' : busy ? 'Working...' : '✅ Approve Return'}
        </Button>
      );
    }
    return (
      <Button onClick={() => handleApprovePayment(tx._id)} variant="success" disabled={busy} className="text-xs px-3 py-1">
        {busy ? 'Working...' : '✅ Approve Payment'}
      </Button>
    );
  };

  const renderDetails = (tx) => {
    if (activeTab === 'issue') {
      return <Badge variant="warning">Pending</Badge>;
    }
    if (activeTab === 'return') {
      return tx.fineAmount > 0 ? (
        <span className="space-x-2">
          <span className="text-slate-100 font-semibold">₹{tx.fineAmount}</span>
          <Badge variant={tx.finePaid ? 'success' : 'danger'}>{tx.finePaid ? 'Paid' : 'Unpaid'}</Badge>
        </span>
      ) : (
        <Badge variant="success">No fine</Badge>
      );
    }
    return (
      <span className="space-x-2">
        <span className="text-slate-100 font-semibold">₹{tx.fineAmount || 0}</span>
        <Badge variant={tx.paymentScreenshot ? 'primary' : 'neutral'}>
          {tx.paymentScreenshot ? 'Screenshot uploaded' : 'No screenshot'}
        </Badge>
      </span>
    );
  };

  const dateFor = (tx) =>
    activeTab === 'issue' ? tx.createdAt : activeTab === 'return' ? tx.returnRequestedAt || tx.updatedAt : tx.paymentSubmittedAt || tx.updatedAt;

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">⏳ Requests</h1>
          <p className="text-slate-400 mt-1">Review issue requests, returns and fine payments from students.</p>
        </div>

        {/* Tabs with counts */}
        <div className="mb-6 flex flex-wrap items-center gap-1 rounded-xl border border-border bg-input p-1 w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === t.key
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
              <span className="ml-2 text-xs font-bold text-amber-400">{lists[t.key].length}</span>
            </button>
          ))}
        </div>

        <Card>
          {loading ? (
            <Loader />
          ) : rows.length === 0 ? (
            <EmptyState icon={tab.emptyIcon} title="All Caught Up!" message={tab.emptyMessage} />
          ) : (
            <div className="overflow-x-auto">
              <table className="table-amo w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left">Student</th>
                    <th className="px-6 py-3 text-left">Book Title</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">{activeTab === 'issue' ? 'Status' : 'Fine'}</th>
                    <th className="px-6 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((tx) => (
                    <tr key={tx._id} className="border-b border-border hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-100">
                        {tx.userId?.name || 'Unknown'}
                        {tx.userId?.libraryId && <p className="text-[11px] text-slate-500">{tx.userId.libraryId}</p>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">{tx.bookId?.title || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{formatDate(dateFor(tx))}</td>
                      <td className="px-6 py-4 text-sm">{renderDetails(tx)}</td>
                      <td className="px-6 py-4 text-sm space-x-2">{renderActions(tx)}</td>
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
