import React, { useEffect } from 'react';

export const Alert = ({ type = 'info', message, onClose, autoClose = true, duration = 4000 }) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const styles = {
    error: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    success: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    info: 'bg-sky-500/10 text-sky-300 border border-sky-500/30',
  };

  const icons = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${styles[type]}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{icons[type]}</span>
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="font-bold hover:opacity-70">
        ✕
      </button>
    </div>
  );
};

export const AlertContainer = ({ alerts = [] }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => (
        <Alert key={alert.id} {...alert} />
      ))}
    </div>
  );
};