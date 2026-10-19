/**
 * Give every user whose Library ID is not in the short format (LIB- + 4-6 digits) a new short,
 * sequential ID from the same atomic counter as new signups.
 *
 *   node scripts/migrateLibraryIds.js            dry run: prints the plan, changes nothing
 *   node scripts/migrateLibraryIds.js --apply    applies it
 *
 * Uses MIGRATE_MONGO_URI when set, otherwise MONGODB_URI / MONGO_URI from .env.
 * Card QR codes contain the Library ID, so each changed user's old card stops working: every one
 * is notified (link to Profile -> Library card) and an audit entry is written (actor: the oldest
 * active admin). Output lists "user N: <old ID> -> <new ID>" only - never names or emails.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Counter = require('../models/Counter');
const { nextLibraryId, isShortLibraryId, formatLibraryId, highestShortNumber, COUNTER_ID } = require('../utils/libraryId');
const { createNotification } = require('../controllers/notificationController');
const { audit } = require('../utils/audit');

const ROLE_BASE = { student: '/student', librarian: '/librarian', admin: '/admin' };
const apply = process.argv.includes('--apply');

const run = async () => {
  const uri = process.env.MIGRATE_MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('No database URI');
  await mongoose.connect(uri);
  console.log(`Database: ${mongoose.connection.name} · ${apply ? 'APPLY' : 'dry run (no changes)'}`);

  // Oldest members first, so they get the lowest new numbers
  const users = await User.find({}).select('libraryId role createdAt').sort({ createdAt: 1, _id: 1 }).lean();
  const affected = users.filter((u) => !isShortLibraryId(u.libraryId));
  console.log(`${users.length} users, ${affected.length} need a short Library ID`);
  if (!affected.length) return;

  if (!apply) {
    // Same numbers the apply step would hand out (counter position or highest short ID, skipping taken ones)
    const counter = await Counter.findById(COUNTER_ID).lean();
    let n = counter ? counter.seq : await highestShortNumber();
    const taken = new Set(users.map((u) => u.libraryId).filter(Boolean));
    affected.forEach((u, i) => {
      let id;
      do { n += 1; id = formatLibraryId(n); } while (taken.has(id));
      taken.add(id);
      console.log(`user ${i + 1}: ${u.libraryId || '(none)'} → ${id}`);
    });
    console.log('Dry run only. Run again with --apply to make these changes.');
    return;
  }

  const actor = await User.findOne({ role: 'admin', isActive: { $ne: false } }).sort({ createdAt: 1 }).select('_id role').lean();
  if (!actor) console.warn('No active admin found: audit entries will be skipped');
  const req = { user: actor };

  let changed = 0;
  for (const [i, u] of affected.entries()) {
    const id = await nextLibraryId();
    // Only if nobody changed it meanwhile; the unique index keeps Library IDs unique
    const res = await User.updateOne({ _id: u._id, libraryId: u.libraryId }, { $set: { libraryId: id } });
    if (!res.modifiedCount) {
      console.log(`user ${i + 1}: ${u.libraryId || '(none)'} → skipped (changed meanwhile)`);
      continue;
    }
    changed += 1;
    console.log(`user ${i + 1}: ${u.libraryId || '(none)'} → ${id}`);
    await createNotification(u._id, u.role, 'CARD_UPDATED', 'Library card updated',
      `Your Library ID is now ${id}. Your library card and its QR code were updated; the old card no longer works at the desk.`,
      { link: `${ROLE_BASE[u.role] || '/student'}/profile?tab=card` });
    if (actor) {
      await audit(req, 'user.library_id_change', { type: 'User', id: u._id },
        `Library ID changed from ${u.libraryId || 'none'} to ${id} (short ID migration)`, { from: u.libraryId || null, to: id });
    }
  }
  console.log(`Done: ${changed} of ${affected.length} users updated.`);
};

run()
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
