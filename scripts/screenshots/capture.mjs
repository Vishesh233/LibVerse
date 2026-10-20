// Captures every screen per role (desktop 1440x900 @2x) and the key ones on a phone (390x844 @2x).
// The committed images are docs/screenshots/<group>/NN-name.webp (+ manifest.json); the full-size PNGs
// they are made from go to docs/.screenshots-png/ (gitignored) for the showcase renderer.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { sleep } from './browser.mjs';
import { APP, API, DEMO_APP, ROOT, session, demoSession, markDemoAccounts } from './stack.mjs';

export const SHOTS_DIR = path.join(ROOT, 'docs', 'screenshots');
export const PNG_DIR = path.join(ROOT, 'docs', '.screenshots-png');
// The covers the splash falls back to when there is no cache (the API may be asleep)
const SPLASH_COVERS = JSON.parse(readFileSync(path.join(ROOT, 'frontend', 'src', 'data', 'splashCovers.json'), 'utf8'));
// The WebP copy is made from the same PNG frame (sharp is already a backend dependency)
const sharp = createRequire(path.join(ROOT, 'backend', 'package.json'))('sharp');
const DESKTOP = { width: 1440, height: 900, scale: 2, mobile: false, label: '1440x900@2x' };
const PHONE = { width: 390, height: 844, scale: 2, mobile: true, label: '390x844@2x' };

/** The screens. who: null (signed out) | key of the sessions below; act: runs after the page loads */
const screens = ({ ids, labelIds }) => [
  // 01 Public
  { group: '01-public', file: '01-splash', role: 'public', page: 'Splash', who: null, path: '/login', splash: true, caption: 'Opening splash with a live wall of covers from the catalogue.' },
  { group: '01-public', file: '02-login', role: 'public', page: 'Sign in', who: null, path: '/login', caption: 'Sign-in page for students, librarians and admins.' },
  { group: '01-public', file: '03-signup', role: 'public', page: 'Sign up', who: null, path: '/signup', caption: 'Students create their own account and get a Library ID straight away.' },
  { group: '01-public', file: '04-onboarding', role: 'student', page: 'Onboarding', who: 'newStudent', path: '/student/onboarding', caption: 'First sign-in: pick favourite genres for personalised picks.' },
  { group: '01-public', file: '05-login-email-code', role: 'public', page: 'Sign in with an email code', who: null, path: '/login', act: "[...document.querySelectorAll('[role=tab]')].find((t) => t.innerText.trim() === 'Email code')?.click()", caption: 'Passwordless sign-in: enter your email and get a 6-digit code (Password / Email code tabs).' },
  { group: '01-public', file: '06-demo-picker', role: 'demo', page: 'Live demo', who: null, base: 'demo', path: '/login', caption: 'The live demo: View as Student, Librarian or Admin with no sign-up, and a top-right link to create a real account.' },
  { group: '01-public', file: '07-demo-dashboard', role: 'demo', page: 'Live demo: student view', who: 'demoStudent', base: 'demo', path: '/student/dashboard', caption: 'Inside the demo: a banner says the data resets every 6 hours.' },
  { group: '01-public', file: '08-privacy', role: 'public', page: 'Privacy policy', who: null, path: '/privacy', caption: 'Plain-language privacy policy (the terms of use are next to it).' },
  // 02 Student
  { group: '02-student', file: '01-dashboard', role: 'student', page: 'Dashboard', who: 'student', path: '/student/dashboard', caption: 'Student dashboard: loans, due dates, fines and AI "Picked for you" suggestions with reasons.' },
  { group: '02-student', file: '02-books', role: 'student', page: 'Browse books', who: 'student', path: '/student/books', caption: 'Catalogue of 500+ books with search, genre and availability filters.' },
  { group: '02-student', file: '03-book-details', role: 'student', page: 'Book details', who: 'student', path: `/student/books/${ids.reviewedBook}`, caption: 'Book page: availability, request or reserve, wishlist and reader reviews.' },
  { group: '02-student', file: '04-my-books-issued', role: 'student', page: 'My books: issued', who: 'student', path: '/student/my-books?tab=issued', caption: 'Books on loan with due dates, overdue fines building up, renew and return.' },
  { group: '02-student', file: '05-my-books-pending', role: 'student', page: 'My books: requests', who: 'student', path: '/student/my-books?tab=pending', caption: 'Requests waiting for a librarian to approve.' },
  { group: '02-student', file: '06-my-books-history', role: 'student', page: 'My books: returned', who: 'student', path: '/student/my-books?tab=returned', caption: 'Reading history with fines paid or waived.' },
  { group: '02-student', file: '07-reservations', role: 'student', page: 'Reservations', who: 'student', path: '/student/my-books?tab=reservations', caption: 'Waiting-list places, and a copy held for 48 hours when it is your turn.' },
  { group: '02-student', file: '08-wishlist', role: 'student', page: 'Wishlist', who: 'student', path: '/student/wishlist', caption: 'Wishlist with back-in-stock alerts.' },
  { group: '02-student', file: '09-fines', role: 'student', page: 'Fines', who: 'student', path: '/student/fines', caption: 'Fines owed, building up and settled, with a clear total.' },
  { group: '02-student', file: '10-pay-fine', role: 'student', page: 'Pay fine', who: 'student', path: `/student/pay-fine/${ids.payableFine}`, caption: 'Pay a fine by UPI QR and upload the receipt for the library to verify.' },
  { group: '02-student', file: '11-notifications', role: 'student', page: 'Notifications', who: 'student', path: '/student/notifications', caption: 'Notifications for approvals, due dates, fines and reservations.' },
  { group: '02-student', file: '12-profile', role: 'student', page: 'Profile', who: 'student', path: '/student/profile?tab=personal', caption: 'Profile with avatar, contact details and account summary.' },
  { group: '02-student', file: '13-reading-stats', role: 'student', page: 'Reading stats', who: 'student', path: '/student/profile?tab=reading', caption: 'Reading stats: books read, favourite genres and on-time returns.' },
  { group: '02-student', file: '14-preferences', role: 'student', page: 'Reading preferences', who: 'student', path: '/student/profile?tab=preferences', caption: 'Favourite genres that drive the recommendations.' },
  { group: '02-student', file: '15-library-card-front', role: 'student', page: 'Library card (front)', who: 'student', path: '/student/profile?tab=card', caption: 'Digital library card with a signed QR code for the desk.' },
  { group: '02-student', file: '16-library-card-back', role: 'student', page: 'Library card (back)', who: 'student', path: '/student/profile?tab=card', flip: true, caption: 'Back of the card: lending rules and member details.' },
  // 03 Librarian
  { group: '03-librarian', file: '01-dashboard', role: 'librarian', page: 'Dashboard', who: 'librarian', path: '/librarian', caption: 'Librarian control room: live queues, today at a glance and a 14-day activity trend.' },
  { group: '03-librarian', file: '02-requests-issue', role: 'librarian', page: 'Requests: issue', who: 'librarian', path: '/librarian/pending?tab=issue', caption: 'Issue requests to approve or reject.' },
  { group: '03-librarian', file: '03-requests-return', role: 'librarian', page: 'Requests: returns', who: 'librarian', path: '/librarian/pending?tab=return', caption: 'Return requests with any fine worked out.' },
  { group: '03-librarian', file: '04-requests-payment', role: 'librarian', page: 'Requests: payments', who: 'librarian', path: '/librarian/pending?tab=payment', caption: 'Fine payments with receipts waiting for verification.' },
  { group: '03-librarian', file: '05-requests-reservations', role: 'librarian', page: 'Requests: reservations', who: 'librarian', path: '/librarian/pending?tab=reservations', caption: 'Waiting lists per book.' },
  { group: '03-librarian', file: '06-issue-return', role: 'librarian', page: 'Issue & return', who: 'librarian', path: '/librarian/issue-return', caption: 'Counter workflow: find the student and the book, pick a due date, issue.' },
  { group: '03-librarian', file: '07-return-desk', role: 'librarian', page: 'Return at the desk', who: 'librarian', path: '/librarian/issue-return?tab=return', caption: 'Books out now, soonest due first, with late fines shown before the return.' },
  { group: '03-librarian', file: '08-scan-desk', role: 'librarian', page: 'Scan desk', who: 'librarian', path: '/librarian/scan', caption: 'Scan desk: scan a library card and a book QR to issue or return in seconds.' },
  { group: '03-librarian', file: '09-manage-books', role: 'librarian', page: 'Manage books', who: 'librarian', path: '/librarian/books', caption: 'Books table: sortable columns, stock at a glance, low-stock filter and bulk actions.' },
  { group: '03-librarian', file: '10-qr-labels', role: 'librarian', page: 'QR labels', who: 'librarian', path: `/librarian/books/labels?ids=${labelIds.join(',')}`, caption: 'Printable QR shelf labels for selected books.' },
  { group: '03-librarian', file: '11-users', role: 'librarian', page: 'Users', who: 'librarian', path: '/librarian/users', caption: 'Members with loans, overdue books and fines owed; rows open Student 360.' },
  { group: '03-librarian', file: '12-student-360', role: 'librarian', page: 'Student 360', who: 'librarian', path: `/librarian/users/${ids.aarav}`, caption: 'Student 360: everything about one member, with actions.' },
  // 04 Admin
  { group: '04-admin', file: '01-dashboard', role: 'admin', page: 'Dashboard', who: 'admin', path: '/admin', caption: 'Admin dashboard: library health, circulation and staff activity.' },
  { group: '04-admin', file: '02-analytics', role: 'admin', page: 'Analytics', who: 'admin', path: '/admin/analytics', caption: 'Analytics: borrowing trends, genres and member activity.' },
  { group: '04-admin', file: '03-reports-loans', role: 'admin', page: 'Reports: loans', who: 'admin', path: '/admin/reports?tab=loans', caption: 'Reports with summary cards and CSV export: loans.' },
  { group: '04-admin', file: '04-reports-fines', role: 'admin', page: 'Reports: fines', who: 'admin', path: '/admin/reports?tab=fines', caption: 'Fines fixed, paid and waived in a period.' },
  { group: '04-admin', file: '05-reports-overdue', role: 'admin', page: 'Reports: overdue', who: 'admin', path: '/admin/reports?tab=overdue', caption: 'Overdue loans by age.' },
  { group: '04-admin', file: '06-reports-top', role: 'admin', page: 'Reports: top books', who: 'admin', path: '/admin/reports?tab=top', caption: 'Most borrowed books.' },
  { group: '04-admin', file: '07-reports-staff', role: 'admin', page: 'Reports: staff activity', who: 'admin', path: '/admin/reports?tab=staff', caption: 'Loan actions per staff member from the audit log.' },
  { group: '04-admin', file: '08-audit-log', role: 'admin', page: 'Audit log', who: 'admin', path: '/admin/audit', caption: 'Audit log of every staff action, filterable and exportable.' },
  { group: '04-admin', file: '09-settings', role: 'admin', page: 'Settings', who: 'admin', path: '/admin/settings?tab=security', caption: 'Settings: password change signs out every other session.' },
];
// The six phone screens
const PHONE_SCREENS = [
  ['01-login', '02-login', 'Sign in on a phone.'],
  ['02-student-dashboard', '01-dashboard', 'Student dashboard on a phone.', '02-student'],
  ['03-book-details', '03-book-details', 'Book page on a phone.', '02-student'],
  ['04-my-books', '04-my-books-issued', 'My books on a phone.', '02-student'],
  ['05-library-card', '15-library-card-front', 'Library card on a phone, ready to scan at the desk.', '02-student'],
  ['06-librarian-dashboard', '01-dashboard', 'Librarian dashboard on a phone.', '03-librarian'],
  ['07-demo-picker', '06-demo-picker', 'The live demo role picker on a phone.'],
];

export async function capture(browser, { demo, log = console.log }) {
  const { accounts, ids } = demo;
  const sessions = {
    student: await session(accounts.student, accounts.password),
    newStudent: await session(accounts.newStudent, accounts.password),
    librarian: await session(accounts.librarian, accounts.password),
    admin: await session(accounts.admin, accounts.password),
  };
  const labelIds = (await (await fetch(`${API}/books?limit=6&sort=title&genre=Programming`)).json()).books.map((b) => b._id);
  const list = screens({ ids, labelIds });

  rmSync(SHOTS_DIR, { recursive: true, force: true });
  rmSync(PNG_DIR, { recursive: true, force: true });
  const manifest = [];
  const problems = [];
  const baseOf = (screen) => (screen.base === 'demo' ? DEMO_APP : APP);

  const signIn = async (who, { splash = false, base = APP } = {}) => {
    await browser.goto(`${base}/login`);
    // This first load may play the splash, which marks itself as shown when it ends: let it end first
    if (splash) await sleep(2500);
    const s = who ? sessions[who] : null;
    await browser.evaluate(`(() => { localStorage.clear(); sessionStorage.clear();
      ${splash ? '' : "sessionStorage.setItem('libverse:splash-shown', '1');"}
      ${s ? `localStorage.setItem('token', ${JSON.stringify(s.token)}); localStorage.setItem('user', ${JSON.stringify(JSON.stringify(s.user))});` : ''} })()`);
  };

  const take = async (screen, vp, group, file) => {
    await browser.viewport(vp.width, vp.height, { scale: vp.scale, mobile: vp.mobile });
    const base = baseOf(screen);
    await signIn(screen.who, { splash: screen.splash, base });
    browser.errors.length = 0;
    if (screen.splash) {
      // The splash runs for 1.8 s from its first frame: shoot it mid-way
      await browser.navigate(APP + screen.path);
      for (let i = 0; i < 100 && !(await browser.evaluate("!!document.querySelector('.splash-book')").catch(() => false)); i++) await sleep(50);
      // ...once its title has faded in and the progress bar is about half way (before the exit starts)
      // ...and several covers have loaded (the wall starts from the bundled list, so this needs no API)
      const ready = "(() => { const el = document.querySelector('.splash-inner'); const bar = document.querySelector('.splash-progress-slim');"
        + " const covers = document.querySelectorAll('.splash-cover.is-loaded').length;"
        + " return !!el && Number(getComputedStyle(el).opacity) > 0.97 && Number(bar?.getAttribute('aria-valuenow') || 0) >= 45 && covers >= 8; })()";
      for (let i = 0; i < 80 && !(await browser.evaluate(ready).catch(() => false)); i++) await sleep(25);
      const covers = await browser.evaluate("document.querySelectorAll('.splash-cover.is-loaded').length").catch(() => 0);
      if (covers < 8) problems.push(`${group}/${file}: only ${covers} covers visible in the splash`);
    } else {
      await browser.goto(base + screen.path);
      await sleep(1800);
      if (screen.act) { await browser.evaluate(screen.act); await sleep(700); }
      await browser.imagesSettled(12000);
      if (screen.flip) {
        await browser.evaluate("document.querySelector('[aria-label^=\"Library card, showing\"]')?.click()");
        await sleep(1200);
      }
      // Charts and count-up numbers finish animating
      await sleep(900);
    }
    const state = await browser.evaluate(`(() => ({ path: location.pathname, overflow: document.documentElement.scrollWidth > innerWidth + 1, text: document.body.innerText.length }))()`);
    const expected = screen.path.split('?')[0];
    if (state.path !== expected) problems.push(`${group}/${file}: ended on ${state.path}, expected ${expected}`);
    if (state.overflow) problems.push(`${group}/${file}: horizontal overflow`);
    if (browser.errors.length) problems.push(`${group}/${file}: console errors: ${browser.errors.slice(0, 2).join(' | ')}`);
    const pngFile = path.join(PNG_DIR, group, `${file}.png`);
    const webpFile = path.join(SHOTS_DIR, group, `${file}.webp`);
    await browser.shot(pngFile);
    mkdirSync(path.dirname(webpFile), { recursive: true });
    await sharp(pngFile).webp({ quality: 88 }).toFile(webpFile);
    manifest.push({ file: `${group}/${file}.webp`, role: screen.role, page: screen.page, viewport: vp.label, caption: screen.caption });
    log(`  ${group}/${file}`);
  };

  // The full app's screens first; then the demo site's (its accounts are marked isDemo only now, so the
  // demo banner never shows on the screens above); the splash last, after warming the cover images
  for (const screen of list.filter((s) => !s.splash && !s.base)) await take(screen, DESKTOP, screen.group, screen.file);
  await markDemoAccounts([accounts.student, accounts.librarian, accounts.admin]);
  sessions.demoStudent = await demoSession('student');
  for (const screen of list.filter((s) => !s.splash && s.base)) await take(screen, DESKTOP, screen.group, screen.file);
  await browser.goto(`${APP}/login`);
  await browser.evaluate(`Promise.all(${JSON.stringify(SPLASH_COVERS)}.map((u) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = u; })))`);
  for (const screen of list.filter((s) => s.splash)) await take(screen, DESKTOP, screen.group, screen.file);
  manifest.sort((a, b) => a.file.localeCompare(b.file));
  for (const [file, source, caption, sourceGroup = '01-public'] of PHONE_SCREENS) {
    const screen = list.find((s) => s.file === source && s.group === sourceGroup);
    await take({ ...screen, caption }, PHONE, '05-mobile', file);
  }

  mkdirSync(SHOTS_DIR, { recursive: true });
  writeFileSync(path.join(SHOTS_DIR, 'manifest.json'), `${JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), screens: manifest }, null, 2)}\n`);
  return { manifest, problems };
}
