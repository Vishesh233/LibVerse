const mongoose = require('mongoose');

/**
 * One document per scheduled job (_id = job name). `lastRunDay` (YYYY-MM-DD, server local time)
 * is claimed with an atomic findOneAndUpdate so a job runs at most once per day across servers
 * (hourly jobs claim `lastRunHour`, YYYY-MM-DDTHH, the same way).
 */
const jobLockSchema = new mongoose.Schema(
  {
    _id: { type: String },
    lastRunDay: String,
    // Hourly jobs (reservation expiry): YYYY-MM-DDTHH of the last claimed run
    lastRunHour: String,
    lastRunAt: Date,
    lastResult: {
      dueSoon: Number,
      overdue: Number,
      expired: Number,
      promoted: Number,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model('JobLock', jobLockSchema);
