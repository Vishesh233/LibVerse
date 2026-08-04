import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Button, Badge, EmptyState, Alert } from '../components/UI';
import { transactionsAPI } from '../services/api';
import { calculateFine, isOverdue } from '../utils/fineCalculator';
import { formatDate } from '../utils/dateUtils';

const getDaysLate = (transaction) => {
  if (transaction.returnDate) {
    const due = new Date(transaction.dueDate);
    const returned = new Date(transaction.returnDate);
    return Math.max(0, Math.ceil((returned - due) / (1000 * 60 * 60 * 24)));
  }

  if (isOverdue(transaction.dueDate)) {
    return Math.max(1, Math.ceil((new Date() - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24)));
  }

  return 0;
};

export const Fines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchFines();
  }, []);

  const fetchFines = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await transactionsAPI.getUserTransactions();
      const finesList = response.data.transactions
        .map((transaction) => {
          const fineAmount = transaction.status === 'issued'
            ? calculateFine(transaction.dueDate)
            : transaction.fineAmount;

          return {
            ...transaction,
            fineAmount,
            daysLate: getDaysLate(transaction),
            statusLabel: transaction.finePaid ? 'Paid' : 'Unpaid',
          };
        })
        .filter((transaction) => transaction.fineAmount > 0);

      setFines(finesList);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="animate-fade-in-up mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">💰 My Fines</h1>
          <p className="mt-1 text-slate-400">
            Track all overdue fines and payment status for your borrowed books.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading fines...</div>
        ) : fines.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No fines due"
            message="Great job! No overdue fines are pending at the moment."
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="table-amo w-full min-w-[720px]">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left">Book</th>
                    <th className="px-6 py-3 text-left">Due Date</th>
                    <th className="px-6 py-3 text-left">Days Late</th>
                    <th className="px-6 py-3 text-left">Fine</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.map((fine) => (
                    <tr key={fine._id}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-100">{fine.bookId?.title || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(fine.dueDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {fine.daysLate} day{fine.daysLate === 1 ? '' : 's'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-rose-400">₹{fine.fineAmount}</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant={fine.statusLabel === 'Paid' ? 'success' : 'danger'}>{fine.statusLabel}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {!fine.finePaid && (
                          <Button
                            onClick={() => navigate(`/pay-fine/${fine._id}`)}
                            variant="secondary"
                            className="text-xs px-3 py-1"
                          >
                            Pay Fine
                          </Button>
                        )}
                        {fine.finePaid && (
                          <span className="text-sm text-emerald-400 font-semibold">Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};