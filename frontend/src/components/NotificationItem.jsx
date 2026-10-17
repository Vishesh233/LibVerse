import React from 'react';

/**
 * Notification categories come from the server (`category` on each notification).
 * Colours are light tints for text/icons on the dark theme (all >= 7:1 on the card surface).
 */
export const NOTIFICATION_CATEGORIES = [
  {
    key: 'request',
    label: 'Requests',
    color: '#A5B4FC',
    path: 'M6 12 3.27 3.13a59.77 59.77 0 0 1 18.22 8.87 59.77 59.77 0 0 1-18.22 8.88L6 12Zm0 0h7.5',
  },
  {
    key: 'approval',
    label: 'Approvals',
    color: '#6EE7B7',
    path: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  {
    key: 'return',
    label: 'Returns',
    color: '#67E8F9',
    path: 'M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3',
  },
  {
    key: 'fine',
    label: 'Fines',
    color: '#FCD34D',
    path: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z',
  },
  {
    key: 'reminder',
    label: 'Reminders',
    color: '#FDBA74',
    path: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  {
    key: 'system',
    label: 'System',
    color: '#CBD5E1',
    path: 'm11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
  },
];

const CATEGORY_BY_KEY = Object.fromEntries(NOTIFICATION_CATEGORIES.map((c) => [c.key, c]));
const categoryMeta = (key) => CATEGORY_BY_KEY[key] || CATEGORY_BY_KEY.system;

/** Notifications page for the signed-in role */
export const notificationsPath = (role) => {
  if (role === 'admin') return '/admin/notifications';
  if (role === 'librarian') return '/librarian/notifications';
  return '/student/notifications';
};

export const relativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: days > 300 ? 'numeric' : undefined });
};

export const NotificationIcon = ({ category, className = 'h-9 w-9' }) => {
  const meta = categoryMeta(category);
  return (
    <span
      className={`grid flex-shrink-0 place-items-center rounded-xl border ${className}`}
      style={{ color: meta.color, background: `${meta.color}1A`, borderColor: `${meta.color}40` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={meta.path} />
      </svg>
    </span>
  );
};

/**
 * One notification row (panel and Notifications page). The whole row is a button:
 * clicking marks it read and opens its link.
 */
export const NotificationItem = ({ notification, onSelect, wrapMessage = false }) => {
  const unread = !notification.isRead;
  return (
    <button
      type="button"
      onClick={() => onSelect?.(notification)}
      className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/5 focus-visible:[outline-offset:-2px] ${
        unread ? 'bg-white/[0.03]' : ''
      }`}
    >
      <NotificationIcon category={notification.category} />
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span className={`flex-1 text-sm leading-snug line-clamp-1 ${unread ? 'font-semibold text-slate-100' : 'font-medium text-slate-300'}`}>
            {notification.title}
          </span>
          {unread && (
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]">
              <span className="sr-only">Unread</span>
            </span>
          )}
        </span>
        <span className={`mt-0.5 block text-xs leading-relaxed text-slate-400 ${wrapMessage ? '' : 'line-clamp-2'}`}>{notification.message}</span>
        <time dateTime={notification.createdAt} className="mt-1 block text-[11px] text-muted">
          {relativeTime(notification.createdAt)}
        </time>
      </span>
    </button>
  );
};
