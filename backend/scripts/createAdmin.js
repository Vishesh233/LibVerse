/**
 * Create an admin account (e.g. the first one on a new database). Asks for the name, email and
 * password in the terminal; the password is not shown while typing and is never printed or logged.
 *
 * Usage (from backend/):
 *   node scripts/createAdmin.js                                   uses MONGODB_URI from backend/.env
 *   MONGODB_URI="<atlas connection string>" node scripts/createAdmin.js
 */
const path = require('path');
const readline = require('readline');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Problems with a staff password, or null when it is acceptable */
const passwordProblem = (pw) => {
  if (typeof pw !== 'string' || pw.length < 12) return 'Use at least 12 characters';
  if (!/[a-z]/i.test(pw) || !/\d/.test(pw)) return 'Use letters and at least one number';
  if (pw.length > 128) return 'Use at most 128 characters';
  return null;
};

/**
 * Create the admin. Throws with a readable message when something is wrong.
 * @param {{ name: string, email: string, password: string }} input
 */
const createAdmin = async ({ name, email, password }) => {
  const User = require('../models/User');
  const { nextLibraryId } = require('../utils/libraryId');
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (cleanName.length < 2) throw new Error('Enter a name');
  if (!EMAIL.test(cleanEmail)) throw new Error('Enter a valid email address');
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);
  if (await User.exists({ email: cleanEmail })) throw new Error('An account with this email already exists');
  const user = await User.create({
    name: cleanName,
    email: cleanEmail,
    password,
    role: 'admin',
    libraryId: await nextLibraryId(),
    isOnboardingCompleted: true,
  });
  return { _id: user._id, name: user.name, libraryId: user.libraryId };
};

/** Ask a question; with hidden: true nothing typed is echoed */
const ask = (question, { hidden = false } = {}) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    // Print the question, then echo nothing (not even the length) until Enter
    process.stdout.write(question);
    rl._writeToOutput = (text) => { if (text.includes('\n') || text.includes('\r')) process.stdout.write('\n'); };
    rl.question('', (answer) => { rl.close(); resolve(answer); });
  } else {
    rl.question(question, (answer) => { rl.close(); resolve(answer); });
  }
});

const main = async () => {
  if (!process.stdin.isTTY) throw new Error('Run this in an interactive terminal (the password is typed, not piped).');
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  const mongoose = require('mongoose');
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await mongoose.connect(uri);
  console.log(`Create an admin in database "${mongoose.connection.db.databaseName}"`);
  try {
    const name = await ask('Full name: ');
    const email = await ask('Email: ');
    let password;
    for (;;) {
      password = await ask('Password (hidden, 12+ characters with a number): ', { hidden: true });
      const problem = passwordProblem(password);
      if (problem) { console.log(problem); continue; }
      const again = await ask('Type it again: ', { hidden: true });
      if (again === password) break;
      console.log('The passwords do not match. Try again.');
    }
    const admin = await createAdmin({ name, email, password });
    console.log(`Admin created: ${admin.name} (${admin.libraryId}). Sign in with that email.`);
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

module.exports = { createAdmin, passwordProblem };
