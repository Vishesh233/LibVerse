import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../UI';
import { EyeIcon, EyeOffIcon, ShieldIcon } from './ProfileIcons';
import { GoogleSignInButton, useGoogleSignIn } from '../GoogleSignInButton';

const MIN_LENGTH = 6; // matches PUT /api/auth/change-password and the User model

const EMPTY = { current: '', next: '', confirm: '' };

/** 0-4 score: length first, then variety. Below the minimum is always 0. */
const strengthOf = (pw) => {
  if (pw.length < MIN_LENGTH) return 0;
  let score = 1;
  if (pw.length >= 10) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 4);
};

const STRENGTH = [
  { label: 'Too short', bar: 'bg-rose-500', text: 'text-rose-300' },
  { label: 'Weak', bar: 'bg-rose-400', text: 'text-rose-300' },
  { label: 'Fair', bar: 'bg-amber-400', text: 'text-amber-300' },
  { label: 'Good', bar: 'bg-cyan-400', text: 'text-cyan-300' },
  { label: 'Strong', bar: 'bg-emerald-400', text: 'text-emerald-300' },
];

const validate = ({ current, next, confirm }) => {
  const errors = {};
  if (!current) errors.current = 'Enter your current password';
  if (next.length < MIN_LENGTH) errors.next = `Use at least ${MIN_LENGTH} characters`;
  else if (next === current) errors.next = 'Choose a password different from the current one';
  if (!confirm) errors.confirm = 'Confirm your new password';
  else if (confirm !== next) errors.confirm = "Passwords don't match";
  return errors;
};

const PasswordField = ({ id, label, value, onChange, onBlur, autoComplete, error, visible, onToggle, describedBy }) => (
  <div className="min-w-0">
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-200">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={[error ? `${id}-error` : null, describedBy].filter(Boolean).join(' ') || undefined}
        className={`input-amo w-full !pr-12 ${error ? '!border-rose-500/70' : ''}`}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        aria-pressed={visible}
        className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
    {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-400">{error}</p>}
  </div>
);

/** Inline change-password form. A wrong current password is a 401 the API layer does not treat as a logout. */
const ChangePasswordForm = ({ user }) => {
  const { login } = useAuth();
  const [values, setValues] = useState(EMPTY);
  const [visible, setVisible] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);

  const errors = validate(values);
  const shown = (key) => (key === 'current' && serverError) || ((touched[key] || submitted) ? errors[key] : undefined);
  const strength = strengthOf(values.next);
  const meter = STRENGTH[strength];

  const set = (key) => (e) => {
    if (key === 'current') setServerError(null);
    setValues((v) => ({ ...v, [key]: e.target.value }));
  };
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));
  const toggle = (key) => () => setVisible((v) => ({ ...v, [key]: !v[key] }));

  const reset = () => {
    setValues(EMPTY);
    setVisible({});
    setTouched({});
    setSubmitted(false);
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const res = await authAPI.changePassword({ currentPassword: values.current, newPassword: values.next });
      // The change signs out every older session, this one included: keep going with the new token
      if (res.data?.token) login(res.data.user || user, res.data.token);
      reset();
      toast.success('Password changed');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password';
      if (err.response?.status === 401) setServerError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const hasInput = values.current || values.next || values.confirm;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.06] p-3 text-sm text-slate-300">
        <ShieldIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-300" />
        <p>Use at least {MIN_LENGTH} characters. A longer password with mixed case, numbers and symbols is much harder to guess.</p>
      </div>

      {/* Lets password managers attach the new password to the right account */}
      <input type="text" name="username" autoComplete="username" value={user?.email || ''} readOnly hidden />

      <PasswordField
        id="pw-current"
        label="Current password"
        autoComplete="current-password"
        value={values.current}
        onChange={set('current')}
        onBlur={blur('current')}
        error={shown('current')}
        visible={!!visible.current}
        onToggle={toggle('current')}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <PasswordField
            id="pw-new"
            label="New password"
            autoComplete="new-password"
            value={values.next}
            onChange={set('next')}
            onBlur={blur('next')}
            error={shown('next')}
            visible={!!visible.next}
            onToggle={toggle('next')}
            describedBy="pw-strength"
          />
          <div className="mt-2" aria-live="polite">
            <div className="grid grid-cols-4 gap-1" aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={`h-1.5 rounded-full ${values.next && strength >= i ? meter.bar : 'bg-white/10'}`} />
              ))}
            </div>
            <p id="pw-strength" className={`mt-1 text-xs ${values.next ? meter.text : 'text-muted'}`}>
              {values.next ? `Strength: ${meter.label}` : `At least ${MIN_LENGTH} characters`}
            </p>
          </div>
        </div>

        <PasswordField
          id="pw-confirm"
          label="Confirm new password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={set('confirm')}
          onBlur={blur('confirm')}
          error={shown('confirm')}
          visible={!!visible.confirm}
          onToggle={toggle('confirm')}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" fullWidth={false} onClick={reset} disabled={!hasInput || saving} className="sm:min-w-[120px]">
          Cancel
        </Button>
        <Button type="submit" variant="primary" fullWidth={false} loading={saving} disabled={!hasInput} className="sm:min-w-[170px]">
          {saving ? 'Updating...' : 'Update password'}
        </Button>
      </div>
    </form>
  );
};

/** First password for an account created with Google (it can then also sign in with email) */
const SetPasswordForm = ({ user }) => {
  const { updateUser } = useAuth();
  const [values, setValues] = useState({ next: '', confirm: '' });
  const [visible, setVisible] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const errors = {};
  if (values.next.length < MIN_LENGTH) errors.next = `Use at least ${MIN_LENGTH} characters`;
  if (!values.confirm) errors.confirm = 'Confirm your password';
  else if (values.confirm !== values.next) errors.confirm = "Passwords don't match";
  const meter = STRENGTH[strengthOf(values.next)];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;
    setSaving(true);
    try {
      const res = await authAPI.setPassword(values.next);
      updateUser({ ...user, ...res.data.user });
      toast.success('Password set. You can now also sign in with your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set the password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.06] p-3 text-sm text-slate-300">
        <ShieldIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-300" />
        <p>You sign in with Google and have no password yet. Set one to also sign in with your email ({user?.email}).</p>
      </div>
      <input type="text" name="username" autoComplete="username" value={user?.email || ''} readOnly hidden />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <PasswordField
            id="pw-set" label="New password" autoComplete="new-password" value={values.next}
            onChange={(e) => setValues((v) => ({ ...v, next: e.target.value }))}
            error={submitted ? errors.next : undefined} visible={!!visible.next}
            onToggle={() => setVisible((v) => ({ ...v, next: !v.next }))} describedBy="pw-set-strength"
          />
          <p id="pw-set-strength" className={`mt-1 text-xs ${values.next ? meter.text : 'text-muted'}`} aria-live="polite">
            {values.next ? `Strength: ${meter.label}` : `At least ${MIN_LENGTH} characters`}
          </p>
        </div>
        <PasswordField
          id="pw-set-confirm" label="Confirm password" autoComplete="new-password" value={values.confirm}
          onChange={(e) => setValues((v) => ({ ...v, confirm: e.target.value }))}
          error={submitted ? errors.confirm : undefined} visible={!!visible.confirm}
          onToggle={() => setVisible((v) => ({ ...v, confirm: !v.confirm }))}
        />
      </div>
      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" variant="primary" fullWidth={false} loading={saving} className="sm:min-w-[170px]">
          {saving ? 'Saving...' : 'Set password'}
        </Button>
      </div>
    </form>
  );
};

/** Connect or disconnect Google (both ask for the current password) */
const GoogleConnection = ({ user }) => {
  const { updateUser } = useAuth();
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const linked = Boolean(user?.googleLinked);
  const canDisconnect = user?.hasPassword !== false;

  const run = async (action, success) => {
    setBusy(true);
    try {
      const res = await action();
      updateUser({ ...user, ...res.data.user });
      setPassword('');
      toast.success(success);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const connect = (credential) => {
    if (!password) {
      toast.error('Enter your current password first');
      return;
    }
    run(() => authAPI.linkGoogle(credential, password), 'Google account connected');
  };

  return (
    <section className="space-y-4 border-t border-border pt-6" aria-labelledby="google-heading">
      <div>
        <h3 id="google-heading" className="text-base font-semibold text-slate-100">Sign in with Google</h3>
        <p className="mt-1 text-sm text-slate-400">
          {linked
            ? 'Your account is connected to Google: you can use the "Sign in with Google" button.'
            : 'Connect your Google account to sign in with one click. You will be asked to pick the Google account.'}
        </p>
      </div>
      {(!linked || canDisconnect) && (
        <PasswordField
          id="pw-google" label="Current password" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} visible={visible} onToggle={() => setVisible((v) => !v)}
        />
      )}
      {!linked && <div className="max-w-sm"><GoogleSignInButton text="continue_with" onCredential={connect} disabled={busy} /></div>}
      {linked && canDisconnect && (
        <Button
          type="button" variant="secondary" fullWidth={false} loading={busy} disabled={!password}
          onClick={() => run(() => authAPI.unlinkGoogle(password), 'Google account disconnected')}
        >
          Disconnect Google
        </Button>
      )}
      {linked && !canDisconnect && <p className="text-xs text-slate-400">Set a password above before you can disconnect Google.</p>}
    </section>
  );
};

/** Settings > Security: change (or, for Google accounts, set) the password; connect Google */
export const SecurityTab = ({ user }) => {
  const googleEnabled = useGoogleSignIn();
  return (
    <div className="space-y-8">
      {user?.hasPassword === false ? <SetPasswordForm user={user} /> : <ChangePasswordForm user={user} />}
      {googleEnabled && !user?.isDemo && <GoogleConnection user={user} />}
    </div>
  );
};

export default SecurityTab;
