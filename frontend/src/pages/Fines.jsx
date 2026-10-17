import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Button, Badge, EmptyState, PageHeader, Skeleton } from '../components/UI';
import { transactionsAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';

// What the student can do next. Payment is only accepted once a return is requested.
const fineState = (fine) => {
  if (fine.finePaid) return { label: 'Paid', variant: 'success', outstanding: false };
  if (fine.status === 'payment_pending') return { label: 'Verifying payment', variant: 'info', outstanding: false };
  if (fine.status === 'issued') return { label: 'Still growing', variant: 'warning', outstanding: true };
  return { label: 'Unpaid', variant: 'danger', outstanding: true };
};

const FineAction = ({ fine, navigate }) => {
  if (fine.finePaid) return <span className="text-sm font-semibold text-emerald-400">Paid</span>;
  if (fine.status === 'payment_pending') return <span className="text-sm text-slate-400">Awaiting librarian</span>;
  if (fine.status === 'issued') {
    return (
      <Button size="sm" variant="secondary" fullWidth={false} onClick={() => navigate('/student/my-books?tab=issued')}>
        Return book first
      </Button>
    );
  }
  if (fine.status === 'return_requested') {
    return (
      <Button size="sm" fullWidth={false} onClick={() => navigate(`/student/pay-fine/${fine._id}`)}>
        Pay ₹{fine.fineAmount}
      </Button>
    );
  }
  return null;
};

export const Fines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchFines = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await transactionsAPI.getUserTransactions();
      const finesList = (response.data.transactions || [])
        // Server values: live fine only while issued, the frozen fine once a return is requested
        .map((transaction) => ({
          ...transaction,
          fineAmount: Number(transaction.fine ?? transaction.fineAmount) || 0,
          daysLate: Number(transaction.daysLate) || 0,
        }))
        .filter((transaction) => transaction.fineAmount > 0);

      setFines(finesList);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load fines';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const outstanding = fines.reduce((sum, f) => (fineState(f).outstanding ? sum + (Number(f.fineAmount) || 0) : sum), 0);
  const paidTotal = fines.reduce((sum, f) => (f.finePaid ? sum + (Number(f.fineAmount) || 0) : sum), 0);

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="My fines"
          subtitle="Overdue books cost ₹5 per calendar day. Return the book, then pay the fine for a librarian to verify."
        />

        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading fines">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-14 w-full" lines={3} />
          </div>
        ) : error ? (
          <EmptyState
            icon="⚠️"
            title="Couldn't load your fines"
            message={error}
            action={<Button fullWidth={false} onClick={fetchFines}>Try again</Button>}
          />
        ) : fines.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No fines"
            message="You have no overdue fines. Keep returning books on time!"
            action={<Button fullWidth={false} variant="secondary" onClick={() => navigate('/student/my-books')}>View my books</Button>}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card variant="glass" className={outstanding > 0 ? 'border-rose-500/30' : ''}>
                <p className="text-sm text-slate-400">Outstanding</p>
                <p className={`mt-1 font-display text-3xl font-bold ${outstanding > 0 ? 'text-rose-300' : 'text-slate-100'}`}>₹{outstanding}</p>
              </Card>
              <Card variant="glass">
                <p className="text-sm text-slate-400">Paid so far</p>
                <p className="mt-1 font-display text-3xl font-bold text-emerald-300">₹{paidTotal}</p>
              </Card>
            </div>

            {/* Mobile: cards */}
            <ul className="space-y-3 sm:hidden">
              {fines.map((fine) => {
                const state = fineState(fine);
                return (
                  <li key={fine._id}>
                    <Card variant="glass" className="!p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 font-semibold text-slate-100 line-clamp-2">{fine.bookId?.title || 'Unknown book'}</p>
                        <Badge variant={state.variant}>{state.label}</Badge>
                      </div>
                      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <dt className="text-xs text-muted">Due</dt>
                          <dd className="text-slate-200">{formatDate(fine.dueDate)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted">Late</dt>
                          <dd className="text-slate-200">{fine.daysLate} day{fine.daysLate === 1 ? '' : 's'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted">Fine</dt>
                          <dd className="font-semibold text-rose-300">₹{fine.fineAmount}</dd>
                        </div>
                      </dl>
                      <div className="mt-3"><FineAction fine={fine} navigate={navigate} /></div>
                    </Card>
                  </li>
                );
              })}
            </ul>

            {/* Tablet and up: table */}
            <Card variant="glass" className="hidden !p-0 sm:block">
              <div className="overflow-x-auto">
                <table className="table-amo w-full">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left">Book</th>
                      <th scope="col" className="px-6 py-3 text-left">Due date</th>
                      <th scope="col" className="px-6 py-3 text-left">Days late</th>
                      <th scope="col" className="px-6 py-3 text-left">Fine</th>
                      <th scope="col" className="px-6 py-3 text-left">Status</th>
                      <th scope="col" className="px-6 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map((fine) => {
                      const state = fineState(fine);
                      return (
                        <tr key={fine._id}>
                          <td className="px-6 py-4 text-sm font-medium text-slate-100">{fine.bookId?.title || 'Unknown book'}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{formatDate(fine.dueDate)}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{fine.daysLate} day{fine.daysLate === 1 ? '' : 's'}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-rose-300">₹{fine.fineAmount}</td>
                          <td className="px-6 py-4 text-sm"><Badge variant={state.variant}>{state.label}</Badge></td>
                          <td className="px-6 py-4 text-sm"><FineAction fine={fine} navigate={navigate} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
