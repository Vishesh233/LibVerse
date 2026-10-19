import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { LogoMark } from '../components/LogoMark';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 60;

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/** Text field in the sign-in style: label, icon, error below */
const Field = ({ id, label, error, icon, ...input }) => (
  <div>
    <label htmlFor={id} className="field-label">{label}</label>
    <div className="relative">
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="login-input"
        {...input}
      />
      <div className="login-input-icon">{icon}</div>
    </div>
    {error && <p id={`${id}-error`} className="field-error">{error}</p>}
  </div>
);

const SubmitButton = ({ busy, busyText, children }) => (
  <button type="submit" disabled={busy} className="login-button">
    {busy ? (
      <span className="flex items-center justify-center gap-2"><span className="login-spinner" />{busyText}</span>
    ) : children}
  </button>
);

/**
 * Forgot password: email -> 6-digit code by email -> new password. Shown only when the server can
 * send email; otherwise it says to ask a librarian or admin (the same as the sign-in page).
 */
export const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [enabled, setEnabled] = useState(null); // null while checking
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(typeof location.state?.email === 'string' ? location.state.email : '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    authAPI.getPasswordResetStatus()
      .then((r) => setEnabled(Boolean(r.data?.enabled)))
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendCode = async () => {
    setBusy(true);
    setFormError('');
    try {
      await authAPI.forgotPassword(email.trim());
      setStep('code');
      setResendIn(RESEND_SECONDS);
      setCode('');
    } catch (err) {
      if (err.response?.status === 503) setEnabled(false);
      else setFormError(err.response?.data?.message || 'The code could not be sent. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = (e) => {
    e.preventDefault();
    const next = {};
    if (!email.trim()) next.email = 'Enter your email address';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address';
    setErrors(next);
    if (!Object.keys(next).length) sendCode();
  };

  const submitReset = async (e) => {
    e.preventDefault();
    const next = {};
    if (!/^\d{6}$/.test(code.trim())) next.code = 'Enter the 6-digit code from the email';
    if (password.length < 6) next.password = 'Use at least 6 characters';
    if (confirm !== password) next.confirm = 'The passwords don’t match';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setFormError('');
    try {
      await authAPI.resetPassword({ email: email.trim(), code: code.trim(), newPassword: password });
      toast.success('Password updated. Sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.message || 'The password could not be reset. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-background">
      <div className="login-bg-gradient login-bg-gradient-1" />
      <div className="login-bg-gradient login-bg-gradient-2" />
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="auth-scroll">
        <div className="auth-center">
          <main className="login-card auth-card">
            <div className="auth-brand text-center">
              <div className="auth-logo">
                <LogoMark size="lg" className="auth-logo-lg" />
                <LogoMark size="md" className="auth-logo-md" />
              </div>
              <p className="brand-wordmark auth-wordmark font-bold" aria-hidden="true">
                Lib<span className="brand-wordmark-accent">Verse</span>
              </p>
            </div>

            <div className="auth-welcome">
              <h1 className="auth-heading font-display font-bold text-white">Reset your password</h1>
              <p className="text-sm text-slate-400">
                {enabled === false
                  ? 'Password reset by email isn’t available here.'
                  : step === 'email'
                    ? 'Enter your account email and we’ll send you a 6-digit code.'
                    : 'Check your inbox for the code, then choose a new password.'}
              </p>
            </div>

            {formError && (
              <div role="alert" className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">{formError}</div>
            )}

            {enabled === null ? (
              <div className="flex justify-center py-6" role="status" aria-label="Loading"><span className="login-spinner" /></div>
            ) : enabled === false ? (
              <div className="space-y-4">
                <p className="rounded-xl border border-border bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-300">
                  Ask your librarian or admin to reset your password. They can set a temporary one for you from the Users page.
                </p>
                <Link to="/login" className="login-button flex items-center justify-center">Back to sign in</Link>
              </div>
            ) : step === 'email' ? (
              <form onSubmit={submitEmail} noValidate className="auth-form">
                <Field
                  id="reset-email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="you@example.com"
                  error={errors.email}
                  icon={<MailIcon />}
                />
                <SubmitButton busy={busy} busyText="Sending…">Send code</SubmitButton>
              </form>
            ) : (
              <form onSubmit={submitReset} noValidate className="auth-form">
                <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.07] p-3 text-sm text-emerald-100" role="status">
                  If an account uses <span className="font-semibold break-all">{email.trim()}</span>, a code is on its way. It expires in 10 minutes.
                </p>
                <Field
                  id="reset-code"
                  label="6-digit code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrors((p) => ({ ...p, code: undefined })); }}
                  placeholder="123456"
                  error={errors.code}
                  icon={<LockIcon />}
                  style={{ letterSpacing: '0.3em', fontVariantNumeric: 'tabular-nums' }}
                />
                <Field
                  id="reset-password"
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder="At least 6 characters"
                  error={errors.password}
                  icon={<LockIcon />}
                />
                <Field
                  id="reset-confirm"
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })); }}
                  placeholder="Type it again"
                  error={errors.confirm}
                  icon={<LockIcon />}
                />
                <SubmitButton busy={busy} busyText="Saving…">Set new password</SubmitButton>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <button type="button" className="text-slate-400 hover:text-white" onClick={() => { setStep('email'); setFormError(''); }}>
                    Use another email
                  </button>
                  <button
                    type="button"
                    className="font-medium text-indigo-300 hover:text-white disabled:cursor-not-allowed disabled:text-slate-500"
                    disabled={busy || resendIn > 0}
                    onClick={sendCode}
                  >
                    {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

            {enabled !== false && (
              <p className="mt-5 text-center text-sm text-slate-400">
                Remembered it? <Link to="/login" className="font-medium text-indigo-300 hover:text-white">Back to sign in</Link>
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
