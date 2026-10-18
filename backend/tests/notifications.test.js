// Notifications (created by events, read state, ownership, categories) and the reminder job
const mongoose = require('mongoose');
const { as, connect, disconnect, reset, makeUser, makeBook, makeLoan, DAY } = require('./helpers');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const JobLock = require('../models/JobLock');
const { runReminders, DUE_SOON_DAYS } = require('../jobs/reminders');

let student; let other; let lib; let admin;
beforeAll(connect);
afterAll(disconnect);
beforeEach(async () => {
  await reset();
  [student, other, lib, admin] = [await makeUser('student'), await makeUser('student'), await makeUser('librarian'), await makeUser('admin')];
});

test('a request notifies the student and every active staff member', async () => {
  const book = await makeBook();
  expect((await as(student).post('/api/transactions/issue').send({ bookId: book._id })).status).toBe(201);
  expect(await Notification.countDocuments({ userId: student._id })).toBe(1);
  expect(await Notification.countDocuments({ userId: lib._id })).toBe(1);
  expect(await Notification.countDocuments({ userId: admin._id })).toBe(1);
  expect(await Notification.countDocuments({ userId: other._id })).toBe(0);
});

test('list, unread count, mark one / all read; nobody can read or mark another user\'s', async () => {
  await makeBook().then((b) => as(student).post('/api/transactions/issue').send({ bookId: b._id }));
  await makeBook().then((b) => as(student).post('/api/transactions/issue').send({ bookId: b._id }));
  const list = await as(student).get('/api/notifications');
  expect(list.status).toBe(200);
  expect(list.body.notifications).toHaveLength(2);
  expect(list.body.unreadCount).toBe(2);
  const first = list.body.notifications[0]._id;

  expect((await as(other).put(`/api/notifications/read/${first}`)).status).toBe(404);
  expect((await as(other).get('/api/notifications')).body.notifications).toHaveLength(0);

  const one = await as(student).put(`/api/notifications/read/${first}`);
  expect(one.status).toBe(200);
  expect(one.body.unreadCount).toBe(1);
  expect((await as(student).put(`/api/notifications/read/${new mongoose.Types.ObjectId()}`)).status).toBe(404);

  expect((await as(student).put('/api/notifications/read-all')).status).toBe(200);
  expect((await as(student).get('/api/notifications?unread=true')).body.notifications).toHaveLength(0);
});

test('category filter and paging', async () => {
  for (let i = 0; i < 3; i++) await makeBook().then((b) => as(student).post('/api/transactions/issue').send({ bookId: b._id }));
  const page = await as(student).get('/api/notifications?limit=2&page=2');
  expect(page.body).toMatchObject({ total: 3, page: 2, pages: 2 });
  expect(page.body.notifications).toHaveLength(1);
  expect((await as(student).get('/api/notifications?category=reservation')).body.notifications).toHaveLength(0);
});

test('staff broadcast notification route is staff-only', async () => {
  expect((await as(student).post('/api/notifications/admin').send({ type: 'SYSTEM_ACTIVITY', title: 'x', message: 'x' })).status).toBe(403);
  expect((await as(lib).post('/api/notifications/admin').send({ type: 'SYSTEM_ACTIVITY', title: 'x', message: 'x' })).status).toBe(201);
});

describe('reminders', () => {
  test('due-soon and overdue reminders are sent once each', async () => {
    const soon = await makeLoan(student, await makeBook(), { dueInDays: DUE_SOON_DAYS - 1 });
    const late = await makeLoan(other, await makeBook(), { dueInDays: -2 });
    await makeLoan(other, await makeBook(), { dueInDays: 20 }); // not due soon

    const first = await runReminders({ force: true });
    expect(first).toMatchObject({ skipped: false, dueSoon: 1, overdue: 1 });
    expect((await Transaction.findById(soon._id).lean()).remindersSent.dueSoon).toBeTruthy();
    expect((await Transaction.findById(late._id).lean()).remindersSent.overdue).toBeTruthy();
    expect(await Notification.countDocuments({ userId: student._id, type: 'DUE_DATE_REMINDER' })).toBe(1);
    expect(await Notification.countDocuments({ userId: other._id, type: 'BOOK_OVERDUE' })).toBe(1);

    const again = await runReminders({ force: true });
    expect(again).toMatchObject({ dueSoon: 0, overdue: 0 });
  });

  test('the scheduled run happens at most once per day', async () => {
    await JobLock.deleteMany({});
    const now = new Date('2026-06-15T06:30:00Z'); // midday in the library's time zone: +1 h stays on the same day
    const a = await runReminders({ now });
    const b = await runReminders({ now: new Date(now.getTime() + 60 * 60 * 1000) });
    expect(a.skipped).toBe(false);
    expect(b.skipped).toBe(true);
  });

  test('staff can send reminders by hand; students cannot', async () => {
    await makeLoan(student, await makeBook(), { dueInDays: -1, issuedDaysAgo: 15 });
    expect((await as(student).post('/api/admin/send-reminders')).status).toBe(403);
    const r = await as(lib).post('/api/admin/send-reminders');
    expect(r.status).toBe(200);
    expect(await Notification.countDocuments({ userId: student._id, type: 'BOOK_OVERDUE' })).toBe(1);
  });
});

test('reminder days constant is sane', () => {
  expect(DUE_SOON_DAYS).toBeGreaterThan(0);
  expect(DAY).toBe(86400000);
});
