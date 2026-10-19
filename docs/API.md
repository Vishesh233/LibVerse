# LibVerse API Reference

Reference for developers who integrate with or maintain the LibVerse REST API (`backend/`) and the
recommendation service (`ai-service/`). Everything here is taken from the route files in
`backend/routes/`, the controllers in `backend/controllers/` and the services they call. If the code
and this page disagree, the code wins; please fix the page.

Contents:

- [Conventions](#conventions)
- [Roles and access control](#roles-and-access-control)
- [Auth: /api/auth](#auth-apiauth)
- [Books: /api/books](#books-apibooks)
- [Transactions (loans): /api/transactions](#transactions-loans-apitransactions)
- [Fines: /api/fines](#fines-apifines)
- [Admin and staff: /api/admin](#admin-and-staff-apiadmin)
- [Profile: /api/profile](#profile-apiprofile)
- [Notifications: /api/notifications](#notifications-apinotifications)
- [Wishlist: /api/wishlist](#wishlist-apiwishlist)
- [Reservations: /api/reservations](#reservations-apireservations)
- [Files and health](#files-and-health)
- [Example flows](#example-flows)
- [AI recommendation service](#ai-recommendation-service)

---

## Conventions

### Base URL

| Environment | Base URL |
|---|---|
| Local development | `http://localhost:5001/api` (port from `PORT`, default `5001`) |
| Production | The value of `VITE_API_BASE_URL` the frontend was built with (for example `https://<your-api>.onrender.com/api`) |

All paths below are relative to the server root and include the `/api` prefix.
Requests and responses are JSON (`Content-Type: application/json`) unless stated otherwise.
The JSON body limit is 5 MB (it has to fit a base64 payment screenshot).

### Authentication

- Sign in with `POST /api/auth/login` (or `POST /api/auth/signup`) to receive a JWT.
- Send it on every protected request: `Authorization: Bearer <token>`.
- Tokens are signed with `JWT_SECRET` and expire after `JWT_EXPIRE` (default `30d`).
- Each token carries the user's `tokenVersion` (claim `tv`). Changing the password
  (`PUT /api/auth/change-password`) or resetting it with an emailed code
  (`POST /api/auth/reset-password`) increments `tokenVersion`, so every token issued before that
  moment is rejected with `401 "Your session has ended. Please log in again."`. A password change
  returns a fresh token for the session that made it.
- A deactivated account (`isActive: false`) gets `403 "Account is deactivated"`, both at login and on
  every protected request. The frontend treats this exact message (and any 401 outside the
  credential endpoints) as "sign out".

### Error shape

Every error, from controllers, the error middleware, rate limiters and the 404 handler, has this form:

```json
{ "success": false, "message": "Human-readable reason" }
```

A few errors add a machine-readable field, for example `code` on the scan desk
(`BAD_SIGNATURE`, `OLD_CARD`, `INACTIVE`, `INACTIVE_BOOK`) or `enabled: false` on the password-reset
endpoints. Typical status codes: `400` validation or wrong state, `401` not signed in or bad
credentials, `403` wrong role or not the owner, `404` not found (also for malformed ObjectIds in most
places), `409` the record changed concurrently (retry after reloading), `429` rate limited,
`503` feature not configured. Unknown routes return `404 "Route not found"`.

Successful responses always include `success: true`.

### Pagination

List endpoints that paginate take `page` (1-based, default 1) and `limit`, clamped to `1..max`.
Values that are not plain strings (for example `?page[$gt]=1`) are ignored. Responses carry
`total` and `pages` (and sometimes `page` and `count`).

| Endpoint | Default `limit` | Max `limit` |
|---|---|---|
| `GET /api/books` | 10 | 100 |
| `GET /api/books/popular` (`limit` only) | 10 | 20 |
| `GET /api/transactions` | 10 | 100 |
| `GET /api/admin/users` | 50 | 100 |
| `GET /api/admin/audit` | 20 | 100 |
| `GET /api/admin/users/:id/overview` (`historyPage`, `historyLimit`) | 10 | 50 |
| `GET /api/notifications`, `GET /api/admin/notifications` | 20 | 50 |
| `GET /api/reservations` | 20 | 100 |
| `GET /api/reservations/queues` | 10 | 50 |

### Rate limits

Defined in `backend/config/security.js` (express-rate-limit), counted per client IP. Behind a reverse
proxy set `TRUST_PROXY` (usually `1`) so the real client IP is used. Responses include the standard
`RateLimit` / `RateLimit-Policy` headers (draft-7). When a limit is hit the API answers `429` with the
usual error shape.

| Limiter | Applies to | Window | Default limit | Override | Notes |
|---|---|---|---|---|---|
| login | `POST /api/auth/login` | 15 min | 10 | `RATE_LIMIT_LOGIN` | Only failed attempts count |
| signup | `POST /api/auth/signup` | 60 min | 10 | `RATE_LIMIT_SIGNUP` | |
| passwordChange | `PUT /api/auth/change-password` | 15 min | 5 | `RATE_LIMIT_PASSWORD_CHANGE` | Counted before authentication |
| forgotPassword | `POST /api/auth/forgot-password` | 15 min | 5 | `RATE_LIMIT_FORGOT_PASSWORD` | |
| resetPassword | `POST /api/auth/reset-password` | 15 min | 10 | `RATE_LIMIT_RESET_PASSWORD` | Each code also allows only 5 guesses |

### Money, dates and lending rules

- Amounts are Indian rupees (₹). The fine is **₹5 per calendar day late**
  (`FINE_PER_DAY` in `backend/utils/fineCalculator.js`). Days are whole calendar days in the
  server's local time: a book due on the 10th and returned any time on the 13th is 3 days late.
- While a loan is `issued` its fine keeps growing. It is fixed (stored in `fineAmount`) when the
  student requests the return, or when staff take the book back at the desk.
- Payable fine = `fineAmount - fineWaived`, never below 0, and 0 once `finePaid` is true.
- Lending rules (`backend/utils/loanRules.js`): a loan is due **14 days** after it is issued
  (`LOAN_DAYS`); each renewal adds **7 days** (`RENEWAL_DAYS`); at most **3 renewals** per loan
  (`MAX_RENEWALS`). Overdue loans cannot be renewed (a book due today still can).
- Reservations: a student may hold at most **3** active reservations; a copy set aside for a ready
  reservation is held for **48 hours** (`HOLD_HOURS` in `backend/services/reservationService.js`).

---

## Roles and access control

There are three roles, stored in `User.role`: `student`, `librarian` and `admin`.
"Staff" means librarian or admin.

### Middleware (`backend/middleware/authMiddleware.js`)

| Middleware | What it checks | Failure |
|---|---|---|
| `protect` | `Authorization: Bearer <token>` present and valid, the user still exists, the token's `tv` equals the user's `tokenVersion`, and the account is active. Sets `req.user`. | `401 "Not authorized to access this route"`, `401 "Your session has ended. Please log in again."`, `403 "Account is deactivated"` |
| `isStudent` | `req.user.role === 'student'` | `403 "Only students can access this route"` |
| `isStaff` | role is `librarian` or `admin` | `403 "Librarian/Admin access required"` |
| `isAdminRole` | role is `admin` | `403 "Admin access required"` |

Some rules are enforced inside controllers rather than by middleware, for example "owner or staff"
checks on loans and reservations, and the librarian restrictions below.

### What librarians cannot do (admins can)

| Area | Rule | Where |
|---|---|---|
| Audit log | `GET /api/admin/audit` is admin-only. Student 360 includes recent audit entries only for admins (`audit: null` for librarians). | `adminRoutes.js` (`isAdminRole`), `userOverviewController.js` |
| Admin accounts | `POST /api/admin/create-admin` is admin-only. | `adminRoutes.js` |
| Library cards | `POST /api/admin/users/:id/reissue-card` is admin-only. `GET /api/admin/users/:id/card` returns only student cards to librarians. | `adminRoutes.js`, `deskController.js` |
| User list | `GET /api/admin/users` never returns admin accounts to a librarian (filtering by `role=admin` returns nothing). Librarians do see other librarians. | `adminController.getAllUsers` |
| Creating users | Librarians can create only `student` accounts. | `adminController.createUser` |
| Editing users | Librarians can edit, activate or deactivate only students, and can never change a role. | `adminController.checkUserChange` |
| Student 360, lookup, search | Librarians can only open students (`/users/:id/overview`), find students (`/users/lookup`) and see students and their loans in global search. | `userOverviewController.js`, `adminController.globalSearch` |

Rules that apply to everyone, admins included: nobody can change their own role or deactivate their
own account, and the last active admin can never be demoted or deactivated.

---

## Auth: /api/auth

Route file: `backend/routes/authRoutes.js`. Controllers: `authController.js`,
`accountController.js`, `deskController.js` (card), `passwordResetController.js`.

| Method and path | Access | Body / query | Returns |
|---|---|---|---|
| `POST /api/auth/signup` | Public (rate limited) | `name`, `email`, `password` (required); `phone`, `address` | `201 { token, user }` |
| `POST /api/auth/login` | Public (rate limited) | `email`, `password` | `200 { token, user }` |
| `GET /api/auth/password-reset` | Public | | `{ enabled }`: whether "forgot password" by email is available |
| `POST /api/auth/forgot-password` | Public (rate limited) | `email` | `{ message }`, same answer whether or not the account exists |
| `POST /api/auth/reset-password` | Public (rate limited) | `email`, `code` (6 digits), `newPassword` (6-128 chars) | `{ message }` |
| `GET /api/auth/me` | Signed in | | `{ user }` (full user document without password) |
| `GET /api/auth/me/stats` | Signed in | | Students: `{ role, stats: { booksRead, currentlyBorrowed, finesPaid } }`. Staff: `{ role, stats: { approvalsTotal, approvalsThisMonth, issueApprovals, returnApprovals, paymentApprovals } }` |
| `GET /api/auth/me/activity` | Signed in | | `{ role, activity: [...] }`, the last 10 items: a student's own loan events, or the approvals a staff member made |
| `GET /api/auth/me/reading-stats` | Student | | `{ stats: { totalRead, readLast12Months, booksPerMonth, genres, averageLoanDays, onTimeRate, onTimeReturns } }` |
| `GET /api/auth/me/card` | Signed in | | `{ card }`: own library card with signed QR `code` and the lending `rules`; 404 without a Library ID |
| `PUT /api/auth/update-profile` | Signed in | Any of `name` (2-60 chars), `phone` (7-15 digits), `address` (max 200), `profileImage` (http(s) URL, max 2048) | `{ message, user }` |
| `PUT /api/auth/complete-onboarding` | Signed in | `favoriteGenres` (2-5 values from the Book genre list) | `{ message, user }`; 400 if already completed |
| `PUT /api/auth/update-favorite-genres` | Signed in | `favoriteGenres` (2-5 valid genres) | `{ message, user }` |
| `PUT /api/auth/change-password` | Signed in (rate limited) | `currentPassword`, `newPassword` (min 6) | `{ message, token, user }`: new token, older sessions end |

Notes:

- `user` in signup, login and profile responses is the public user object: `_id`, `name`, `email`,
  `role`, `libraryId`, `phone`, `address`, `fineAmount`, `profileImage`, `isOnboardingCompleted`,
  `favoriteGenres`, `createdAt`.
- Signup always creates a `student`; any `role` in the body is ignored. Emails are trimmed and
  lower-cased. New users get the next sequential Library ID (`LIB-1001`, `LIB-1002`, ...) from an
  atomic counter (`backend/utils/libraryId.js`).
- Login answers `401 "Invalid email or password"` for both an unknown email and a wrong password.
- When a student changes their `name`, every active staff member gets a `NAME_CHANGE` notification.
- Password change and reset create a `PASSWORD_CHANGED` notification for the user.

### Forgot password by emailed code

Rules from `backend/controllers/passwordResetController.js`:

- Available only when outgoing email is configured: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
  `SMTP_PASS` and `MAIL_FROM` all set (`backend/services/mailer.js`). Otherwise
  `forgot-password` and `reset-password` answer `503 { enabled: false, message }`.
- The code is 6 random digits, valid for **10 minutes**, stored only as an HMAC-SHA256 (keyed with
  `JWT_SECRET`) in `PasswordResetCode`; a TTL index removes expired codes.
- At most one new code per account per **60 seconds**; a repeat request inside that window sends
  nothing but gets the same answer.
- Deactivated or unknown accounts get the same `200` answer and no email (no account enumeration).
- Each code allows **5 guesses**. A guess is counted atomically before it is checked; at the limit
  the code is deleted. A correct code is single-use.
- Every wrong, expired or malformed code gets the same `400` message.
- Success sets the new password and increments `tokenVersion`, ending every existing session. The
  response carries no token: the user signs in again.

---

## Books: /api/books

Route file: `backend/routes/bookRoutes.js`. Controllers: `bookController.js`,
`bookCoverUploadController.js`, `bookImportController.js`.

| Method and path | Access | Body / query | Returns |
|---|---|---|---|
| `GET /api/books` | Public | See query parameters below | `{ count, total, pages, books }` (active books only) |
| `GET /api/books/popular` | Public | `genre`, `limit` (max 20) | `{ count, books }`, most borrowed first, each with `borrowCount` |
| `GET /api/books/recommendations` | Signed in | | `{ recommendations, source, favoriteGenres }` (see below) |
| `GET /api/books/summary` | Staff | | `{ summary: { titles, copies, available, issued, held, lowStock, outOfStock } }` over active books |
| `GET /api/books/:id` | Public | | `{ book, reviews, reservations: { waiting, ready } }`; 404 for removed books |
| `POST /api/books/:id/review` | Signed in | `rating` (1-5), `comment` (max 500) | `201 { review }`; one review per user and book; recalculates the book's `rating` |
| `POST /api/books/upload-cover` | Staff | `multipart/form-data`, field `coverImage` (JPG/PNG/WEBP, max 10 MB) | `{ coverUrl, filename }`; `coverUrl` is `/api/files/<id>` |
| `POST /api/books/import/preview` | Staff | `{ csv }` (CSV text) | Per-row check, nothing saved (see CSV import) |
| `POST /api/books/import` | Staff | `{ csv, checkCovers? }` | `201` when at least one book was added, else `200` |
| `POST /api/books` | Staff | Book fields (below) | `201 { book }` |
| `PUT /api/books/:id` | Staff | Any book fields | `{ book }` |
| `DELETE /api/books/:id` | Staff | | `{ message }` (soft delete) |

`GET /api/books` query parameters (all optional, plain strings only):

| Parameter | Meaning |
|---|---|
| `q` | Title **or** author contains (case-insensitive, regex-escaped) |
| `title`, `author` | Contains (case-insensitive) |
| `genre` | Exact genre |
| `rating` | Minimum rating |
| `availability` | `available` (any free copy), `unavailable` (none free), `low` (free copies at most a fifth of the total) |
| `ids` | Comma-separated book ids (at most 100; invalid ids ignored), used for QR label sheets |
| `sort` | `newest`, `rating`, or a column `title`, `author`, `genre`, `available`, `total`, `added`, with `-` for descending (for example `-available`). Anything else keeps the default order. |
| `page`, `limit` | Pagination (10 / 100) |

Book fields accepted by create and update: `title`, `author`, `genre` (required on create),
`isbn`, `publisher`, `totalCopies`, `availableCopies`, `issuedCopies`, `rating`, `description`,
`publicationYear` (older clients may send `publishedYear`, stored as `publicationYear`),
`location`, `coverImage`, `imageUrl`, `pages`, `language`.

Notes:

- `genre` must be one of: Self-Help, Programming, Computer Science, Finance, Business, Fiction,
  Non-Fiction, History, Biography, Science, Technology, Startup, Motivation, Psychology, Database,
  Networking, Cyber Security, AI & Machine Learning (the `Book.genre` enum).
- ISBNs are stored as digits only (spaces and hyphens removed, `X` upper-cased). Create refuses a
  duplicate ISBN with `400`.
- Create defaults `availableCopies` to `totalCopies`, `issuedCopies` to 0 and `rating` to 0.
- **Stock invariant** on update: when any of `totalCopies`, `availableCopies`, `issuedCopies` changes,
  `available + issued + held` must equal `total`, all non-negative integers, otherwise `400`. The
  update is conditional on the counts not having moved since they were read; if a loan or return
  happened in between the answer is `409`.
- After an update that frees copies, the copies go to the reservation queue first, then wishlisters
  get a one-off `BACK_IN_STOCK` notification.
- Delete sets `isActive: false`, cancels the book's waiting and ready reservations (releasing held
  copies, notifying those students) and keeps the loan history. Removed books disappear from
  listings and `GET /api/books/:id`.
- Create, update, delete and import write audit entries (`book.create`, `book.update`,
  `book.delete`, `book.import`) and schedule a retrain of the AI service.

### Recommendations ("Picked for you")

`GET /api/books/recommendations` returns up to 6 active books. Each book carries
`recommendationReason` (for example "Because you read Clean Code", "Top rated in Finance") and
`recommendationSource` (`ai` or `fallback`). The top-level `source` is `ai` when the AI service
supplied at least one pick.

- Books the user has requested, borrowed, read or reserves are never suggested.
- If the AI service is configured it is asked first, with a 1.5 s timeout. Any failure (down, slow,
  untrained, unconfigured) falls back silently; remaining slots are filled by the MongoDB fallback:
  top-rated books in the user's favourite genres, then top-rated books in any genre.
- With no favourite genres and no reading history the answer is
  `{ recommendations: [], source: "fallback", message }`.

### CSV import

Rules from `backend/services/bookImportService.js`. The preview and the import run the same checks;
the import re-checks everything, so it never trusts an earlier preview.

- Columns: `title`, `author`, `genre`, `isbn`, `year`, `publisher`, `pages`, `copies`,
  `description`, `location`. `title`, `author` and `genre` are required; the others are optional and
  `copies` defaults to 1. Header matching ignores case, spaces, `_` and `-`, and accepts aliases
  (`name`/`booktitle` for title, `authors`, `category` for genre, `isbn13`,
  `publicationyear`/`publishedyear`/`published` for year, `pagecount`,
  `totalcopies`/`quantity` for copies, `shelf`/`shelflocation` for location). Other columns are
  listed as ignored.
- File limits: at most 2 MB of text and 1000 rows. An empty file, a missing required column or too
  many rows is a `400` for the whole file.
- Row checks: required values present; maximum lengths (title 200, author 120, publisher 120,
  description 4000, location 40); genre must match a catalogue genre (case and punctuation
  insensitive, `&` = `and`); ISBN must be a valid ISBN-13 starting 978 or 979 (an ISBN-10 is rejected
  with a hint); year 1000 to next year; pages 1 to 20000; copies 1 to 500; no extra values beyond the
  header.
- Duplicates: same ISBN, or same title and author (ignoring case, accents and punctuation), against
  every book in the catalogue (removed books included) and earlier rows of the same file.
- Each row gets a status: `ready`, `error` or `duplicate`, with its problems in `errors`.
  Preview response: `{ columns: { found, missingOptional, ignored, expected }, summary: { total, ready, errors, duplicates }, rows, genres, maxRows }`.
- Import creates each `ready` row with all copies on the shelf and `language: "English"`, and
  answers `{ message, imported, copies, skipped, covers, rows }` where each row has
  `line`, `status` (`imported`, `error`, `duplicate`), `errors`, `title`, `author`, `bookId`.
- `checkCovers: true` looks up each ISBN on Open Library (4 s per lookup, 30 s overall) and stores the
  cover URL in `imageUrl` where one exists; `covers` is then `{ checked, found }`, otherwise `null`.

---

## Transactions (loans): /api/transactions

Route file: `backend/routes/transactionRoutes.js`. Controller: `transactionController.js`.

A transaction is one request or loan of one book by one student. Status values:

| Status | Meaning |
|---|---|
| `pending` | Student asked to borrow; waiting for staff |
| `issued` | Lent; fine grows once overdue |
| `return_requested` | Student asked to return; fine fixed in `fineAmount` |
| `payment_pending` | Student submitted a fine payment; waiting for staff to verify |
| `returned` | Closed |
| `rejected` | Request rejected by staff |

| Method and path | Access | Body / query | Returns |
|---|---|---|---|
| `POST /api/transactions/issue` | Student | `bookId` | `201 { message, transaction }` (status `pending`) |
| `PUT /api/transactions/:id/return` | Owner or staff | | `{ message, transaction, fine, hasFine }` (status `return_requested`) |
| `PUT /api/transactions/:id/renew` | Owner or staff | | `{ message, newDueDate, transaction }` |
| `GET /api/transactions/user/me` | Signed in | | `{ count, transactions }`: own loans, newest first, each with `fine`, `payableFine`, `daysRemaining`, `daysLate` and the populated book |
| `PUT /api/transactions/:id/submit-payment` | Owner | `paymentScreenshot` (optional data URI) | `{ message, transaction }` (status `payment_pending`) |
| `GET /api/transactions` | Staff | `status` (a status, or `open` = issued + return_requested + payment_pending), `bookId`, `page`, `limit` | `{ count, total, pages, transactions }`; each has `hasScreenshot` and `payableFine`, never the screenshot itself |
| `GET /api/transactions/:id/payment-screenshot` | Staff | | `{ paymentScreenshot }`; 404 if none |
| `PUT /api/transactions/:id/approve` | Staff | | `{ message, transaction }` (status `issued`) |
| `PUT /api/transactions/:id/reject` | Staff | | `{ message, transaction }` (status `rejected`) |
| `PUT /api/transactions/:id/approve-return` | Staff | | `{ message, transaction }` (status `returned`) |
| `PUT /api/transactions/:id/approve-payment` | Staff | | `{ message, transaction }` (status `returned`, `finePaid: true`) |
| `POST /api/transactions/:id/waive` | Staff | `amount`, `reason` | `{ message, transaction }` with `payableFine` |

Rules:

- **Request** (`issue`): the book must be active and have a free copy, or a copy held for this
  student's ready reservation. A student can have only one open request or loan
  (`pending`, `issued`, `return_requested`, `payment_pending`) per book. No copy is taken yet; the due
  date is provisional. Student and every active staff member are notified.
- **Approve**: only from `pending`, claimed atomically. The loan period starts now (due in 14 days).
  A copy is then taken atomically: the copy held for the student's ready reservation (fulfilling it),
  otherwise a free copy (a waiting reservation of the same student is fulfilled too). If no copy is
  left the request goes back to `pending` and the answer is `400 "Book is not available to approve"`.
  Audited as `issue.approve`.
- **Reject**: only from `pending`; sets `returnDate`. Audited as `issue.reject`.
- **Return request**: only from `issued`, atomically. The fine (₹5 per calendar day late) is fixed in
  `fineAmount` and added to the user's running `fineAmount` total.
- **Approve return**: only from `return_requested` and only when nothing is payable (no fine, paid, or
  fully waived); otherwise `400 "Fine of ₹X must be paid or waived before approving return"`. The
  returned copy goes straight to the oldest waiting reservation (held 48 h) or back on the shelf.
  Audited as `return.approve`.
- **Submit payment**: owner only, from `return_requested`, when something is payable.
  `paymentScreenshot`, if sent, must be a `data:image/png|jpeg|webp;base64,...` URI of at most 3 MB
  decoded.
- **Approve payment**: only from `payment_pending`, atomically. Marks the fine paid, completes the
  return in the same step, deducts the paid amount from the user's running total and returns the
  copy (queue first). Audited as `payment.approve`.
- **Waive**: staff can waive all or part of a fixed, unpaid fine on a `return_requested`,
  `payment_pending` or `returned` loan. `amount` must be greater than 0 and at most what is still
  payable; `reason` 10 to 500 characters. An `issued` loan's fine is still growing and cannot be
  waived (`400`). If someone paid or waived in between the answer is `409`. A full waiver on a
  `payment_pending` loan moves it back to `return_requested` (nothing left to verify) and the
  return can then be approved. The user's running total is reduced, the student gets `FINE_WAIVED`,
  and the action is audited as `fine.waive` with the reason.
- **Renew**: owner or staff, only `issued`, not overdue, fewer than 3 renewals so far. Adds 7 days to
  the due date in one conditional update (`409` if the loan changed meanwhile) and resets the
  "due soon" reminder.

---

## Fines: /api/fines

Route file: `backend/routes/fineRoutes.js`. Controller: `fineController.js`.

Fines are settled through the return flow (`submit-payment` by the student, `approve-payment` or
`waive` by staff). This route only prepares the payment screen.

| Method and path | Access | Body | Returns |
|---|---|---|---|
| `POST /api/fines/initiate-payment` | Student (owner) | `fineId` (the transaction id) | `{ paymentReference, transaction: { _id, bookTitle, dueDate, fineAmount, fineWaived, daysLate } }` |

`fineAmount` is what is still payable (fine minus waiver); `400` when nothing is owed.
`paymentReference` is a random `PAY-XXXXXXXX` string for display; it is not stored.

---

## Admin and staff: /api/admin

Route file: `backend/routes/adminRoutes.js`. Controllers: `adminController.js`,
`analyticsController.js`, `deskController.js`, `userOverviewController.js`.

`GET /api/admin/search` needs only `protect`. Every other route in this file runs behind
`protect` and `isStaff`; three also require `isAdminRole`.

### Dashboard, analytics, reports, audit

| Method and path | Access | Query | Returns |
|---|---|---|---|
| `GET /api/admin/search` | Signed in (any role) | `query` | `{ results: [{ type, id, title, subtitle, url, ... }] }`. Everyone: up to 5 books. Staff also: up to 5 users and 3 loans (librarians: students only). No emails in results. |
| `GET /api/admin/dashboard` | Staff | | `{ analytics }`: counts, `fineSummary`, overdue list, pending/return/payment queues, recent activity, top books, genre breakdowns, weekly and 14-day series, reservations |
| `GET /api/admin/analytics` | Staff | `from`, `to` (`YYYY-MM-DD`, inclusive) | `{ analytics: { range, labels, bucketKeys, summary, fines, loansSeries, finesSeries, aging, byGenre, topBooks, reservations, staffActivity } }` |
| `GET /api/admin/reports` | Staff | `from`, `to` | `{ reports: { range, loans, fines, overdue, topBooks, staffActivity, summary, ... } }`; row tables capped at 2000 rows (`loansTruncated`, `finesTruncated`) |
| `GET /api/admin/audit` | **Admin** | `actor` (user id), `action`, `from`, `to`, `page`, `limit` | `{ entries, total, page, pages, actors, actions }`, newest first |

Analytics and reports range: default is the 1st of the month 11 months ago through today (monthly
buckets); ranges of up to 62 days use daily buckets; at most about 10 years; `from` after `to` is a
`400`. Definitions of every number are at the top of `backend/services/analyticsService.js`.

Audit `action` values: `issue.approve`, `issue.reject`, `return.approve`, `payment.approve`,
`loan.admin_issue`, `loan.admin_return`, `book.create`, `book.update`, `book.delete`, `book.import`,
`user.create`, `user.update`, `user.activate`, `user.deactivate`, `user.role_change`,
`user.card_reissue`, `user.library_id_change`, `fine.waive`, `reservation.staff_cancel`,
`reminders.send`. Summaries never contain emails.

### Users

| Method and path | Access | Body / query | Returns |
|---|---|---|---|
| `GET /api/admin/users` | Staff | `role`, `status` (`active`/`inactive`), `search` (name, email or Library ID), `sort` (`name`, `libraryId`, `role`, `joined`, `-` prefix for descending; default `-joined`), `page`, `limit` | `{ count, total, pages, users }`; each user adds `booksIssued`, `openLoans`, `overdueLoans`, `finesOwed` |
| `GET /api/admin/users/lookup` | Staff | `q` (required) | `{ exact, users }`: exact Library ID match first, else up to 10 name/email/ID matches |
| `GET /api/admin/users/:id/overview` | Staff (librarians: students only) | `historyPage`, `historyLimit` | `{ overview: { profile, stats, currentLoans, pendingRequests, history, fines, reservations, audit, permissions } }` (Student 360) |
| `GET /api/admin/users/:id/card` | Staff (librarians: students only) | | `{ card }` |
| `POST /api/admin/users` | Staff (librarians: students only) | `name`, `email`, `password` (required); `role` (default `student`), `phone`, `address`, `libraryId` (generated when empty) | `201 { message, user }` |
| `PUT /api/admin/users/:id` | Staff (rules above) | Any of `name`, `email`, `role`, `phone`, `address`, `libraryId`, `isActive`, `password` | `{ message, user }` |
| `DELETE /api/admin/users/:id` | Staff (rules above) | | `{ message, user }`. **Toggles** `isActive`; it never deletes the account |
| `POST /api/admin/create-admin` | **Admin** | `name`, `email`, `password`; `phone`, `address` | `201 { message, user: { _id, name, email, role, libraryId } }` |
| `POST /api/admin/users/:id/reissue-card` | **Admin** | | `{ message, cardVersion }` |

Notes:

- A password set through `PUT /api/admin/users/:id` is hashed by the model's save hook. Audit entries
  record changed field names only, never values.
- Duplicate email or Library ID answers `400 "Email already in use"` / `"Library ID already in use"`.
- Reissuing a card increments `cardVersion`, so every older card QR stops working at the desk; the
  member gets a `CARD_REISSUED` notification. The user must have a Library ID.

### Circulation desk

| Method and path | Access | Body / query | Returns |
|---|---|---|---|
| `GET /api/admin/pending-requests` | Staff | | `{ count, requests }`: `pending` transactions |
| `POST /api/admin/send-reminders` | Staff | | `{ message, count, dueSoon, overdue }`. Runs the reminder job now (see below); audited as `reminders.send` |
| `POST /api/admin/issue-book` | Staff | Student: `userEmail` or `libraryId`. Book: `bookId` or `bookTitle` (contains match). Optional `dueDate` | `201 { message, transaction }` |
| `POST /api/admin/return-book` | Staff | `transactionId`, or `userEmail` / `bookId` / `query` (email, Library ID, name or book title) to find the newest `issued` loan | `{ message, transaction, fine }` |
| `GET /api/admin/desk/resolve` | Staff | `code`: a scanned QR or typed text | `{ type: "user", user }` or `{ type: "book", book }`, plus `typed: true` when matched from typed text |
| `POST /api/admin/desk/issue` | Staff | `userId`, `bookId` | `201 { message, transaction, dueDate, fromHold, reservationFulfilled, fromRequest }` |
| `POST /api/admin/desk/return` | Staff | `transactionId` | `{ message, transaction, fine, kind, heldForNext }` |

Desk rules (`backend/services/deskService.js`, shared by `issue-book`/`return-book` and the scan desk):

- **Issue**: the borrower must be an active `student`; the book must be active; the student must not
  already have this book on loan. An existing `pending` request for the same book is turned into the
  loan. The copy is taken atomically: the copy held for this student's ready reservation if any,
  otherwise a free copy, never one held for someone else. Custom `dueDate` must be after today and
  within a year (default 14 days). Audited as `loan.admin_issue`.
- **Return**: an `issued` loan is closed immediately (`kind: "desk"`), with the fine fixed at today
  and recorded as unpaid. A `return_requested` or `payment_pending` loan is completed
  (`kind: "request"`) only when nothing is payable; otherwise `400`. The copy goes to the next
  reservation first (`heldForNext` names that student). Audited as `loan.admin_return` or
  `return.approve`.
- **Codes** (`backend/utils/libraryCard.js`): books `LV1:B:<bookId>` (unsigned); library cards
  `LV1:U:<libraryId>:<cardVersion>:<signature>`, where the signature is an HMAC with a key derived
  from `JWT_SECRET`. Also accepted: the JSON QR of older versions, and typed Library IDs, ISBNs or
  book ids. Errors carry `code`: `BAD_SIGNATURE` (forged or damaged card), `OLD_CARD` (card was
  reissued), `INACTIVE` (deactivated member), `INACTIVE_BOOK` (removed book).

### Staff notifications

| Method and path | Access | Returns |
|---|---|---|
| `GET /api/admin/notifications` | Staff | Same as `GET /api/notifications` (kept for existing clients) |

---

## Profile: /api/profile

Route file: `backend/routes/profileRoutes.js`. Controller: `profileController.js`.

| Method and path | Access | Body | Returns |
|---|---|---|---|
| `POST /api/profile/upload-avatar` | Signed in | `multipart/form-data`: `avatar` (JPG/PNG/WEBP, max 10 MB), optional `crop` (JSON string `{ x, y, width, height }`) | `{ message, user, avatarUrl }` |

The image is cropped to a circle (centre square when no `crop` is sent), saved as PNG in GridFS, and
`profileImage` becomes `/api/files/<id>`. The previous avatar file is deleted.

---

## Notifications: /api/notifications

Route file: `backend/routes/notificationRoutes.js`. Controller: `notificationController.js`.
Users only ever see their own notifications.

| Method and path | Access | Body / query | Returns |
|---|---|---|---|
| `GET /api/notifications` | Signed in | `page`, `limit` (max 50), `unread=true`, `category` | `{ notifications, unreadCount, total, page, pages }`, newest first |
| `PUT /api/notifications/read/:id` | Owner | `:id` is the `_id` or `NOTIF-<_id>` | `{ notification, unreadCount }` |
| `PUT /api/notifications/read-all` | Signed in | | `{ message, updated, unreadCount: 0 }` |
| `POST /api/notifications/admin` | Staff | `type`, `message` (required), `title` | `201 { notification }`, created for the caller |

Each notification has `title`, `message`, `type`, `isRead`, optional `link` (a frontend path) and
`meta` (`transactionId`, `bookId`), plus virtuals `notificationId` and `category`.
`category` values: `request`, `approval`, `return`, `fine`, `reminder`, `reservation`, `system`
(types not mapped to a category fall into `system`; see `CATEGORY_TYPES` in
`backend/models/Notification.js`).

---

## Wishlist: /api/wishlist

Route file: `backend/routes/wishlistRoutes.js`. Controller: `wishlistController.js`.

| Method and path | Access | Returns |
|---|---|---|
| `GET /api/wishlist` | Signed in | `{ wishlist }`: populated books |
| `POST /api/wishlist/:bookId` | Signed in | `{ message, wishlist }` (array of ids); adding twice is a no-op |
| `DELETE /api/wishlist/:bookId` | Signed in | `{ message, wishlist }` |

When a wishlisted book has no free copy and one becomes free again, active students who wishlisted it
(and do not already reserve or borrow it) get one `BACK_IN_STOCK` notification per event.

---

## Reservations: /api/reservations

Route file: `backend/routes/reservationRoutes.js`. Controller: `reservationController.js`.
Service: `backend/services/reservationService.js`.

| Method and path | Access | Body / query | Returns |
|---|---|---|---|
| `POST /api/reservations` | Student | `bookId` | `201 { message, reservation, position }` |
| `GET /api/reservations/me` | Student | | `{ count, active, reservations }`: newest 50, ready first, then waiting, each with `position` |
| `GET /api/reservations` | Staff | `status` (`waiting`, `ready`, `fulfilled`, `cancelled`, `expired`, `active` (default) or `all`), `bookId`, `page`, `limit` | `{ count, total, page, pages, reservations }` |
| `GET /api/reservations/queues` | Staff | `page`, `limit` | `{ count, total, page, pages, queues: [{ book, waiting, ready, reservations }] }`, oldest queue first |
| `DELETE /api/reservations/:id` | Owner or staff | | `{ message, reservation }` |

Rules:

- A reservation is only for a book with **no** free copy (`400` otherwise: request it instead). The
  student must not already have an open request or loan, or an active reservation, for that book,
  and may have at most 3 active (`waiting` or `ready`) reservations.
- Queue order is creation time. When a copy comes back it moves straight from issued to held for the
  oldest waiting reservation, which becomes `ready` with `expiresAt` 48 hours later and a
  `RESERVATION_READY` notification. The held copy can only be lent to that student, through a normal
  request plus approval or at the desk; the reservation then becomes `fulfilled`.
- A `ready` reservation not borrowed in time becomes `expired` (hourly job, and also checked before
  any reservation list is read); the copy passes to the next student or back to the shelf.
- Cancelling: only `waiting` or `ready`. Cancelling a ready one passes its held copy on. Staff
  cancelling a student's reservation notifies the student and is audited as
  `reservation.staff_cancel`. `409` if the reservation changed meanwhile.

---

## Files and health

| Method and path | Access | Returns |
|---|---|---|
| `GET /api/files/:id` | Public | The stored image (avatar or cover) |
| `GET /api/health` | Public | `{ status, db, uptimeSeconds }` |

- Files (`backend/services/fileStore.js`): uploads live in MongoDB GridFS, bucket `uploads`.
  Documents store the host-independent path `/api/files/<id>`; the frontend prefixes the API origin.
  A file never changes once written, so it is served with
  `Cache-Control: public, max-age=31536000, immutable`, an `ETag` (`If-None-Match` gives `304`),
  `Last-Modified` and `X-Content-Type-Options: nosniff`. Unknown or malformed ids give `404`.
- `/uploads/<file>` (static, 7-day cache) still serves images saved to disk by older versions;
  `backend/scripts/migrateUploadsToGridFS.js` moves them into GridFS.
- Health: `200 { status: "ok", db: "connected", ... }` while MongoDB is connected, otherwise
  `503 { status: "degraded", db: "disconnected" | "connecting" | "disconnecting" }`. Never cached.
  Render uses it as the health check.

---

## Example flows

Ids, tokens and emails below are placeholders, and response bodies are abridged to the fields that
matter for the flow.

### Sign in

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "asha.student@example.com", "password": "correct-horse-1" }
```

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<payload>.<signature>",
  "user": {
    "_id": "000000000000000000000a01",
    "name": "Asha Student",
    "email": "asha.student@example.com",
    "role": "student",
    "libraryId": "LIB-1001",
    "fineAmount": 0,
    "isOnboardingCompleted": true,
    "favoriteGenres": ["Programming", "Science"],
    "createdAt": "2026-01-05T09:30:00.000Z"
  }
}
```

A wrong password gives `401 { "success": false, "message": "Invalid email or password" }`; a
deactivated account gives `403 { "success": false, "message": "Account is deactivated" }`.

### Student requests a book

```http
POST /api/transactions/issue
Authorization: Bearer <student token>
Content-Type: application/json

{ "bookId": "000000000000000000000b01" }
```

```json
{
  "success": true,
  "message": "Book issue request created. Waiting for librarian approval.",
  "transaction": {
    "_id": "000000000000000000000c01",
    "userId": "000000000000000000000a01",
    "bookId": "000000000000000000000b01",
    "status": "pending",
    "dueDate": "2026-11-02T10:00:00.000Z",
    "fineAmount": 0,
    "finePaid": false,
    "renewalCount": 0
  }
}
```

Asking again for the same book while this request is open gives
`400 "You already have a request or issued copy of this book"`.

### Staff approves the request

```http
PUT /api/transactions/000000000000000000000c01/approve
Authorization: Bearer <librarian token>
```

```json
{
  "success": true,
  "message": "Issue request approved",
  "transaction": {
    "_id": "000000000000000000000c01",
    "status": "issued",
    "isApproved": true,
    "approvedBy": "000000000000000000000a02",
    "approvalDate": "2026-10-19T10:05:00.000Z",
    "issueDate": "2026-10-19T10:05:00.000Z",
    "dueDate": "2026-11-02T10:05:00.000Z"
  }
}
```

If the last copy was taken in the meantime the request stays `pending` and the answer is
`400 "Book is not available to approve"`. A student calling this endpoint gets
`403 "Librarian/Admin access required"`.

---

## AI recommendation service

Flask app in `ai-service/` (`app.py`, `routes/recommend.py`, `model/recommender.py`). Only the Node
backend calls it (`backend/services/recommendationService.js`). Locally it listens on
`127.0.0.1:5000` by default (`HOST`, `PORT`). Errors have the shape
`{ "success": false, "error": "..." }`.

| Method and path | Auth | Body | Returns |
|---|---|---|---|
| `GET /health` | None | | `{ status: "ok", service, trainedBooks }` |
| `POST /api/train` | `X-Service-Token` | `{ books: [{ id, title, author, genre, description, popularity? }] }` | `{ success: true, trained }` |
| `POST /api/recommend` | `X-Service-Token` | `{ readIds, favouriteGenres, excludeIds, limit }` | `{ success: true, recommendations: [{ id, score, reason, basis }] }` |

- `X-Service-Token` must equal the service's `AI_SERVICE_TOKEN` (constant-time comparison):
  `401 Unauthorized` otherwise, `503` while `AI_SERVICE_TOKEN` is not set.
- `train` replaces the whole catalogue. At most 20000 books; every `id` must be a unique non-empty
  string; text fields must be strings; `popularity` a number of at least 0.
- `recommend`: the three lists are optional lists of at most 2000 strings; `limit` an integer from 1 to
  50 (default 6). Before any training it answers `409`, which makes the backend retrain and use its
  fallback for that request.
- `basis` is `content` (reason "Because you read <title>") or `genre` (reason "Popular in <genre>").
- Request bodies are limited to 10 MB (`413` beyond that).
