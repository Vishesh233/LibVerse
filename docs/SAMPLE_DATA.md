# Demo data

LibVerse ships a demo data set for trying the app and for the screenshots. It lives in its own
database, **`libverse_demo`**; the seed script refuses to write anywhere else.

```bash
cd backend
node scripts/seedDemo.js          # recreate libverse_demo on mongodb://127.0.0.1:27017
node scripts/seedDemo.js --drop   # delete it
```

Set `DEMO_MONGODB_URI` to use another server (the database name must still be `libverse_demo`).

## What it contains

- **Catalogue:** every book in `backend/scripts/data/demo-catalogue.json` (500+ titles across 18 genres, with covers from Open Library)
- **People:** 1 admin, 2 librarians and 25 students with fictional Indian names and `@example.com` addresses;
  one student is deactivated and one has just signed up (onboarding not finished)
- **About four months of activity**, with dates relative to today: loans returned on time and late,
  fines paid and waived, books on loan (some overdue, some due today), return requests, payments with
  receipts waiting for verification, issue requests, rejected requests, reservations (waiting, ready,
  fulfilled, cancelled, expired), wishlists, reviews, notifications and audit-log entries

The data is the same on every run (seeded random numbers). Stock counters always add up:
`available + issued + held = total`.

## Accounts

All demo accounts use the password `Demo#Library2026`.

| Role | Email |
|---|---|
| Admin | `meera.iyer@example.com` |
| Librarian | `rohan.desai@example.com`, `kavya.menon@example.com` |
| Student (lots of activity) | `aarav.sharma@example.com` |
| Student (onboarding not finished) | `anika.shetty@example.com` |

Run the API against it with `MONGODB_URI=mongodb://127.0.0.1:27017/libverse_demo` (PowerShell:
`$env:MONGODB_URI="mongodb://127.0.0.1:27017/libverse_demo"; npm run dev`).
