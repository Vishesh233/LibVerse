/**
 * Fine and due-date helpers - same calendar-day logic as backend/utils/fineCalculator.js,
 * so the UI shows the same numbers as the server. A book due on the 10th and returned
 * any time on the 13th is 3 days late.
 */

const DAY_MS = 1000 * 60 * 60 * 24;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Whole calendar days from `from` to `to` (Math.round absorbs daylight-saving shifts)
const calendarDaysBetween = (from, to) => Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS);

/**
 * Calendar days a book is late
 * @param {string|Date} dueDate - Due date
 * @param {string|Date} asOf - Return date / date to measure against (defaults to now)
 * @returns {number} Days late (0 if not late)
 */
export const getDaysOverdue = (dueDate, asOf = new Date()) => {
  if (!dueDate) return 0;
  return Math.max(0, calendarDaysBetween(dueDate, asOf));
};

/**
 * Calculate fine based on due date
 * @param {string|Date} dueDate - Due date
 * @param {string|Date} asOf - Return date / date to measure against (defaults to now)
 * @param {number} finePerDay - Fine amount per day (default: 5)
 * @returns {number} Fine amount
 */
export const calculateFine = (dueDate, asOf = new Date(), finePerDay = 5) => getDaysOverdue(dueDate, asOf) * finePerDay;

/**
 * Check if a transaction is overdue (due on an earlier calendar day than today)
 * @param {string} dueDate - ISO format date string
 * @returns {boolean}
 */
export const isOverdue = (dueDate) => getDaysOverdue(dueDate) > 0;

/**
 * Get calendar days until due or days overdue
 * @param {string} dueDate - ISO format date string
 * @returns {number} Negative if overdue, positive if upcoming
 */
export const getDaysUntilDue = (dueDate) => calendarDaysBetween(new Date(), dueDate);
