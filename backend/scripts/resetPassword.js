/**
 * Set a new password for one user.
 *
 *   node scripts/resetPassword.js <email>
 *
 * Uses MONGODB_URI / MONGO_URI from .env (a variable already set in the shell wins).
 * Asks for the new password twice without echoing it; it is never printed or taken from the
 * command line (where it would end up in shell history).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const readline = require('readline');
const { Writable } = require('stream');
const mongoose = require('mongoose');
const User = require('../models/User');

const MIN_LENGTH = 6; // same rule as signup and change-password

const args = process.argv.slice(2);
if (args.length !== 1 || !args[0].includes('@')) {
  console.error('Usage: node scripts/resetPassword.js <email>');
  console.error('The new password is asked for interactively; do not pass it on the command line.');
  process.exit(1);
}
const email = args[0].trim().toLowerCase();

// Prompts are written straight to stdout; everything readline would echo goes to a muted sink
const muted = new Writable({ write(chunk, encoding, cb) { cb(); } });
const rl = readline.createInterface({ input: process.stdin, output: muted, terminal: Boolean(process.stdin.isTTY) });
const lines = rl[Symbol.asyncIterator]();
rl.on('SIGINT', () => {
  process.stdout.write('\nCancelled. Nothing was changed.\n');
  process.exit(130);
});

const askHidden = async (prompt) => {
  process.stdout.write(prompt);
  const { value, done } = await lines.next();
  process.stdout.write('\n');
  return done ? '' : value;
};

const run = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('No database URI (set MONGODB_URI or MONGO_URI in backend/.env)');
  await mongoose.connect(uri);
  console.log(`Database: ${mongoose.connection.name} on ${mongoose.connection.host}`);

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.error('No user with that email. Nothing was changed.');
    process.exitCode = 2;
    return;
  }
  console.log(`User found: ${user.libraryId || user._id} (${user.role})`);

  const first = await askHidden('New password: ');
  if (first.length < MIN_LENGTH) {
    console.error(`Password must be at least ${MIN_LENGTH} characters. Nothing was changed.`);
    process.exitCode = 1;
    return;
  }
  const second = await askHidden('Repeat new password: ');
  if (first !== second) {
    console.error('Passwords do not match. Nothing was changed.');
    process.exitCode = 1;
    return;
  }

  user.password = first; // hashed by the User pre('save') hook
  user.tokenVersion = (user.tokenVersion || 0) + 1; // signs the user out everywhere
  await user.save();
  console.log('Password updated. Existing sessions for this user are signed out.');
};

run()
  .catch((error) => {
    console.error('Reset failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    rl.close();
    await mongoose.disconnect();
  });
