import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';
import { MainLayout } from '../layouts/MainLayout';
import { Card, Button, Alert, Badge, EmptyState, PageHeader, Skeleton } from '../components/UI';
import { fineAPI, transactionsAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const FINE_PER_DAY = 5;

const Stat = ({ label, children }) => (
  <div className="rounded-2xl border border-border bg-input/60 p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
    <div className="mt-1.5">{children}</div>
  </div>
);

export const PayFine = () => {
  const { fineId } = useParams();
  const navigate = useNavigate();
  const [fineData, setFineData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(true);
  const [success, setSuccess] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const screenshotInputRef = useRef(null);

  useEffect(() => {
    if (!fineId) return;
    const loadPayment = async () => {
      setInitialising(true);
      try {
        const response = await fineAPI.initiatePayment(fineId);
        if (response.data.success) {
          setFineData(response.data.transaction);
          setPaymentReference(response.data.paymentReference);
        } else {
          setError(response.data.message || 'Unable to initialize payment');
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Unable to load fine payment';
        setError(message);
        toast.error(message);
      } finally {
        setInitialising(false);
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
    setError(null);
    try {
      // Use the return workflow's submitPayment endpoint
      const response = await transactionsAPI.submitPayment(fineId, {
        paymentScreenshot: paymentScreenshot || undefined,
      });
      if (response.data.success) {
        setSuccess('Payment submitted! Waiting for librarian verification.');
        toast.success('Payment submitted for verification');
      } else {
        setError(response.data.message || 'Failed to update payment');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Payment failed';
      setError(message);
      toast.error(message);
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

  const removeScreenshot = () => {
    setPaymentScreenshot('');
    if (screenshotInputRef.current) screenshotInputRef.current.value = '';
  };

  // The server only reports days late while the book is still issued; after a return
  // request the fine is fixed, so derive the days from it (₹5 per calendar day).
  const daysLate = fineData
    ? fineData.daysLate || Math.round((Number(fineData.fineAmount) || 0) / FINE_PER_DAY)
    : 0;

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Pay fine"
          subtitle="Scan the QR code to pay, then submit so a librarian can verify it."
          actions={<Button fullWidth={false} variant="ghost" onClick={() => navigate('/student/fines')}>← Back to fines</Button>}
        />

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {success && <Alert type="success" message={`${success} Taking you back to your fines...`} />}

        {initialising ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]" aria-busy="true" aria-label="Loading payment details">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : !fineData ? (
          <EmptyState
            icon="💳"
            title="Nothing to pay here"
            message={error || 'This fine could not be loaded.'}
            action={<Button fullWidth={false} variant="secondary" onClick={() => navigate('/student/fines')}>Back to fines</Button>}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <Card variant="glass" className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Book</p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-slate-50">{fineData.bookTitle}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Stat label="Amount due">
                  <p className="font-display text-3xl font-bold text-rose-300">₹{fineData.fineAmount}</p>
                </Stat>
                <Stat label="Days overdue">
                  <p className="text-lg font-semibold text-slate-100">{daysLate} day{daysLate === 1 ? '' : 's'}</p>
                </Stat>
                <Stat label="Due date">
                  <p className="font-medium text-slate-100">{formatDate(fineData.dueDate)}</p>
                </Stat>
                <Stat label="Payment ref">
                  <Badge variant="warning" className="break-all">{paymentReference}</Badge>
                </Stat>
              </div>

              <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
                <li>Scan the QR code with your mobile banking or UPI app.</li>
                <li>Pay exactly ₹{fineData.fineAmount}.</li>
                <li>Optionally attach a screenshot of the payment.</li>
                <li>Press <span className="font-semibold text-slate-100">Submit payment</span>.</li>
              </ol>

              {/* Optional payment screenshot upload */}
              <div>
                <p className="field-label">Payment screenshot (optional)</p>
                <input
                  ref={screenshotInputRef}
                  id="payment-screenshot"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleScreenshotChange}
                  className="sr-only"
                />
                {paymentScreenshot ? (
                  <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <img src={paymentScreenshot} alt="Attached payment screenshot" className="h-16 w-16 flex-shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-emerald-300">Screenshot attached</p>
                      <p className="text-xs text-slate-400">PNG, JPEG or WEBP, up to 3 MB</p>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row">
                      <Button size="sm" variant="ghost" fullWidth={false} onClick={() => screenshotInputRef.current?.click()} disabled={!!success}>Change</Button>
                      <Button size="sm" variant="ghost" fullWidth={false} onClick={removeScreenshot} disabled={!!success}>Remove</Button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="payment-screenshot"
                    className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-input/40 p-4 text-center transition-colors hover:border-indigo-500/40 focus-within:border-cyan-400/60"
                  >
                    <span className="text-sm font-medium text-slate-200">{uploadingScreenshot ? 'Reading image...' : 'Choose a screenshot'}</span>
                    <span className="text-xs text-muted">PNG, JPEG or WEBP, up to 3 MB</span>
                  </label>
                )}
              </div>

              <Button onClick={handleMarkPaid} variant="success" size="lg" loading={loading} disabled={!!success || uploadingScreenshot}>
                {loading ? 'Submitting...' : success ? 'Submitted' : 'Submit payment'}
              </Button>
            </Card>

            <Card variant="glass" className="flex flex-col items-center text-center lg:self-start">
              <p className="font-semibold text-slate-100">Scan to pay</p>
              <p className="mt-1 text-xs text-slate-400">Simulated payment code</p>
              <div className="mt-4 rounded-2xl bg-white p-4">
                <QRCode
                  value={`PAYMENT|REF:${paymentReference}|AMT:${fineData.fineAmount}|BOOK:${fineData.bookTitle}`}
                  size={200}
                  fgColor="#1f2937"
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                />
              </div>
              <p className="mt-4 font-display text-2xl font-bold text-slate-50">₹{fineData.fineAmount}</p>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
