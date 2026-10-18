const Counter = require('../models/Counter');
const User = require('../models/User');

/**
 * Short, sequential Library IDs: "LIB-" + at least 4 digits (LIB-1003, LIB-1004 ...).
 * The number comes from one counter document advanced with an atomic $inc, so concurrent signups
 * never get the same ID. The counter starts after the highest short ID already in use.
 */
const COUNTER_ID = 'libraryId';
const PREFIX = 'LIB-';
const MIN_START = 1000; // the first new ID is LIB-1001 when nothing short exists yet
// Short format: 4 to 6 digits (the old timestamp IDs, LIB-1718000000000, have 13)
const SHORT_ID = /^LIB-\d{4,6}$/;

const isShortLibraryId = (id) => typeof id === 'string' && SHORT_ID.test(id);
const formatLibraryId = (n) => `${PREFIX}${String(n).padStart(4, '0')}`;

/** Highest number among the short IDs in use (or MIN_START) */
const highestShortNumber = async () => {
  const users = await User.find({ libraryId: { $regex: '^LIB-\\d{4,6}$' } }).select('libraryId').lean();
  return users.reduce((max, u) => Math.max(max, Number(u.libraryId.slice(PREFIX.length)) || 0), MIN_START);
};

/** Create the counter once, at the highest short ID in use; a concurrent first call is harmless */
const ensureCounter = async () => {
  if (await Counter.exists({ _id: COUNTER_ID })) return;
  const start = await highestShortNumber();
  try {
    await Counter.updateOne({ _id: COUNTER_ID }, { $setOnInsert: { seq: start } }, { upsert: true });
  } catch (error) {
    if (error.code !== 11000) throw error; // another request created it first
  }
};

/**
 * The next free Library ID. Atomic: two calls at the same moment get different numbers.
 * A number that is somehow taken already (an ID typed in by an admin) is skipped.
 * @returns {Promise<string>}
 */
const nextLibraryId = async () => {
  await ensureCounter();
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const { seq } = await Counter.findOneAndUpdate({ _id: COUNTER_ID }, { $inc: { seq: 1 } }, { new: true }).lean();
    const id = formatLibraryId(seq);
    if (!(await User.exists({ libraryId: id }))) return id;
  }
  throw new Error('Could not allocate a Library ID');
};

module.exports = { nextLibraryId, isShortLibraryId, formatLibraryId, highestShortNumber, SHORT_ID, COUNTER_ID };
