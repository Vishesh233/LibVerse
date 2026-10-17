import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import { Button } from '../UI';
import { EyeIcon, EyeOffIcon, ShieldIcon } from './ProfileIcons';

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
export const SecurityTab = ({ user }) => {
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
      await authAPI.changePassword({ currentPassword: values.current, newPassword: values.next });
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

export default SecurityTab;
