import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import { reservationsAPI, transactionsAPI } from '../services/api';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Badge, Button, EmptyState, PageHeader } from '../components/UI';
import { Loader } from '../components/Loader';
import { ReservationQueues } from '../components/ReservationQueues';
import { WaiveFineModal, waiverLoanFrom } from '../components/WaiveFineModal';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/dateUtils';

// One tab per status that needs librarian/admin action
const TABS = [
  { key: 'issue', status: 'pending', label: 'Issue Requests', emptyIcon: '✅', emptyMessage: 'No pending book issue requests' },
  { key: 'return', status: 'return_requested', label: 'Return Requests', emptyIcon: '📚', emptyMessage: 'No books waiting for return approval' },
  { key: 'payment', status: 'payment_pending', label: 'Payment Verification', emptyIcon: '💳', emptyMessage: 'No fine payments waiting for verification' },
];
// Waiting lists per book (its own component and data source)
const RESERVATIONS_TAB = { key: 'reservations', label: 'Reservations' };
const ALL_TABS = [...TABS, RESERVATIONS_TAB];

export const PendingRequests = () => {
  // ?tab=issue|return|payment|reservations (notification links open the matching tab)
  const [searchParams] = useSearchParams();
  const linkedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() => (ALL_TABS.some((t) => t.key === linkedTab) ? linkedTab : 'issue'));
  useEffect(() => {
    if (ALL_TABS.some((t) => t.key === linkedTab)) setActiveTab(linkedTab);
  }, [linkedTab]);
  const [lists, setLists] = useState({ issue: [], return: [], payment: [] });
  const [activeReservations, setActiveReservations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [screenshot, setScreenshot] = useState(null); // { loading, src } while the viewer is open
  const [waiving, setWaiving] = useState(null); // loan whose fine is being waived
  const { isAdmin, isLibrarian } = useAuth();
  const canAccess = isAdmin || isLibrarian;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Active (waiting + held) reservations, for the tab count
  const fetchReservationCount = useCallback(async () => {
    try {
      const res = await reservationsAPI.getAll({ status: 'active', limit: 1 });
      setActiveReservations(Number(res.data.total) || 0);
    } catch {
      // the count is optional; the tab still loads its own list
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    fetchReservationCount();
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
  }, [fetchReservationCount]);

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

  // Screenshots are not part of the list response; load one on demand
  const handleViewScreenshot = async (txId) => {
    setScreenshot({ loading: true, src: null });
    try {
      const res = await transactionsAPI.getPaymentScreenshot(txId);
      setScreenshot({ loading: false, src: res.data.paymentScreenshot });
    } catch (err) {
      setScreenshot(null);
      toast.error(err.response?.data?.message || 'Failed to load screenshot');
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

  const tab = TABS.find((t) => t.key === activeTab);
  const rows = lists[activeTab] || [];

  // Still owed after any waiver (the server sends payableFine; older rows fall back to the stored fine)
  const payableOf = (tx) => Number(tx.payableFine ?? (tx.finePaid ? 0 : tx.fineAmount)) || 0;
  const waiveButton = (tx) =>
    payableOf(tx) > 0 ? (
      <Button onClick={() => setWaiving(waiverLoanFrom(tx))} variant="secondary" fullWidth={false} className="text-xs px-3 py-1">
        Waive fine
      </Button>
    ) : null;

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
      const waitingForFine = payableOf(tx) > 0;
      return (
        <span className="inline-flex flex-wrap gap-2">
          <Button
            onClick={() => handleApproveReturn(tx._id)}
            variant="success"
            fullWidth={false}
            disabled={busy || waitingForFine}
            className="text-xs px-3 py-1"
          >
            {waitingForFine ? 'Waiting for fine payment' : busy ? 'Working...' : '✅ Approve Return'}
          </Button>
          {waiveButton(tx)}
        </span>
      );
    }
    return (
      <span className="inline-flex flex-wrap gap-2">
        <Button onClick={() => handleApprovePayment(tx._id)} variant="success" fullWidth={false} disabled={busy} className="text-xs px-3 py-1">
          {busy ? 'Working...' : '✅ Approve Payment'}
        </Button>
        {waiveButton(tx)}
      </span>
    );
  };

  const renderDetails = (tx) => {
    if (activeTab === 'issue') {
      return <Badge variant="warning">Pending</Badge>;
    }
    const waived = Number(tx.fineWaived) || 0;
    const waivedNote = waived > 0 ? <span className="block text-[11px] text-pink-300">₹{waived} waived of ₹{tx.fineAmount}</span> : null;
    if (activeTab === 'return') {
      if (!(tx.fineAmount > 0)) return <Badge variant="success">No fine</Badge>;
      const payable = payableOf(tx);
      return (
        <span className="inline-flex flex-col gap-1">
          <span className="space-x-2">
            <span className="text-slate-100 font-semibold">₹{tx.finePaid ? tx.fineAmount - waived : payable}</span>
            <Badge variant={tx.finePaid ? 'success' : payable > 0 ? 'danger' : 'info'}>
              {tx.finePaid ? 'Paid' : payable > 0 ? 'Unpaid' : 'Waived'}
            </Badge>
          </span>
          {waivedNote}
        </span>
      );
    }
    return (
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-slate-100 font-semibold">₹{payableOf(tx)}</span>
        {waivedNote}
        <Badge variant={tx.hasScreenshot ? 'primary' : 'neutral'}>
          {tx.hasScreenshot ? 'Screenshot uploaded' : 'No screenshot'}
        </Badge>
        {tx.hasScreenshot && (
          <Button onClick={() => handleViewScreenshot(tx._id)} variant="secondary" className="text-xs px-3 py-1">
            🖼️ View screenshot
          </Button>
        )}
      </span>
    );
  };

  const dateFor = (tx) =>
    activeTab === 'issue' ? tx.createdAt : activeTab === 'return' ? tx.returnRequestedAt || tx.updatedAt : tx.paymentSubmittedAt || tx.updatedAt;

  return (
    <MainLayout>
      {/* <main> already pads the page; no second padding layer here */}
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Requests" subtitle="Review issue requests, returns, fine payments and reservation queues." />

        {/* Tabs with counts */}
        <div className="mb-6 flex flex-wrap items-center gap-1 rounded-xl border border-border bg-input p-1 w-fit">
          {ALL_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              aria-pressed={activeTab === t.key}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === t.key
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
              <span className="ml-2 text-xs font-bold text-amber-400">
                {t.key === RESERVATIONS_TAB.key ? activeReservations : lists[t.key].length}
              </span>
            </button>
          ))}
        </div>

        {activeTab === RESERVATIONS_TAB.key ? (
          <ReservationQueues onChanged={fetchReservationCount} />
        ) : (
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
        )}
      </div>

      {waiving && <WaiveFineModal loan={waiving} onClose={() => setWaiving(null)} onWaived={fetchAll} />}

      {/* Payment screenshot viewer */}
      {screenshot && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4" onClick={() => setScreenshot(null)}>
          <div className="modal-amo w-full max-w-2xl animate-scale-in relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-100">Payment screenshot</h3>
              <Button onClick={() => setScreenshot(null)} variant="secondary" className="text-xs px-3 py-1">
                Close
              </Button>
            </div>
            {screenshot.loading ? (
              <Loader />
            ) : (
              <img src={screenshot.src} alt="Payment screenshot" className="max-h-[70vh] w-full object-contain rounded-xl" />
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
};
