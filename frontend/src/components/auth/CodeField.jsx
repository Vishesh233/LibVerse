import React from 'react';

const KeyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/** The 6-digit code input (digits only, one-time-code autofill) in the sign-in style */
export const CodeField = ({ id, value, onChange, error, label = '6-digit code', autoFocus = false }) => (
  <div>
    <label htmlFor={id} className="field-label">{label}</label>
    <div className="relative">
      <input
        id={id}
        name={id}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="123456"
        autoFocus={autoFocus}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="login-input"
        style={{ letterSpacing: '0.3em', fontVariantNumeric: 'tabular-nums' }}
      />
      <div className="login-input-icon"><KeyIcon /></div>
    </div>
    {error && <p id={`${id}-error`} className="field-error">{error}</p>}
  </div>
);
