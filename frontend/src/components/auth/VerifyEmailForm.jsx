import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { useResendTimer } from '../../hooks/useResendTimer';
import { CodeField } from './CodeField';

const RESEND_SECONDS = 60;

/**
 * Confirm a new account's email with the 6-digit code we sent: shown after sign-up and when a
 * password sign-in answers "Please verify your email". Calls onVerified(user, token) on success.
 * @param {{ email: string, onVerified: (user: object, token: string) => void, onBack?: () => void, backLabel?: string }} props
 */
export const VerifyEmailForm = ({ email, onVerified, onBack, backLabel = 'Back' }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useResendTimer(RESEND_SECONDS);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from the email');
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      const { data } = await authAPI.verifyEmail(email, code);
      onVerified(data.user, data.token);
    } catch (err) {
      setFormError(err.response?.data?.message || 'The code could not be checked. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setFormError('');
    try {
      await authAPI.resendVerification(email);
      setNotice('A new code is on its way.');
      setResendIn(RESEND_SECONDS);
      setCode('');
    } catch (err) {
      setFormError(err.response?.data?.message || 'The code could not be sent. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="auth-form" aria-labelledby="verify-email-heading">
      <div>
        <h2 id="verify-email-heading" className="font-display text-xl font-bold text-white">Verify your email</h2>
        <p className="mt-1 text-sm text-slate-400">
          We sent a 6-digit code to <span className="break-all font-semibold text-slate-200">{email}</span>. It expires in 10 minutes.
        </p>
      </div>
      {formError && (
        <div role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">{formError}</div>
      )}
      {notice && !formError && (
        <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.07] p-3 text-sm text-emerald-100">{notice}</p>
      )}
      <CodeField
        id="verify-code"
        value={code}
        onChange={(value) => { setCode(value); setError(''); }}
        error={error}
        autoFocus
      />
      <button type="submit" disabled={busy} className="login-button">
        {busy ? <span className="flex items-center justify-center gap-2"><span className="login-spinner" />Checking…</span> : 'Verify and continue'}
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        {onBack ? (
          <button type="button" className="text-slate-400 hover:text-white" onClick={onBack}>{backLabel}</button>
        ) : <span />}
        <button
          type="button"
          className="font-medium text-indigo-300 hover:text-white disabled:cursor-not-allowed disabled:text-slate-500"
          disabled={busy || resendIn > 0}
          onClick={resend}
        >
          {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
        </button>
      </div>
    </form>
  );
};
