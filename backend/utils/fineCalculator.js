/**
 * Calculate fine amount based on overdue days
 * @param {Date} dueDate - Due date of the book
 * @param {Date} returnDate - Return date (default: today)
 * @param {Number} dailyFineRate - Fine per day (default: 10)
 * @returns {Number} - Total fine amount
 */
const calculateFine = (dueDate, returnDate = new Date(), dailyFineRate = 10) => {
  const today = returnDate || new Date();
  
  if (today <= dueDate) {
    return 0; // No fine if returned on or before due date
  }

  const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
  return daysOverdue * dailyFineRate;
};

/**
 * Get overdue status
 * @param {Date} dueDate
 * @returns {Boolean}
 */
const isOverdue = (dueDate) => {
  return new Date() > dueDate;
};

/**
 * Get days remaining
 * @param {Date} dueDate
 * @returns {Number}
 */
const getDaysRemaining = (dueDate) => {
  const days = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
  return days < 0 ? 0 : days;
};

module.exports = { calculateFine, isOverdue, getDaysRemaining };
