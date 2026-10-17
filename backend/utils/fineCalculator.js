/**
 * Fine and due-date helpers. All counts are whole CALENDAR days in server local time:
 * a book due on the 10th and returned any time on the 13th is 3 days late.
 */

const DAY_MS = 1000 * 60 * 60 * 24;
const FINE_PER_DAY = 5;

/**
 * Midnight (server local time) of the given date
 * @param {Date|String} date
 * @returns {Date}
 */
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Whole calendar days from `from` to `to` (negative if `to` is earlier).
 * Math.round absorbs the 23h/25h days around daylight-saving changes.
 */
const calendarDaysBetween = (from, to) => Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS);

/**
 * Calendar days a book is late (0 if not late)
 * @param {Date} dueDate - Due date of the book
 * @param {Date} asOf - Date to measure against (default: now)
 * @returns {Number}
 */
const getDaysOverdue = (dueDate, asOf = new Date()) => {
  if (!dueDate) return 0;
  return Math.max(0, calendarDaysBetween(dueDate, asOf));
};

/**
 * Calculate fine amount: calendar days late x per-day rate
 * @param {Date} dueDate - Due date of the book
 * @param {Date} asOf - Return date / date to measure against (default: now)
 * @param {Number} perDay - Fine per day (default: 5)
 * @returns {Number} - Total fine amount
 */
const calculateFine = (dueDate, asOf = new Date(), perDay = FINE_PER_DAY) => getDaysOverdue(dueDate, asOf) * perDay;

/**
 * Get overdue status (due on an earlier calendar day than today)
 * @param {Date} dueDate
 * @returns {Boolean}
 */
const isOverdue = (dueDate) => getDaysOverdue(dueDate) > 0;

/**
 * Get calendar days remaining until the due date (negative if overdue)
 * @param {Date} dueDate
 * @returns {Number}
 */
const getDaysRemaining = (dueDate) => calendarDaysBetween(new Date(), dueDate);

/**
 * Calendar days late for a transaction, frozen when the fine was fixed: an issued loan is measured
 * to today; a return request, pending payment or completed return to the day it was requested (or returned).
 * @param {Object} t - transaction ({ status, dueDate, returnRequestedAt, returnDate })
 * @returns {Number}
 */
const getDaysLateOf = (t) => {
  if (!t) return 0;
  if (t.status === 'issued') return getDaysOverdue(t.dueDate);
  if (['return_requested', 'payment_pending', 'returned'].includes(t.status)) {
    return getDaysOverdue(t.dueDate, t.returnRequestedAt || t.returnDate || new Date());
  }
  return 0;
};

module.exports = { calculateFine, getDaysOverdue, getDaysLateOf, isOverdue, getDaysRemaining, startOfDay, calendarDaysBetween, FINE_PER_DAY };
