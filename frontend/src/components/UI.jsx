import React from 'react';

/**
 * Card
 * - variant: 'default' (solid surface) | 'glass' (semi-transparent + blur)
 * - glow: adds a soft accent glow (use sparingly)
 */
export const Card = ({ children, className = '', variant = 'default', glow = false, ...props }) => (
  <div className={`${variant === 'glass' ? 'card-glass' : 'card'} ${glow ? 'glow-primary' : ''} ${className}`} {...props}>
    {children}
  </div>
);

const BUTTON_VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  success: 'btn-success',
  warning: 'btn-warning',
};

const BUTTON_SIZES = {
  sm: '!min-h-[36px] !px-3 !py-1.5 !text-xs',
  md: '', // 44px min height from the btn-* classes
  lg: '!min-h-[52px] !px-6 !text-base',
};

/**
 * Button
 * - variant: primary | secondary | ghost | danger | success | warning
 * - size: sm | md (default, 44px) | lg
 * - loading: shows a spinner and disables the button
 * - fullWidth: true by default (the original Button was always full width)
 */
export const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  disabled = false,
  type, // browser default, like the original Button (submits inside a <form>)
  className = '',
  ...props
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={`${BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary} ${BUTTON_SIZES[size] || ''} ${fullWidth ? 'w-full' : ''} ${className}`}
    {...props}
  >
    {loading && (
      <span className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />
    )}
    {children}
  </button>
);

export const Input = ({ label, type = 'text', error = '', className = '', id, ...props }) => {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div className="mb-4">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-200 mb-2">{label}</label>}
      <input
        id={inputId}
        type={type}
        aria-invalid={error ? true : undefined}
        className={`input-amo w-full ${error ? '!border-rose-500/70' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-rose-400 text-sm mt-2">{error}</p>}
    </div>
  );
};

const BADGE_VARIANTS = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  neutral: 'badge-neutral',
  info: 'badge-info',
};

/** Badge - consistent pill; size sm (default) | md */
export const Badge = ({ children, variant = 'primary', size = 'sm', className = '', ...props }) => (
  <span
    className={`badge-amo ${BADGE_VARIANTS[variant] || BADGE_VARIANTS.primary} ${size === 'md' ? '!px-3.5 !py-1 !text-xs' : ''} ${className}`}
    {...props}
  >
    {children}
  </span>
);

export const Alert = ({ type = 'info', message, onClose, icon = true }) => {
  const styles = {
    info: 'border-cyan-400/60 text-sky-100',
    success: 'border-emerald-400/60 text-emerald-100',
    warning: 'border-amber-400/60 text-amber-100',
    error: 'border-rose-400/60 text-rose-100',
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`mb-4 flex items-center justify-between rounded-xl border border-l-4 border-border bg-surface-raised/80 p-4 ${styles[type]}`}
    >
      <div className="flex items-center">
        {icon && <span className="mr-3 text-lg" aria-hidden="true">{icons[type]}</span>}
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" className="ml-4 grid h-9 w-9 place-items-center rounded-lg font-bold hover:bg-white/5">
          ✕
        </button>
      )}
    </div>
  );
};

/**
 * EmptyState
 * - icon: emoji or any React node
 * - action: optional node (e.g. a Button)
 * - bare: render without the surrounding Card (when already inside one)
 */
export const EmptyState = ({ icon = '📭', title = 'No Data', message = '', action = null, bare = false }) => {
  const content = (
    <div className="text-center py-12">
      <div className="text-4xl mb-3" aria-hidden="true">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      {message && <p className="text-slate-400">{message}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
  return bare ? content : <Card>{content}</Card>;
};

/** Skeleton - shimmering placeholder block(s) while data loads */
export const Skeleton = ({ className = 'h-4 w-full', lines = 1, gap = 'space-y-3' }) => {
  if (lines <= 1) return <div className={`skeleton ${className}`} aria-hidden="true" />;
  return (
    <div className={gap} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton ${className} ${i === lines - 1 ? 'w-2/3' : ''}`} />
      ))}
    </div>
  );
};

/** PageHeader - page title (display font), optional subtitle and right-aligned actions */
export const PageHeader = ({ title, subtitle, actions, className = '' }) => (
  <div className={`page-header mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
    <div className="min-w-0">
      <h1 className="page-header__title font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </div>
);
