import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Button, Alert, Badge } from '../components/UI';
import { fineAPI, transactionsAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';

export const PayFine = () => {
  const { fineId } = useParams();
  const navigate = useNavigate();
  const [fineData, setFineData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const screenshotInputRef = useRef(null);

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
      // Use the return workflow's submitPayment endpoint
      const response = await transactionsAPI.submitPayment(fineId, {
        paymentScreenshot: paymentScreenshot || undefined,
      });
      if (response.data.success) {
        setSuccess('Payment submitted! Waiting for librarian verification.');
      } else {
        setError(response.data.message || 'Failed to update payment');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScreenshotChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Same limits as the server: PNG, JPEG or WEBP, at most 3 MB
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Please upload a PNG, JPEG or WEBP image');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Screenshot must be 3 MB or smaller');
      return;
    }

    setUploadingScreenshot(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPaymentScreenshot(reader.result);
      setUploadingScreenshot(false);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
      setUploadingScreenshot(false);
    };
    reader.readAsDataURL(file);
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
            <div className="flex flex-col items-center text-center">
              <div className="mb-6">
                <p className="text-sm text-slate-500 uppercase mb-2">Book</p>
                <h2 className="text-2xl font-semibold text-slate-100">{fineData.bookTitle}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full max-w-2xl">
                <div className="card p-4">
                  <p className="text-sm text-slate-500">Amount Due</p>
                  <p className="text-3xl font-bold text-rose-400">₹{fineData.fineAmount}</p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-slate-500">Due Date</p>
                  <p className="font-medium text-slate-100">{formatDate(fineData.dueDate)}</p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-slate-500">Days Overdue</p>
                  <p className="font-medium text-slate-100">{fineData.daysLate} day{fineData.daysLate === 1 ? '' : 's'}</p>
                </div>
                <div className="card p-4">
                  <p className="text-sm text-slate-500">Payment Ref</p>
                  <Badge variant="warning">{paymentReference}</Badge>
                </div>
              </div>

              <div className="space-y-3 mb-6 w-full max-w-2xl">
                <p className="text-slate-300 font-medium">Follow these instructions to complete payment:</p>
                <ul className="list-disc pl-5 text-slate-400 space-y-2 text-left">
                  <li>Scan the QR code using your mobile banking or UPI app.</li>
                  <li>Confirm payment of ₹{fineData.fineAmount}.</li>
                  <li>Optionally upload a payment screenshot.</li>
                  <li>Click "Submit Payment" once payment is complete.</li>
                </ul>
              </div>

              {/* Optional payment screenshot upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Payment Screenshot (Optional)
                </label>
                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => screenshotInputRef.current?.click()}
                    className="rounded-xl border border-border bg-input px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-indigo-500/30 hover:text-indigo-300 transition-colors"
                  >
                    {uploadingScreenshot ? 'Uploading...' : paymentScreenshot ? 'Change Screenshot' : '📎 Upload Screenshot'}
                  </button>
                  {paymentScreenshot && (
                    <span className="text-xs text-emerald-400 font-medium">✓ Screenshot attached</span>
                  )}
                </div>
              </div>

              <div className="card p-8 mb-6">
                <p className="text-lg font-semibold text-slate-100 mb-4">Scan to Pay</p>
                <div className="flex justify-center">
                  <div className="p-4 rounded-2xl bg-white">
                    <QRCode
                      value={`PAYMENT|REF:${paymentReference}|AMT:${fineData.fineAmount}|BOOK:${fineData.bookTitle}`}
                      size={220}
                      fgColor="#1f2937"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleMarkPaid} variant="success" disabled={loading || !!success}>
                {loading ? 'Processing...' : 'Submit Payment'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};
