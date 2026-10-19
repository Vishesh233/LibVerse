/**
 * One-off migration for sign-up email verification: mark every existing account as verified
 * (emailVerified: true), so nobody who could sign in before is asked for a code.
 *
 *   node scripts/markEmailsVerified.js            dry run: counts the accounts that would change
 *   node scripts/markEmailsVerified.js --apply    sets emailVerified: true on them
 *
 * Uses MONGODB_URI / MONGO_URI from backend/.env (a variable already set in the shell wins).
 * Safe to run more than once. Prints counts only, never users.
 */
const path = require('path');

/**
 * @param {{ apply?: boolean }} options
 * @returns {Promise<{ users: number, toUpdate: number, updated: number }>}
 */
const markEmailsVerified = async ({ apply = false } = {}) => {
  const User = require('../models/User');
  // Raw collection: the schema default (true) would hide accounts that lack the field
  const users = User.collection;
  const filter = { emailVerified: { $ne: true } };
  const [total, toUpdate] = await Promise.all([users.countDocuments({}), users.countDocuments(filter)]);
  let updated = 0;
  if (apply && toUpdate) {
    const result = await users.updateMany(filter, { $set: { emailVerified: true } });
    updated = result.modifiedCount;
  }
  return { users: total, toUpdate, updated };
};

const main = async () => {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const mongoose = require('mongoose');
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('No database URI (set MONGODB_URI or MONGO_URI in backend/.env)');
  const apply = process.argv.includes('--apply');
  await mongoose.connect(uri);
  try {
    console.log(`Database: ${mongoose.connection.name} · ${apply ? 'APPLY' : 'dry run (no changes)'}`);
    const { users, toUpdate, updated } = await markEmailsVerified({ apply });
    console.log(`Accounts: ${users} · not yet marked verified: ${toUpdate}${apply ? ` · updated: ${updated}` : ''}`);
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { markEmailsVerified };
