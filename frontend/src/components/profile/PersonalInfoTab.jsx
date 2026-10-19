import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../../services/api';
import { Button } from '../UI';
import { LockIcon } from './ProfileIcons';

// Same rules as PUT /api/auth/update-profile
const NAME_MAX = 60;
const ADDRESS_MAX = 200;
const PHONE_PATTERN = /^\+?[\d\s()-]+$/;

const fromUser = (user) => ({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });

const validate = ({ name, phone, address }) => {
  const errors = {};
  const n = name.trim();
  if (n.length < 2) errors.name = 'Enter your name (at least 2 characters)';
  else if (n.length > NAME_MAX) errors.name = `Name must be at most ${NAME_MAX} characters`;

  const p = phone.trim();
  if (p) {
    const digits = p.replace(/\D/g, '').length;
    if (!PHONE_PATTERN.test(p) || digits < 7 || digits > 15) {
      errors.phone = 'Use 7-15 digits; spaces, hyphens and a leading + are fine';
    }
  }

  if (address.trim().length > ADDRESS_MAX) errors.address = `Address must be at most ${ADDRESS_MAX} characters`;
  return errors;
};

const Field = ({ id, label, hint, error, children }) => (
  <div className="min-w-0">
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-200">{label}</label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-400">{error}</p>
    ) : (
      hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">{hint}</p>
    )}
  </div>
);

const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

/** Inline profile form: name, phone, address (email is read-only) */
export const PersonalInfoTab = ({ user, onUserChange }) => {
  const [values, setValues] = useState(() => fromUser(user));
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Follow outside changes to the user (e.g. a refresh) while nothing is being edited
  const saved = fromUser(user);
  const dirty = Object.keys(saved).some((k) => values[k].trim() !== saved[k]);
  useEffect(() => {
    if (!dirty) setValues(fromUser(user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, user?.phone, user?.address]);

  const errors = validate(values);
  const shown = (key) => ((touched[key] || submitted) ? errors[key] : undefined);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const blur = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  const reset = () => {
    setValues(fromUser(user));
    setTouched({});
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0 || !dirty) return;

    setSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: values.name.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
      });
      onUserChange(res.data.user);
      setValues(fromUser(res.data.user));
      setTouched({});
      setSubmitted(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (key) => `input-amo w-full ${shown(key) ? '!border-rose-500/70' : ''}`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="profile-name" label="Full name" error={shown('name')}>
          <input
            id="profile-name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={set('name')}
            onBlur={blur('name')}
            maxLength={NAME_MAX + 20}
            aria-invalid={shown('name') ? true : undefined}
            aria-describedby={describedBy('profile-name', shown('name'))}
            className={inputCls('name')}
          />
        </Field>

        <Field id="profile-email" label="Email" hint="Your sign-in email can't be changed here.">
          <div className="relative">
            <input
              id="profile-email"
              type="email"
              value={user?.email || ''}
              readOnly
              aria-readonly="true"
              aria-describedby="profile-email-hint"
              className="input-amo w-full cursor-not-allowed !pr-10 opacity-70"
            />
            <LockIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
        </Field>

        <Field id="profile-phone" label="Phone (optional)" hint="e.g. +91 98765 43210" error={shown('phone')}>
          <input
            id="profile-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={set('phone')}
            onBlur={blur('phone')}
            maxLength={25}
            aria-invalid={shown('phone') ? true : undefined}
            aria-describedby={describedBy('profile-phone', shown('phone'), true)}
            className={inputCls('phone')}
          />
        </Field>
      </div>

      <Field
        id="profile-address"
        label="Address (optional)"
        hint={`${values.address.trim().length}/${ADDRESS_MAX} characters`}
        error={shown('address')}
      >
        <textarea
          id="profile-address"
          rows={3}
          autoComplete="street-address"
          value={values.address}
          onChange={set('address')}
          onBlur={blur('address')}
          aria-invalid={shown('address') ? true : undefined}
          aria-describedby={describedBy('profile-address', shown('address'), true)}
          className={`${inputCls('address')} min-h-[88px] resize-y`}
        />
      </Field>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" fullWidth={false} onClick={reset} disabled={!dirty || saving} className="sm:min-w-[120px]">
          Cancel
        </Button>
        <Button type="submit" variant="primary" fullWidth={false} loading={saving} disabled={!dirty} className="sm:min-w-[140px]">
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
};

export default PersonalInfoTab;
