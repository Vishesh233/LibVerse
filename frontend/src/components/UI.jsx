import React, { useState } from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '', ...props }) => {
  const baseStyles = 'w-full px-5 py-3 rounded-xl font-semibold transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 focus:ring-4 focus:ring-indigo-500/20 shadow-[0_8px_30px_rgba(99,102,241,0.12)]',
    secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600',
    warning: 'bg-amber-500 text-white hover:bg-amber-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, type = 'text', error = '', className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-200 mb-2">{label}</label>}
    <input
      type={type}
      className={`w-full px-4 py-3 border border-border rounded-xl bg-input text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${className}`}
      {...props}
    />
    {error && <p className="text-rose-400 text-sm mt-2">{error}</p>}
  </div>
);

export const Badge = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    neutral: 'badge-neutral',
  };

  return (
    <span
      className={`badge-amo ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const Alert = ({ type = 'info', message, onClose, icon = true }) => {
  const styles = {
    info: 'bg-slate-900 text-sky-200 border-slate-700',
    success: 'bg-slate-900 text-emerald-200 border-slate-700',
    warning: 'bg-slate-900 text-amber-200 border-slate-700',
    error: 'bg-slate-900 text-rose-200 border-slate-700',
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div className={`border-l-4 p-4 rounded mb-4 flex justify-between items-center ${styles[type]}`}>
      <div className="flex items-center">
        {icon && <span className="mr-3 text-lg">{icons[type]}</span>}
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold hover:opacity-70">
          ✕
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ icon = '📭', title = 'No Data', message = '' }) => (
  <Card>
    <div className="text-center py-12">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      {message && <p className="text-slate-400">{message}</p>}
    </div>
  </Card>
);