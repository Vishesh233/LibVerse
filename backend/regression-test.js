const http = require('http');

const BASE_URL = 'http://localhost:5001';
const results = [];
let passed = 0;
let failed = 0;

function makeRequest(method, endpoint, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  if (ok) passed++; else failed++;
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
}

async function run() {
  console.log('=== COMPREHENSIVE REGRESSION TEST ===\n');
  const startTime = Date.now();

  try {
    // ===== SETUP: Login as admin =====
    console.log('--- Setup: Login ---');
    const adminLogin = await makeRequest('POST', '/api/auth/login', { email: 'testadmin@example.com', password: 'Test123!' });
    if (!adminLogin.data.success) {
      console.log('FATAL: Could not login admin.');
      process.exit(1);
    }
    const adminToken = adminLogin.data.token;
    console.log('  Admin login OK\n');

    // ===== TEST: Create Book =====
    console.log('--- TEST: Create Book ---');
    const uniqueIsbn = `TEST-${Date.now()}`;
    const createBookData = {
      title: `Regression Test Book ${Date.now()}`,
      author: 'Test Author',
      genre: 'Programming',
      isbn: uniqueIsbn,
      publisher: 'Test Publisher',
      publicationYear: 2024,
      description: 'A test book created for regression testing',
      totalCopies: 5,
      availableCopies: 5,
      issuedCopies: 0,
      rating: 4.5,
    };
    const createRes = await makeRequest('POST', '/api/books', createBookData, adminToken);
    record('Create Book - success response', createRes.status === 201 && createRes.data.success, `status=${createRes.status}, msg=${createRes.data.message || ''}`);
    const createdBookId = createRes.data.success ? createRes.data.book._id : null;
    record('Create Book - book has _id', !!createdBookId, createdBookId || 'no id');
    record('Create Book - book has qrCode', createRes.data.success && !!createRes.data.book.qrCode, createRes.data.book?.qrCode ? 'QR generated' : 'no QR');
    console.log('');

    // ===== TEST: Edit Book =====
    console.log('--- TEST: Edit Book ---');
    if (createdBookId) {
      const editRes = await makeRequest('PUT', `/api/books/${createdBookId}`, { title: 'Updated Regression Test Book', totalCopies: 10 }, adminToken);
      record('Edit Book - success response', editRes.status === 200 && editRes.data.success, `status=${editRes.status}, msg=${editRes.data.message || ''}`);
      record('Edit Book - title updated', editRes.data.success && editRes.data.book.title === 'Updated Regression Test Book', editRes.data.book?.title || '');
    } else {
      record('Edit Book - skipped (no book id)', false, 'create failed');
    }
    console.log('');

    // ===== TEST: Search Books =====
    console.log('--- TEST: Search Books ---');
    const searchRes = await makeRequest('GET', '/api/books?title=Regression&limit=10');
    record('Search Books - success response', searchRes.status === 200 && searchRes.data.success, `status=${searchRes.status}`);
    record('Search Books - found results', searchRes.data.success && searchRes.data.books.length > 0, `found ${searchRes.data.books?.length || 0} books`);
    console.log('');

    // ===== TEST: Delete Book =====
    console.log('--- TEST: Delete Book ---');
    if (createdBookId) {
      const delRes = await makeRequest('DELETE', `/api/books/${createdBookId}`, null, adminToken);
      record('Delete Book - success response', delRes.status === 200 && delRes.data.success, `status=${delRes.status}, msg=${delRes.data.message || ''}`);
    } else {
      record('Delete Book - skipped (no book id)', false, 'create failed');
    }
    console.log('');

    // ===== TEST: Notifications - Mark as Read =====
    console.log('--- TEST: Notifications ---');
    // Get notifications for admin
    const adminNotifRes = await makeRequest('GET', '/api/notifications', null, adminToken);
    record('Notifications - get list', adminNotifRes.status === 200 && adminNotifRes.data.success, `status=${adminNotifRes.status}`);
    const notifList = adminNotifRes.data.success ? adminNotifRes.data.notifications : [];
    record('Notifications - has unread count', adminNotifRes.data.success && typeof adminNotifRes.data.unreadCount === 'number', `unreadCount=${adminNotifRes.data.unreadCount}`);

    // Test mark as read with notificationId
    if (notifList.length > 0) {
      const notif = notifList[0];
      const markRes = await makeRequest('PUT', `/api/notifications/read/${notif.notificationId}`, null, adminToken);
      record('Notifications - mark as read by notificationId', markRes.status === 200 && markRes.data.success, `status=${markRes.status}, msg=${markRes.data.message || ''}`);
    } else {
      record('Notifications - mark as read (no notifications to test)', false, 'no notifications found');
    }

    // Test mark all as read
    const markAllRes = await makeRequest('PUT', '/api/notifications/read-all', null, adminToken);
    record('Notifications - mark all as read', markAllRes.status === 200 && markAllRes.data.success, `status=${markAllRes.status}, msg=${markAllRes.data.message || ''}`);
    console.log('');

    // ===== TEST: Dashboard =====
    console.log('--- TEST: Admin Dashboard ---');
    const dashRes = await makeRequest('GET', '/api/admin/dashboard', null, adminToken);
    record('Admin Dashboard - success response', dashRes.status === 200 && dashRes.data.success, `status=${dashRes.status}`);
    record('Admin Dashboard - has analytics', dashRes.data.success && dashRes.data.analytics, `totalBooks=${dashRes.data.analytics?.totalBooks}`);
    console.log('');

    // ===== TEST: Reports =====
    console.log('--- TEST: Admin Reports ---');
    const reportsRes = await makeRequest('GET', '/api/admin/reports', null, adminToken);
    record('Admin Reports - success response', reportsRes.status === 200 && reportsRes.data.success, `status=${reportsRes.status}`);
    record('Admin Reports - has reports data', reportsRes.data.success && reportsRes.data.reports, `totalBooksIssued=${reportsRes.data.reports?.totalBooksIssued}`);
    console.log('');

    // ===== TEST: Global Search =====
    console.log('--- TEST: Global Search ---');
    const globalSearchRes = await makeRequest('GET', '/api/admin/search?query=Regression', null, adminToken);
    record('Global Search - success response', globalSearchRes.status === 200 && globalSearchRes.data.success, `status=${globalSearchRes.status}`);
    record('Global Search - has results array', globalSearchRes.data.success && Array.isArray(globalSearchRes.data.results), `results=${globalSearchRes.data.results?.length}`);
    console.log('');

    // ===== TEST: Get All Users =====
    console.log('--- TEST: Get All Users ---');
    const usersRes = await makeRequest('GET', '/api/admin/users?limit=10', null, adminToken);
    record('Get All Users - success response', usersRes.status === 200 && usersRes.data.success, `status=${usersRes.status}`);
    record('Get All Users - has users array', usersRes.data.success && Array.isArray(usersRes.data.users), `users=${usersRes.data.users?.length}`);
    console.log('');

    // ===== TEST: Pending Requests =====
    console.log('--- TEST: Pending Requests ---');
    const pendingRes = await makeRequest('GET', '/api/admin/pending-requests', null, adminToken);
    record('Pending Requests - success response', pendingRes.status === 200 && pendingRes.data.success, `status=${pendingRes.status}`);
    record('Pending Requests - has requests array', pendingRes.data.success && Array.isArray(pendingRes.data.requests), `requests=${pendingRes.data.requests?.length}`);
    console.log('');

    // ===== TEST: Wishlist =====
    console.log('--- TEST: Wishlist ---');
    // Signup a fresh student
    const email = `reg_${Date.now()}@example.com`;
    const studentSignup = await makeRequest('POST', '/api/auth/signup', {
      name: 'Regression Student',
      email,
      password: 'Test123!',
      role: 'student'
    });
    const studentToken = studentSignup.data.success ? studentSignup.data.token : null;
    record('Student Signup - success', studentSignup.status === 201 && studentSignup.data.success, `status=${studentSignup.status}`);

    if (studentToken) {
      // Get a book
      const booksRes = await makeRequest('GET', '/api/books?limit=5');
      const someBook = booksRes.data.books?.[0];
      if (someBook) {
        const wishlistAdd = await makeRequest('POST', `/api/wishlist/${someBook._id}`, null, studentToken);
        record('Wishlist - add book', wishlistAdd.status === 200 && wishlistAdd.data.success, `status=${wishlistAdd.status}`);
        const wishlistGet = await makeRequest('GET', '/api/wishlist', null, studentToken);
        record('Wishlist - get list', wishlistGet.status === 200 && wishlistGet.data.success, `status=${wishlistGet.status}`);
        const wishlistRemove = await makeRequest('DELETE', `/api/wishlist/${someBook._id}`, null, studentToken);
        record('Wishlist - remove book', wishlistRemove.status === 200 && wishlistRemove.data.success, `status=${wishlistRemove.status}`);
      }
    }
    console.log('');

    // ===== TEST: Profile Update =====
    console.log('--- TEST: Profile Update ---');
    if (studentToken) {
      const profileRes = await makeRequest('PUT', '/api/auth/update-profile', { name: 'Updated Regression Student' }, studentToken);
      record('Profile Update - success', profileRes.status === 200 && profileRes.data.success, `status=${profileRes.status}, msg=${profileRes.data.message || ''}`);
    }
    console.log('');

    // ===== TEST: Onboarding =====
    console.log('--- TEST: Onboarding ---');
    if (studentToken) {
      const onboardingRes = await makeRequest('PUT', '/api/auth/complete-onboarding', { favoriteGenres: ['Programming', 'Fiction'] }, studentToken);
      record('Onboarding - complete', onboardingRes.status === 200 && onboardingRes.data.success, `status=${onboardingRes.status}, msg=${onboardingRes.data.message || ''}`);
    }
    console.log('');

    // ===== TEST: Recommendations =====
    console.log('--- TEST: Recommendations ---');
    if (studentToken) {
      const recRes = await makeRequest('GET', '/api/books/recommendations', null, studentToken);
      record('Recommendations - success', recRes.status === 200 && recRes.data.success, `status=${recRes.status}`);
      record('Recommendations - has array', recRes.data.success && Array.isArray(recRes.data.recommendations), `count=${recRes.data.recommendations?.length}`);
    }
    console.log('');

    // ===== TEST: Fines =====
    console.log('--- TEST: Fines ---');
    if (studentToken) {
      // Get user transactions to find a fine
      const txRes = await makeRequest('GET', '/api/transactions/user/me', null, studentToken);
      const txWithFine = txRes.data.success ? txRes.data.transactions.find(t => t.fine > 0) : null;
      if (txWithFine) {
        const payRes = await makeRequest('PATCH', `/api/fines/${txWithFine._id}/pay`, null, studentToken);
        record('Fines - pay fine', payRes.status === 200 && payRes.data.success, `status=${payRes.status}, msg=${payRes.data.message || ''}`);
      } else {
        record('Fines - no fine to test', true, 'no outstanding fines for new student');
      }
    }
    console.log('');

    // ===== SUMMARY =====
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('=== REGRESSION TEST SUMMARY ===');
    console.log(`Time: ${elapsed}s`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${results.length}`);
    console.log('');
    if (failed === 0) {
      console.log('ALL CHECKS PASSED ✓');
    } else {
      console.log('SOME CHECKS FAILED ✗');
      results.filter(r => !r.ok).forEach(r => console.log(`  ✗ ${r.name}: ${r.detail}`));
    }
    console.log('\n=== REGRESSION TEST COMPLETE ===');
    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('Test error:', error.message);
    process.exit(1);
  }
}

run();