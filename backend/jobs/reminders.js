/**
 * Automatic loan reminders (no external scheduler).
 *
 * - Due soon: an issued loan due within DUE_SOON_DAYS calendar days (today .. +2) gets one reminder.
 *   Renewing a loan clears remindersSent.dueSoon so the new due date is reminded again.
 * - Overdue: first reminder on the first overdue day, then at most once every OVERDUE_REPEAT_DAYS
 *   calendar days, with the current fine.
 *
 * startReminderJob() runs on server start and then hourly. A JobLock document makes the scheduled run
 * happen at most once per calendar day even with several servers. Each loan is also claimed atomically
 * before it is notified, so concurrent runs (or the staff "Send reminders" button) never double-send.
 */
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const JobLock = require('../models/JobLock');
const { notifyStudent } = require('../controllers/notificationController');
const { calculateFine, getDaysOverdue, startOfDay, calendarDaysBetween } = require('../utils/fineCalculator');

const JOB_ID = 'reminders';
const DUE_SOON_DAYS = 2;
const OVERDUE_REPEAT_DAYS = 7;
const HOUR_MS = 60 * 60 * 1000;
const LOAN_LINK = '/student/my-books?tab=issued';

const dayKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Midnight of the calendar day `days` away from `date` (DST-safe)
const dayOffset = (date, days) => {
  const d = startOfDay(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Claim today's scheduled run. Returns false if it already ran today (here or on another server):
 * the filter misses, the upsert tries to insert the same _id and fails with a duplicate key.
 */
const claimDailyRun = async (now) => {
  const today = dayKey(now);
  try {
    const lock = await JobLock.findOneAndUpdate(
      { _id: JOB_ID, lastRunDay: { $ne: today } },
      { $set: { lastRunDay: today, lastRunAt: now } },
      { upsert: true, new: true }
    );
    return !!lock;
  } catch (error) {
    if (error.code === 11000) return false;
    throw error;
  }
};

/**
 * Claim one loan for a reminder kind, notify, and release the claim if the notification failed.
 * @returns {Promise<boolean>} whether a notification was sent
 */
const claimAndNotify = async (loan, kind, claimFilter, now, notification) => {
  const field = `remindersSent.${kind}`;
  const claimed = await Transaction.findOneAndUpdate(
    { _id: loan._id, status: 'issued', ...claimFilter },
    { $set: { [field]: now } }
  );
  if (!claimed) return false;

  const created = await notifyStudent(loan.userId, notification);
  if (!created) {
    const previous = claimed.remindersSent?.[kind];
    await Transaction.updateOne({ _id: loan._id }, previous ? { $set: { [field]: previous } } : { $unset: { [field]: '' } });
    return false;
  }
  return true;
};

const sendDueSoon = async (now) => {
  const notYetSent = { 'remindersSent.dueSoon': null };
  const loans = await Transaction.find({
    status: 'issued',
    dueDate: { $gte: startOfDay(now), $lt: dayOffset(now, DUE_SOON_DAYS + 1) },
    ...notYetSent,
  })
    .select('userId bookId dueDate')
    .populate('bookId', 'title');

  let sent = 0;
  for (const loan of loans) {
    const days = calendarDaysBetween(now, loan.dueDate);
    const when = days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
    const title = loan.bookId?.title || 'A borrowed book';
    const ok = await claimAndNotify(loan, 'dueSoon', notYetSent, now, {
      type: 'DUE_DATE_REMINDER',
      title: days <= 0 ? 'Due today' : 'Due soon',
      message: `"${title}" is due ${when} (${new Date(loan.dueDate).toLocaleDateString()}). Return or renew it to avoid a fine.`,
      link: LOAN_LINK,
      meta: { transactionId: loan._id, bookId: loan.bookId?._id || loan.bookId },
    });
    if (ok) sent++;
  }
  return sent;
};

const sendOverdue = async (now) => {
  // Last sent before this day means at least OVERDUE_REPEAT_DAYS calendar days ago
  const due = {
    $or: [
      { 'remindersSent.overdue': null },
      { 'remindersSent.overdue': { $lt: dayOffset(now, -(OVERDUE_REPEAT_DAYS - 1)) } },
    ],
  };
  const loans = await Transaction.find({ status: 'issued', dueDate: { $lt: startOfDay(now) }, ...due })
    .select('userId bookId dueDate')
    .populate('bookId', 'title');

  let sent = 0;
  for (const loan of loans) {
    const days = getDaysOverdue(loan.dueDate, now);
    const fine = calculateFine(loan.dueDate, now);
    const title = loan.bookId?.title || 'A borrowed book';
    const ok = await claimAndNotify(loan, 'overdue', due, now, {
      type: 'BOOK_OVERDUE',
      title: 'Book overdue',
      message: `"${title}" is ${days} day${days === 1 ? '' : 's'} overdue. Current fine: ₹${fine}. Please return it to the library.`,
      link: LOAN_LINK,
      meta: { transactionId: loan._id, bookId: loan.bookId?._id || loan.bookId },
    });
    if (ok) sent++;
  }
  return sent;
};

/**
 * Send due-soon and overdue reminders.
 * @param {Object} [options]
 * @param {Date} [options.now] - reference time (tests simulate later days)
 * @param {Boolean} [options.force] - skip the once-per-day lock (staff "Send reminders" button)
 * @returns {Promise<{ skipped: Boolean, dueSoon: Number, overdue: Number }>}
 */
const runReminders = async ({ now = new Date(), force = false } = {}) => {
  if (!force && !(await claimDailyRun(now))) return { skipped: true, dueSoon: 0, overdue: 0 };

  const dueSoon = await sendDueSoon(now);
  const overdue = await sendOverdue(now);

  if (!force) await JobLock.updateOne({ _id: JOB_ID }, { $set: { lastResult: { dueSoon, overdue } } });
  return { skipped: false, dueSoon, overdue };
};

/** Run now (once connected) and then hourly; REMINDERS_ENABLED=false turns it off. */
const startReminderJob = () => {
  if (String(process.env.REMINDERS_ENABLED ?? 'true').trim().toLowerCase() === 'false') {
    console.log('Automatic reminders are disabled (REMINDERS_ENABLED=false)');
    return null;
  }

  let timer = null;
  const tick = () =>
    runReminders()
      .then((r) => {
        if (!r.skipped) console.log(`Reminders sent: ${r.dueSoon} due soon, ${r.overdue} overdue`);
      })
      .catch((error) => console.error('Reminder job failed (retrying next hour):', error.message));

  const begin = () => {
    tick();
    timer = setInterval(tick, HOUR_MS);
    if (timer.unref) timer.unref();
  };

  if (mongoose.connection.readyState === 1) begin();
  else mongoose.connection.once('open', begin);
  return () => timer && clearInterval(timer);
};

module.exports = { runReminders, startReminderJob, DUE_SOON_DAYS, OVERDUE_REPEAT_DAYS };
