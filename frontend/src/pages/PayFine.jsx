import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Button, Alert, Badge } from '../components/UI';
import { fineAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';

export const PayFine = () => {
  const { fineId } = useParams();
  const navigate = useNavigate();
  const [fineData, setFineData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    if (!fineId) return;
    const loadPayment = async () => {
      setLoading(true);
      try {
        const response = await fineAPI.initiatePayment(fineId);
        if (response.data.success) {
          setFineData(response.data.transaction);
          setPaymentReference(response.data.paymentReference);
        } else {
          setError(response.data.message || 'Unable to initialize payment');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Unable to load fine payment');
      } finally {
        setLoading(false);
      }
    };
    loadPayment();
  }, [fineId]);

  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => navigate('/student/fines'), 3000);
    }
    return () => clearTimeout(timer);
  }, [success, navigate]);

  const handleMarkPaid = async () => {
    if (!fineId) return;
    setLoading(true);
    try {
      const response = await fineAPI.payFine(fineId);
      if (response.data.success) {
        setSuccess(`Payment Successful! Fine of ₹${response.data.fineAmount} cleared.`);
      } else {
        setError(response.data.message || 'Failed to update payment');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !fineData && !success) {
    return (
      <MainLayout>
        <div className="text-center py-16 text-slate-400">Loading payment details...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">💳 Pay Fine</h1>
          <p className="mt-1 text-slate-400">
            Complete the simulated payment to clear your outstanding fine.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

        {fineData && (
          <Card>
            <div className="grid gap-6 lg:grid-cols-[1fr_280px] items-start">
              <div>
                <div className="mb-6">
                  <p className="text-sm text-slate-500 uppercase">Book</p>
                  <h2 className="text-2xl font-semibold text-slate-100">{fineData.bookTitle}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-slate-500">Amount Due</p>
                    <p className="text-2xl font-bold text-rose-400">₹{fineData.fineAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Due Date</p>
                    <p className="font-medium text-slate-100">{formatDate(fineData.dueDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Days Overdue</p>
                    <p className="font-medium text-slate-100">{fineData.daysLate} day{fineData.daysLate === 1 ? '' : 's'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Payment Ref</p>
                    <Badge variant="warning">{paymentReference}</Badge>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-slate-300">Follow these instructions to complete payment:</p>
                  <ul className="list-disc pl-5 text-slate-400 space-y-2">
                    <li>Scan the QR code using your mobile banking or UPI app.</li>
                    <li>Confirm payment of ₹{fineData.fineAmount}.</li>
                    <li>Click "Mark as Paid" once payment is complete.</li>
                  </ul>
                </div>

                <Button onClick={handleMarkPaid} variant="success" disabled={loading || !!success}>
                  {loading ? 'Processing...' : 'Mark as Paid'}
                </Button>
              </div>

              <div className="card p-6 text-center">
                <p className="text-sm text-slate-300 mb-4">Scan to pay</p>
                <div className="mx-auto w-56 h-56 card p-4 rounded-3xl shadow-card bg-white">
                  <QRCode
                    value={`PAYMENT|REF:${paymentReference}|AMT:${fineData.fineAmount}|BOOK:${fineData.bookTitle}`}
                    size={220}
                    fgColor="#1f2937"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
