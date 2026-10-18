# Testing

Three test suites run locally and in CI (`.github/workflows/ci.yml`, on every push and pull request).

## Backend (Jest + Supertest, real MongoDB)

```bash
cd backend
npm ci
# A throwaway database: the name must end in _test (tests refuse anything else) and it is emptied on every run
MONGODB_URI_TEST=mongodb://127.0.0.1:27017/libverse_jest_test npm test
```

On Windows PowerShell: `$env:MONGODB_URI_TEST="mongodb://127.0.0.1:27017/libverse_jest_test"; npm test`.

The tests never read `backend/.env`: they set their own JWT secret, turn reminders and the AI service off,
and start a fake AI service where they need one.

| File | Covers |
|---|---|
| `auth.test.js` | signup/login, Library IDs, deactivated accounts, token versions (password change signs out other sessions), RBAC, helmet/CSP headers, CORS |
| `rateLimit.test.js` | login (failed attempts), signup and password-change limits |
| `circulation.test.js` | request → approve → return, one copy per student, fines and payment, renewals, concurrent approvals/returns/renewals |
| `waivers.test.js` | waiver validation, partial and full waivers, audit, running fine total, concurrent waivers |
| `reservations.test.js` | reservation rules, queue order, held copies, borrowing a held copy, 48-hour expiry, cancellations |
| `desk.test.js` | library card, code resolution, desk issue/return, fines at the desk, card reissue |
| `notifications.test.js` | notifications from events, read state and ownership, categories, due-soon/overdue reminders |
| `analytics.test.js` | analytics, reports and dashboard numbers against a hand-computed fixture |
| `staff.test.js` | find a student, Student 360, global search, user management, audit log, deleted users/books |
| `recommendations.test.js` | Picked for you with the AI service up, unconfigured, down, slow and untrained; retraining |

Every circulation test also checks the stock invariant: `available + issued + held = total`, never negative.

## AI service (pytest)

```bash
cd ai-service
pip install -r requirements-dev.txt
python -m pytest
```

## Frontend

```bash
cd frontend
npm ci
npm run build
```
