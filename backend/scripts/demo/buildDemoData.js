/**
 * The demo data (people and four months of activity) for a given catalogue, built in memory.
 * Used by scripts/seedDemo.js (a whole new libverse_demo database) and scripts/resetDemo.js (the
 * live demo: only the demo accounts and what they own are replaced).
 *
 * Deterministic for the same catalogue and random seed; dates are relative to `now`.
 */
const path = require('path');
const mongoose = require('mongoose');
const { receiptImage } = require('../../utils/demoReceipt');

const SEED = 20261019;
const DEMO_PASSWORD = 'Demo#Library2026';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const FINE_PER_DAY = 5;
const LOAN_DAYS = 14;

const STAFF = [
  { key: 'admin', name: 'Meera Iyer', role: 'admin', email: 'meera.iyer@example.com' },
  { key: 'lib1', name: 'Rohan Desai', role: 'librarian', email: 'rohan.desai@example.com' },
  { key: 'lib2', name: 'Kavya Menon', role: 'librarian', email: 'kavya.menon@example.com' },
];
// [name, favourite genres, activity 0-3, joined days ago]
const STUDENTS = [
  ['Aarav Sharma', ['Programming', 'Computer Science', 'AI & Machine Learning'], 3, 140],
  ['Diya Patel', ['Fiction', 'Psychology', 'Self-Help'], 3, 135],
  ['Kabir Singh', ['History', 'Biography', 'Non-Fiction'], 2, 130],
  ['Ananya Reddy', ['Finance', 'Business', 'Startup'], 2, 128],
  ['Vihaan Gupta', ['Cyber Security', 'Networking', 'Technology'], 2, 125],
  ['Isha Nair', ['Science', 'Non-Fiction', 'Psychology'], 3, 120],
  ['Arjun Mehta', ['Programming', 'Database', 'Computer Science'], 2, 118],
  ['Saanvi Joshi', ['Fiction', 'Biography', 'Motivation'], 1, 110],
  ['Reyansh Kulkarni', ['AI & Machine Learning', 'Science', 'Technology'], 2, 104],
  ['Myra Bhat', ['Self-Help', 'Motivation', 'Psychology'], 1, 98],
  ['Advait Chopra', ['Startup', 'Business', 'Finance'], 2, 95],
  ['Kiara Das', ['Fiction', 'History', 'Non-Fiction'], 1, 90],
  ['Vivaan Malhotra', ['Database', 'Programming', 'Cyber Security'], 2, 84],
  ['Aditi Rao', ['Psychology', 'Science', 'Self-Help'], 2, 80],
  ['Ishaan Verma', ['Networking', 'Technology', 'Computer Science'], 1, 72],
  ['Navya Pillai', ['Biography', 'History', 'Fiction'], 1, 66],
  ['Dhruv Saxena', ['Finance', 'Startup', 'Motivation'], 1, 60],
  ['Tara Krishnan', ['AI & Machine Learning', 'Programming', 'Science'], 2, 52],
  ['Yash Agarwal', ['Business', 'Self-Help', 'Biography'], 1, 45],
  ['Riya Banerjee', ['Fiction', 'Psychology', 'Non-Fiction'], 1, 38],
  ['Aryan Kapoor', ['Cyber Security', 'Programming', 'Networking'], 1, 24],
  ['Meher Sethi', ['Self-Help', 'Fiction', 'Motivation'], 0, 6],
  ['Zoya Qureshi', ['Science', 'History', 'Technology'], 0, 3],
  ['Nikhil Bose', ['Technology', 'Business'], 1, 100], // deactivated
  ['Anika Shetty', [], 0, 0], // just signed up: onboarding not finished
];
const DEACTIVATED = 'Nikhil Bose';
const NEW_MEMBER = 'Anika Shetty';

const WAIVER_REASONS = ['First late return: waived', 'Library was closed on the due date', 'Medical leave (certificate seen)', 'Returned at the desk on time; system delay'];
const REVIEW_TEXT = {
  5: ['Clear, well organised and genuinely useful. I kept going back to it.', 'One of the best books I have borrowed this term.', 'Explains the ideas simply without dumbing them down.', 'Loved it: finished it in a weekend.'],
  4: ['Good read with practical examples. A few chapters drag a little.', 'Helpful and easy to follow; worth borrowing.', 'Solid book. I would recommend it to classmates.', 'Interesting throughout, with a couple of slower sections.'],
  3: ['Decent, but more detailed than I needed.', 'Some useful parts; the middle felt repetitive.', 'Okay overall. Better as a reference than a cover-to-cover read.'],
};

/** Seeded random numbers (mulberry32): the same demo data on every run */
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const emailOf = (name) => `${name.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.')}@example.com`;
const rupees = (n) => `₹${n}`;
const label = (u) => `${u.name} (${u.libraryId})`;
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const daysLate = (due, at) => Math.max(0, Math.round((startOfDay(at) - startOfDay(due)) / DAY));

/** Register the app's models on a separate connection (indexes as in the app) */
const bindModels = async (conn, names = ['User', 'Book', 'Transaction', 'Reservation', 'Notification', 'Review', 'AuditLog', 'Counter']) => {
  const models = {};
  for (const name of names) {
    const m = require(path.join(__dirname, '..', '..', 'models', name));
    models[name] = conn.model(m.modelName, m.schema);
    await models[name].init();
  }
  return models;
};

/**
 * Build the demo people and their activity.
 * @param {object} options
 * @param {object[]} options.books - catalogue books with _id, title, genre, totalCopies. Their stock fields are
 *   rewritten to match the demo loans (seedDemo stores them; resetDemo recounts from the database instead).
 * @param {() => number} options.random - seeded random numbers, rng(SEED)
 * @param {Date} options.now
 * @param {string} options.passwordHash - bcrypt hash for every demo account
 * @param {boolean} options.isDemo - mark the accounts as live demo accounts
 * @param {number} options.libraryNumberBase - the accounts get LIB-(base+1), LIB-(base+2), ...
 */
const buildDemoData = async ({ books, random, now = new Date(), passwordHash, isDemo = false, libraryNumberBase = 1000 }) => {
  const pick = (arr) => arr[Math.floor(random() * arr.length)];
  const between = (a, b) => a + Math.floor(random() * (b - a + 1));
  const ago = (days, hours = 0) => new Date(now.getTime() - days * DAY - hours * HOUR);
  const id = () => new mongoose.Types.ObjectId();
  const byGenre = {};
  books.forEach((b) => { (byGenre[b.genre] = byGenre[b.genre] || []).push(b); });

  // ---- People
  let seq = libraryNumberBase;
  const person = (fields) => {
    seq += 1;
    return {
      _id: id(), password: passwordHash, isDemo, libraryId: `LIB-${seq}`, cardVersion: 1, isActive: true, fineAmount: 0, tokenVersion: 0,
      wishlist: [], favoriteGenres: [], isOnboardingCompleted: true, phone: `+91 98${String(10000000 + seq * 7919).slice(-8)}`, ...fields,
    };
  };
  const staff = {};
  STAFF.forEach((s) => {
    const createdAt = ago(220 - STAFF.indexOf(s) * 5);
    staff[s.key] = person({ name: s.name, email: s.email, role: s.role, createdAt, updatedAt: createdAt });
  });
  const librarians = [staff.lib1, staff.lib2];
  const students = STUDENTS.map(([name, genres, activity, joined]) => {
    const createdAt = ago(joined, between(1, 8));
    return Object.assign(person({
      name, email: emailOf(name), role: 'student', favoriteGenres: genres, createdAt, updatedAt: createdAt,
      isActive: name !== DEACTIVATED, isOnboardingCompleted: name !== NEW_MEMBER,
      address: pick(['Koramangala, Bengaluru', 'Andheri West, Mumbai', 'Salt Lake, Kolkata', 'Kothrud, Pune', 'Adyar, Chennai', 'Gachibowli, Hyderabad']),
    }), { activity, joined });
  });
  const aarav = students[0];
  const active = students.filter((s) => s.isActive && s.isOnboardingCompleted);

  const tx = [];
  const audits = [];
  const notes = [];
  const reviews = [];
  const reservations = [];
  const audit = (actor, action, targetType, targetId, summary, at, meta) => audits.push({
    _id: id(), actorId: actor._id, actorRole: actor.role, action, targetType, targetId, summary, meta, createdAt: at, updatedAt: at,
  });
  const notify = (user, type, title, message, at, extra = {}) => notes.push({
    _id: id(), userId: user._id, role: user.role, type, title, message, isRead: extra.isRead ?? at < ago(2), link: extra.link, meta: extra.meta, createdAt: at, updatedAt: at,
  });
  const staffNotify = (type, title, message, at, link) => [...librarians, staff.admin].forEach((s) => notify(s, type, title, message, at, { link, isRead: at < ago(1) }));
  const openLoansOf = new Map(); // bookId -> open loans
  const bookFor = (student, used) => {
    const pool = (random() < 0.75 && student.favoriteGenres.length ? byGenre[pick(student.favoriteGenres)] : null) || books;
    for (let i = 0; i < 30; i++) { const b = pick(pool); if (!used.has(String(b._id))) { used.add(String(b._id)); return b; } }
    return null;
  };
  const loan = (fields) => {
    const t = { _id: id(), renewalCount: 0, fineAmount: 0, finePaid: false, fineWaived: 0, isApproved: false, ...fields };
    t.createdAt = t.createdAt || t.issueDate; t.updatedAt = t.updatedAt || t.returnDate || t.issueDate;
    tx.push(t);
    if (['issued', 'return_requested', 'payment_pending'].includes(t.status)) openLoansOf.set(String(t.bookId), (openLoansOf.get(String(t.bookId)) || 0) + 1);
    return t;
  };
  const bookById = new Map(books.map((b) => [String(b._id), b]));
  const issueAudit = (t, student, approver) => {
    const book = bookById.get(String(t.bookId));
    if (random() < 0.3) audit(approver, 'loan.admin_issue', 'Transaction', t._id, `Issued "${book.title}" at the desk to ${label(student)}`, t.issueDate);
    else audit(approver, 'issue.approve', 'Transaction', t._id, `Approved issue of "${book.title}" for ${label(student)}`, t.issueDate);
  };
  const used = new Map(students.map((s) => [String(s._id), new Set()]));

  // ---- Past loans (returned), last ~4 months
  for (const s of active) {
    const count = [3, 6, 10, 15][s.activity];
    for (let i = 0; i < count; i++) {
      const book = bookFor(s, used.get(String(s._id)));
      if (!book) continue;
      const firstDay = Math.min(120, s.joined - 1);
      if (firstDay < 18) continue;
      const issueDate = ago(between(18, firstDay), between(0, 7));
      const renewed = random() < 0.15;
      const dueDate = new Date(issueDate.getTime() + (LOAN_DAYS + (renewed ? 7 : 0)) * DAY);
      const r = random();
      const late = r > 0.82 ? between(1, 9) : 0;
      const returnDate = late ? new Date(dueDate.getTime() + late * DAY + between(1, 6) * HOUR) : new Date(issueDate.getTime() + between(3, LOAN_DAYS - 1) * DAY + between(1, 8) * HOUR);
      if (returnDate > ago(1)) continue;
      const approver = pick(librarians);
      const fineAmount = late * FINE_PER_DAY;
      const t = loan({
        userId: s._id, bookId: book._id, status: 'returned', issueDate, dueDate, returnDate, isApproved: true, approvedBy: approver._id, approvalDate: issueDate,
        renewalCount: renewed ? 1 : 0, returnApprovedBy: pick(librarians)._id, fineAmount,
      });
      issueAudit(t, s, approver);
      notify(s, 'BOOK_ISSUED', 'Book issued', `Your request for "${book.title}" was approved. Collect it from the library. Due date: ${dueDate.toLocaleDateString('en-IN')}.`, issueDate, { link: '/student/my-books?tab=issued', meta: { transactionId: t._id, bookId: book._id } });
      if (fineAmount) {
        if (random() < 0.7) {
          Object.assign(t, { finePaid: true, paymentApprovedBy: approver._id, paymentApprovedAt: new Date(returnDate.getTime() + between(4, 40) * HOUR), paymentSubmittedAt: returnDate });
          audit(approver, 'payment.approve', 'Transaction', t._id, `Verified a fine payment of ${rupees(fineAmount)} for "${book.title}" from ${label(s)}`, t.paymentApprovedAt, { amount: fineAmount });
          notify(s, 'PAYMENT_APPROVED', 'Payment verified', `Your payment of ${rupees(fineAmount)} for "${book.title}" was verified and the book is returned.`, t.paymentApprovedAt, { link: '/student/my-books?tab=returned' });
        } else {
          const waiver = pick(librarians);
          Object.assign(t, { fineWaived: fineAmount, waiverReason: pick(WAIVER_REASONS), waivedBy: waiver._id, waivedAt: returnDate });
          audit(waiver, 'fine.waive', 'Transaction', t._id, `Waived ${rupees(fineAmount)} of the fine on "${book.title}" for ${label(s)}`, returnDate, { amount: fineAmount, reason: t.waiverReason });
          notify(s, 'FINE_WAIVED', 'Fine waived', `Fine of ${rupees(fineAmount)} waived for "${book.title}". Nothing more is due for this book.`, returnDate, { link: '/student/fines' });
        }
      }
      audit(pick(librarians), 'return.approve', 'Transaction', t._id, `Approved return of "${book.title}" from ${label(s)}`, returnDate);
      notify(s, 'RETURN_APPROVED', 'Return approved', `Your return of "${book.title}" has been approved. Thank you!`, returnDate, { link: '/student/my-books?tab=returned' });
      if (random() < 0.45) {
        const rating = pick([5, 5, 4, 4, 4, 3]);
        const at = new Date(returnDate.getTime() + between(2, 60) * HOUR);
        reviews.push({ _id: id(), userId: s._id, bookId: book._id, rating, comment: pick(REVIEW_TEXT[rating]), createdAt: at, updatedAt: at });
      }
    }
  }

  // ---- Hot books: every copy out, with waiting lists (and one copy held for Aarav)
  const hot = ['Atomic Habits', 'Designing Data-Intensive Applications', 'Sapiens', 'The Psychology of Money']
    .map((title) => books.find((b) => b.title.startsWith(title))).filter(Boolean);
  const borrowers = active.filter((s) => s !== aarav);
  hot.forEach((b, h) => {
    b.totalCopies = 2;
    for (let c = 0; c < (h === 0 ? 1 : 2); c++) {
      const s = borrowers[(h * 3 + c * 5) % borrowers.length];
      used.get(String(s._id)).add(String(b._id));
      const dueDate = ago(-between(3, 12));
      const issueDate = new Date(dueDate.getTime() - LOAN_DAYS * DAY);
      const approver = pick(librarians);
      const t = loan({ userId: s._id, bookId: b._id, status: 'issued', issueDate, dueDate, isApproved: true, approvedBy: approver._id, approvalDate: issueDate });
      issueAudit(t, s, approver);
    }
    // Waiting list
    const waiting = borrowers.filter((s) => !used.get(String(s._id)).has(String(b._id))).slice(h * 2, h * 2 + 2 + (h % 2));
    waiting.forEach((s, i) => {
      const at = ago(between(1, 6) + i, between(1, 9));
      reservations.push({ _id: id(), userId: s._id, bookId: b._id, status: 'waiting', createdAt: at, updatedAt: at });
    });
  });
  if (hot[0]) {
    // Copy returned yesterday and held for Aarav for 48 hours
    const readyAt = ago(0, 9);
    reservations.push({ _id: id(), userId: aarav._id, bookId: hot[0]._id, status: 'ready', readyAt, expiresAt: new Date(readyAt.getTime() + 48 * HOUR), createdAt: ago(9), updatedAt: readyAt });
    notify(aarav, 'RESERVATION_READY', 'Your reserved book is ready', `"${hot[0].title}" is being held for you for 48 hours. Collect it from the library desk.`, readyAt, { link: '/student/my-books?tab=reservations', meta: { bookId: hot[0]._id }, isRead: false });
  }
  if (hot[1]) {
    const at = ago(4, 3);
    reservations.push({ _id: id(), userId: aarav._id, bookId: hot[1]._id, status: 'waiting', createdAt: at, updatedAt: at });
  }
  // Reservation history
  [['fulfilled', 30], ['cancelled', 22], ['expired', 15]].forEach(([status, days], i) => {
    const s = active[(i * 4 + 2) % active.length];
    const b = pick(books);
    const at = ago(days);
    reservations.push({ _id: id(), userId: s._id, bookId: b._id, status, createdAt: at, updatedAt: ago(days - 3), ...(status === 'cancelled' ? { cancelledBy: s._id } : {}) });
  });

  // ---- Current loans: on loan (some overdue, some due today), return requests, payments, requests
  const current = (s, { dueIn, status = 'issued', renewals = 0 }) => {
    const book = bookFor(s, used.get(String(s._id)));
    if (!book) return null;
    const dueDate = new Date(startOfDay(now).getTime() + dueIn * DAY + 18 * HOUR);
    // Due in exactly a loan period = issued today (a few hours ago)
    const issueDate = dueIn === LOAN_DAYS ? ago(0, between(1, 4)) : new Date(dueDate.getTime() - (LOAN_DAYS + renewals * 7) * DAY - between(0, 5) * HOUR);
    const approver = pick(librarians);
    const t = loan({ userId: s._id, bookId: book._id, status, issueDate, dueDate, isApproved: true, approvedBy: approver._id, approvalDate: issueDate, renewalCount: renewals });
    issueAudit(t, s, approver);
    notify(s, 'BOOK_ISSUED', 'Book issued', `Your request for "${book.title}" was approved. Collect it from the library. Due date: ${dueDate.toLocaleDateString('en-IN')}.`, issueDate, { link: '/student/my-books?tab=issued', meta: { transactionId: t._id, bookId: book._id } });
    if (dueIn < 0 && status === 'issued') notify(s, 'BOOK_OVERDUE', 'Book overdue', `"${book.title}" was due on ${dueDate.toLocaleDateString('en-IN')}. A fine of ${rupees(FINE_PER_DAY)} a day applies until it is returned.`, ago(Math.max(0, -dueIn - 1)), { link: '/student/my-books?tab=issued' });
    else if (dueIn >= 0 && dueIn <= 2 && status === 'issued') notify(s, 'DUE_DATE_REMINDER', 'Due soon', `"${book.title}" is due on ${dueDate.toLocaleDateString('en-IN')}. Return or renew it in time to avoid a fine.`, ago(0, 6), { link: '/student/my-books?tab=issued', isRead: false });
    return { t, book };
  };
  // Aarav: one overdue, one due in 5 days (renewed once)
  current(aarav, { dueIn: -3 });
  current(aarav, { dueIn: 5, renewals: 1 });
  const dueOffsets = [-12, -7, -5, -2, -1, 0, 0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14];
  active.slice(1).forEach((s, i) => {
    const n = Math.min(3, s.activity + (i % 2));
    for (let k = 0; k < n; k++) current(s, { dueIn: dueOffsets[(i * 3 + k * 7) % dueOffsets.length], renewals: (i + k) % 6 === 0 ? 1 : 0 });
  });

  // Return requests (one with a fine for Aarav: the Pay fine screen)
  const returnRequest = (s, lateDays, { pay = false, isRead } = {}) => {
    const made = current(s, { dueIn: -lateDays });
    if (!made) return null;
    const { t, book } = made;
    const fine = lateDays > 0 ? lateDays * FINE_PER_DAY : 0;
    Object.assign(t, { status: 'return_requested', returnRequestedAt: ago(0, between(3, 20)), fineAmount: fine, updatedAt: ago(0, 2) });
    notify(s, 'RETURN_REQUESTED', 'Return requested', fine ? `Your return request for "${book.title}" was sent. A fine of ${rupees(fine)} is due; pay it so the library can complete the return.` : `Your return request for "${book.title}" was sent.`, t.returnRequestedAt, { link: fine ? '/student/fines' : '/student/my-books?tab=return_requested', isRead });
    staffNotify('RETURN_REQUEST', 'Return request', `${s.name} wants to return "${book.title}".${fine ? ` Fine: ${rupees(fine)}.` : ' No fine.'}`, t.returnRequestedAt, '/librarian/pending?tab=return');
    if (fine) notify(s, 'FINE_GENERATED', 'Fine due', `A fine of ${rupees(fine)} is due for "${book.title}" (${lateDays} day${lateDays === 1 ? '' : 's'} late).`, t.returnRequestedAt, { link: '/student/fines', isRead });
    if (pay && fine) {
      Object.assign(t, { status: 'payment_pending', paymentSubmittedAt: ago(0, between(1, 3)) });
      staffNotify('PAYMENT_PENDING', 'Payment to verify', `${s.name} paid ${rupees(fine)} for "${book.title}". Please verify the payment.`, t.paymentSubmittedAt, '/librarian/pending?tab=payment');
    }
    return t;
  };
  returnRequest(aarav, 4, { isRead: false });
  returnRequest(students[1], 0);
  returnRequest(students[5], 2);
  returnRequest(students[8], 0);
  const paying = [returnRequest(students[2], 6, { pay: true }), returnRequest(students[12], 3, { pay: true })].filter(Boolean);
  for (const [i, t] of paying.entries()) t.paymentScreenshot = await receiptImage(t.fineAmount, `40${2718 + i * 911}55${i}`);

  // Issue requests waiting for approval
  [aarav, students[3], students[6], students[9], students[13], students[17], students[20]].forEach((s, i) => {
    const book = bookFor(s, used.get(String(s._id)));
    if (!book) return;
    const at = ago(0, 1 + i * 3);
    loan({ userId: s._id, bookId: book._id, status: 'pending', issueDate: at, dueDate: new Date(at.getTime() + LOAN_DAYS * DAY), createdAt: at, updatedAt: at });
    notify(s, 'ISSUE_REQUEST', 'Request sent', `Your request for "${book.title}" was sent to the library and is waiting for approval.`, at, { link: '/student/my-books?tab=pending' });
    staffNotify('PENDING_APPROVAL', 'New book request', `${s.name} requested "${book.title}".`, at, '/librarian/pending?tab=issue');
  });
  // Rejected requests
  [aarav, students[7], students[10]].forEach((s, i) => {
    const book = bookFor(s, used.get(String(s._id)));
    if (!book) return;
    const at = ago(10 + i * 9);
    const rejecter = pick(librarians);
    loan({ userId: s._id, bookId: book._id, status: 'rejected', issueDate: at, dueDate: new Date(at.getTime() + LOAN_DAYS * DAY), createdAt: at, updatedAt: new Date(at.getTime() + 5 * HOUR) });
    audit(rejecter, 'issue.reject', 'Transaction', tx[tx.length - 1]._id, `Rejected the request for "${book.title}" from ${label(s)}`, new Date(at.getTime() + 5 * HOUR));
    notify(s, 'ISSUE_REJECTED', 'Request rejected', `Your request for "${book.title}" was rejected. Please contact the library for details.`, new Date(at.getTime() + 5 * HOUR), { link: '/student/my-books?tab=rejected' });
  });

  // ---- Wishlists
  students.forEach((s, i) => {
    if (!s.isOnboardingCompleted) return;
    const n = s === aarav ? 6 : i % 3 === 0 ? 3 : i % 3 === 1 ? 1 : 0;
    const set = new Set();
    for (let k = 0; k < n * 3 && set.size < n; k++) { const b = pick((s.favoriteGenres.length ? byGenre[pick(s.favoriteGenres)] : null) || books); set.add(String(b._id)); }
    if (s === aarav && hot[2]) set.add(String(hot[2]._id));
    s.wishlist = [...set].map((x) => new mongoose.Types.ObjectId(x));
  });
  if (hot[3]) notify(aarav, 'BACK_IN_STOCK', 'Back in stock', `"${hot[3].title}" is on the shelf again. Request it before someone else does.`, ago(12), { link: '/student/wishlist' });
  notify(aarav, 'NEW_RECOMMENDATIONS', 'New picks for you', 'We found new books that match your favourite genres. Have a look on your dashboard.', ago(3), { link: '/student/dashboard' });
  notify(aarav, 'CARD_UPDATED', 'Your library card', 'Your digital library card is ready. Show its QR code at the desk to borrow and return books.', ago(139), { link: '/student/profile?tab=card' });

  // ---- Staff side: new members, low stock, catalogue work, reminders, an import
  students.filter((s) => s.joined <= 30).forEach((s) => {
    staffNotify('NEW_MEMBER', 'New member', `${s.name} (${s.libraryId}) joined the library.`, s.createdAt, `/librarian/users/${s._id}`);
  });
  hot.slice(0, 2).forEach((b, i) => staffNotify('LOW_STOCK', 'Low stock', `"${b.title}" has no copies on the shelf and ${2 + i} students waiting.`, ago(i + 1, 4), `/librarian/books/${b._id}`));
  librarians.forEach((l) => audit(staff.admin, 'user.create', 'User', l._id, `Created librarian account for ${label(l)}`, new Date(l.createdAt.getTime() + HOUR)));
  books.filter((b) => b.createdAt > ago(20)).forEach((b) => audit(pick([...librarians, staff.admin]), 'book.create', 'Book', b._id, `Added "${b.title}" by ${b.author} (${b.totalCopies} cop${b.totalCopies === 1 ? 'y' : 'ies'})`, b.createdAt, { genre: b.genre, totalCopies: b.totalCopies }));
  for (let i = 0; i < 6; i++) {
    const b = pick(books);
    audit(pick(librarians), 'book.update', 'Book', b._id, `Edited "${b.title}": ${pick(['location', 'totalCopies, availableCopies', 'description', 'imageUrl'])}`, ago(between(2, 60)));
  }
  audit(staff.admin, 'book.import', 'System', undefined, 'Imported 24 books (61 copies) from CSV, 2 rows skipped', ago(158), { imported: 24, skipped: 2, copies: 61 });
  [1, 8, 15, 22].forEach((d) => audit(pick(librarians), 'reminders.send', 'System', undefined, `Sent reminders manually: ${between(2, 6)} due soon, ${between(1, 4)} overdue`, ago(d, 5)));
  audit(staff.admin, 'user.deactivate', 'User', students.find((s) => s.name === DEACTIVATED)._id, `Deactivated ${label(students.find((s) => s.name === DEACTIVATED))}`, ago(20));
  audit(staff.admin, 'user.card_reissue', 'User', students[4]._id, `Reissued the library card of ${label(students[4])} (version 2)`, ago(33));
  students[4].cardVersion = 2;

  // ---- Stock: issued = open loans, held = ready reservations, available = the rest
  const heldBy = new Map();
  reservations.filter((r) => r.status === 'ready').forEach((r) => heldBy.set(String(r.bookId), (heldBy.get(String(r.bookId)) || 0) + 1));
  books.forEach((b) => {
    b.issuedCopies = openLoansOf.get(String(b._id)) || 0;
    b.heldCopies = heldBy.get(String(b._id)) || 0;
    b.totalCopies = Math.max(b.totalCopies, b.issuedCopies + b.heldCopies);
    b.availableCopies = b.totalCopies - b.issuedCopies - b.heldCopies;
    b.restockAlertPending = b.availableCopies === 0;
  });
  // Fines still owed per member (return requested / payment pending, not waived)
  students.forEach((s) => {
    s.fineAmount = tx.filter((t) => String(t.userId) === String(s._id) && ['return_requested', 'payment_pending'].includes(t.status))
      .reduce((sum, t) => sum + Math.max(0, (t.fineAmount || 0) - (t.fineWaived || 0)), 0);
  });

  const strip = ({ activity, joined, ...doc }) => doc;
  return {
    staff,
    students,
    aarav,
    hot,
    newMember: students.find((s) => s.name === NEW_MEMBER),
    users: [...Object.values(staff), ...students.map(strip)],
    tx,
    reservations,
    reviews,
    notes,
    audits,
    seq,
  };
};

module.exports = { buildDemoData, bindModels, rng, startOfDay, SEED, DEMO_PASSWORD };
