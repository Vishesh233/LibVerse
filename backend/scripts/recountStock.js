/**
 * Recompute every book's stock counters from the loans and reservations that actually exist.
 *
 *   node scripts/recountStock.js            dry run: prints the books whose counters are off, changes nothing
 *   node scripts/recountStock.js --apply    writes the recomputed counters
 *
 * Uses MONGODB_URI / MONGO_URI from .env (a variable already set in the shell wins, e.g. to point
 * at a copy of the database).
 *
 *   issuedCopies    = open loans (issued, return_requested, payment_pending)
 *   heldCopies      = ready reservations
 *   availableCopies = totalCopies - issuedCopies - heldCopies
 *
 * SAFETY:
 * - Refuses to write anything if any book would end up with a negative count
 * - Each book is updated only if its counters are still the ones that were read, so a loan
 *   approved while the script runs is never overwritten (that book is reported as skipped)
 * - Output lists titles and numbers only - never users
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const Reservation = require('../models/Reservation');
const { OPEN_LOAN } = require('../services/deskService');

const apply = process.argv.includes('--apply');

const countBy = async (Model, match) => {
  const rows = await Model.aggregate([{ $match: match }, { $group: { _id: '$bookId', n: { $sum: 1 } } }]);
  return new Map(rows.map((r) => [String(r._id), r.n]));
};

// A stored counter as read, for the "unchanged since read" filter (a missing field matches null)
const asRead = (v) => (v === undefined ? null : v);

const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('No database URI (set MONGODB_URI or MONGO_URI in backend/.env)');
  await mongoose.connect(uri);
  console.log(`Database: ${mongoose.connection.name} · ${apply ? 'APPLY' : 'dry run (no changes)'}`);

  const [books, issuedBy, heldBy] = await Promise.all([
    Book.find({}).select('title totalCopies availableCopies issuedCopies heldCopies').lean(),
    countBy(Transaction, { status: { $in: OPEN_LOAN } }),
    countBy(Reservation, { status: 'ready' }),
  ]);

  const bookIds = new Set(books.map((b) => String(b._id)));
  const orphanLoans = [...issuedBy].filter(([id]) => !bookIds.has(id)).reduce((s, [, n]) => s + n, 0);
  const orphanHolds = [...heldBy].filter(([id]) => !bookIds.has(id)).reduce((s, [, n]) => s + n, 0);

  const changes = [];
  const negative = [];
  for (const b of books) {
    const issued = issuedBy.get(String(b._id)) || 0;
    const held = heldBy.get(String(b._id)) || 0;
    const total = b.totalCopies ?? 0;
    const next = { issuedCopies: issued, heldCopies: held, availableCopies: total - issued - held };
    if (total < 0 || next.availableCopies < 0) negative.push({ b, next });
    if (b.availableCopies !== next.availableCopies || (b.issuedCopies ?? 0) !== issued
      || (b.heldCopies ?? 0) !== held || b.issuedCopies === undefined || b.heldCopies === undefined) {
      changes.push({ b, next });
    }
  }

  const fmt = (c) => `available ${c.availableCopies ?? '-'}, issued ${c.issuedCopies ?? '-'}, held ${c.heldCopies ?? '-'}`;
  for (const { b, next } of changes) {
    console.log(`"${b.title}" (total ${b.totalCopies}): ${fmt(b)} → ${fmt(next)}`);
  }

  console.log('');
  console.log(`Books scanned:            ${books.length}`);
  console.log(`Open loans counted:       ${[...issuedBy.values()].reduce((s, n) => s + n, 0)}`);
  console.log(`Ready holds counted:      ${[...heldBy.values()].reduce((s, n) => s + n, 0)}`);
  console.log(`Books needing a recount:  ${changes.length}`);
  if (orphanLoans || orphanHolds) {
    console.log(`Not counted (book missing): ${orphanLoans} open loans, ${orphanHolds} ready holds`);
  }

  if (negative.length) {
    console.log(`\nREFUSING: ${negative.length} book(s) would go negative (more loans and holds than copies):`);
    for (const { b, next } of negative) {
      console.log(`  "${b.title}": total ${b.totalCopies}, issued ${next.issuedCopies}, held ${next.heldCopies}`);
    }
    console.log('Fix those books\' totalCopies (or the loans/holds) first. Nothing was written.');
    process.exitCode = 2;
    return;
  }

  if (!changes.length) {
    console.log('All counters already match. Nothing to do.');
    return;
  }
  if (!apply) {
    console.log('Dry run only. Run again with --apply to write these counters.');
    return;
  }

  let updated = 0;
  let skipped = 0;
  for (const { b, next } of changes) {
    const res = await Book.updateOne(
      {
        _id: b._id,
        totalCopies: asRead(b.totalCopies),
        availableCopies: asRead(b.availableCopies),
        issuedCopies: asRead(b.issuedCopies),
        heldCopies: asRead(b.heldCopies),
      },
      { $set: next }
    );
    if (res.modifiedCount) updated += 1;
    else {
      skipped += 1;
      console.log(`skipped "${b.title}" (changed while the script ran; run it again)`);
    }
  }
  console.log(`Done: ${updated} book(s) updated, ${skipped} skipped.`);
};

run()
  .catch((error) => {
    console.error('Recount failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
