/** Formatting helpers shared by the profile components (Indian English, like the rest of the app) */

const validDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** "17 October 2026", or null when the date is missing/invalid (the caller then shows nothing) */
export const formatMemberSince = (value) => {
  const d = validDate(value);
  return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
};

/** "17 Oct 2026, 3:45 pm" */
export const formatDateTime = (value) => {
  const d = validDate(value);
  return d
    ? d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';
};

/** "Just now", "5 min ago", "3 h ago", "Yesterday", "4 days ago"; '' from a week on (show the date instead) */
export const formatRelative = (value, now = new Date()) => {
  const d = validDate(value);
  if (!d) return '';
  const minutes = Math.round((now - d) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return '';
};

export const ROLE_LABELS = { student: 'Student', librarian: 'Librarian', admin: 'Admin' };
