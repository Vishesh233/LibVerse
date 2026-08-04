/**
 * Calculate fine based on due date
 * @param {string} dueDate - ISO format date string
 * @param {string} returnDate - ISO format date string (defaults to today)
 * @param {number} finePerDay - Fine amount per day (default: 10)
 * @returns {number} Fine amount
 */
export const calculateFine = (dueDate, returnDate = new Date().toISOString(), finePerDay = 10) => {
  if (!dueDate) return 0;

  const due = new Date(dueDate);
  const returned = new Date(returnDate);

  // Only charge fine if return is late
  if (returned <= due) {
    return 0;
  }

  const timeDiff = returned - due;
  const daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysLate * finePerDay;
};

/**
 * Get due date (default: 7 days from issue date)
 * @param {string} issueDate - ISO format date string
 * @param {number} daysAllowed - Number of days allowed (default: 7)
 * @returns {string} Due date in ISO format
 */
export const getDueDate = (issueDate, daysAllowed = 7) => {
  const date = new Date(issueDate);
  date.setDate(date.getDate() + daysAllowed);
  return date.toISOString();
};

/**
 * Check if a transaction is overdue
 * @param {string} dueDate - ISO format date string
 * @returns {boolean}
 */
export const isOverdue = (dueDate) => {
  return new Date() > new Date(dueDate);
};

/**
 * Get days until due or days overdue
 * @param {string} dueDate - ISO format date string
 * @returns {number} Negative if overdue, positive if upcoming
 */
export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const timeDiff = due - today;
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};
