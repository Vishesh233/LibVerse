# Deploying LibVerse

LibVerse runs as two separate instances of the same code:

| Instance | Who uses it | Database | Sign-in |
|---|---|---|---|
| **Live demo** (deploy this first) | interviewers, visitors | `libverse_demo`: sample data, reset every night | three buttons: *Try as Student / Librarian / Admin* |
| **Production** (later) | a real library | `libverse`: real members | email and password, signup, forgot password |

They never share a database. On the demo instance (`DEMO_MODE=true`) password login, signup and
password reset are switched off on the server, and the demo accounts (`isDemo`) cannot change
passwords, accounts, the catalogue or system settings ("Disabled in demo mode").

| Part | Host | Demo instance | Production instance |
|---|---|---|---|
| Database | **MongoDB Atlas** (one free M0 cluster) | database `libverse_demo` | database `libverse` |
| API | **Render** | `libverse-demo-api` | `libverse-api` |
| Recommendations | **Render** | `libverse-ai` | `libverse-ai-prod` |
| Website | **Vercel** | project `libverse-demo` | project `libverse` |
| Nightly reset | **GitHub Actions** | `.github/workflows/demo-reset.yml` | none |

```
Browser ──> Vercel (frontend) ──HTTPS──> Render libverse-demo-api ──> Atlas libverse_demo
                                              └──X-Service-Token──> Render libverse-ai
GitHub Actions (02:00 IST) ──> backend/scripts/resetDemo.js --apply ──> Atlas libverse_demo
```

Nothing in this repository deploys by itself: every step below is done by you in a browser or
terminal.

---

## Render free plan: is this enough?

Render's free plan gives **750 instance hours per month per workspace**, shared by all free web
services. A free service sleeps after about 15 minutes without requests and only uses hours while
it is awake (the first request after a sleep takes up to a minute).

- **Demo only (2 services: API + AI):** fine. 750 hours is enough for both to be awake about 12
  hours a day every day; interview traffic is far less. The nightly reset talks to Atlas directly,
  so it does not wake Render.
- **Demo + production (4 services):** fine only while both see light traffic (about 6 awake hours a
  day per service on average). If you run out, Render suspends the free services until the next
  month. For a library with real users, put the production API (and its AI service) on a paid
  instance, which does not use free hours and never sleeps.
- **Do not add an uptime pinger** to keep services awake: two services awake all month need about
  1,460 hours.

---

## 0. Before you start

You need:

- A GitHub account with access to this repository, and accounts on **MongoDB Atlas**, **Render** and
  **Vercel** (all can sign in with GitHub).
- Node.js 20 or newer on your computer, and this repository checked out with `npm install` done in
  `backend/`.
- Long random secrets, generated with:

  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  ```

  Keep them in a password manager. Each instance gets its **own** values:

  | Name | Used for |
  |---|---|
  | `JWT_SECRET` | signing login sessions (API only) |
  | `AI_SERVICE_TOKEN` | the API ⇄ recommendation service handshake (same value on both) |
  | Atlas database passwords | the database users (step A1.3) |

Never paste a secret into a file that is committed, an issue, or a chat.

---

# Part A: the live demo

## A1. MongoDB Atlas

### A1.1 Create the cluster

1. Go to <https://cloud.mongodb.com> and sign in.
2. **Create a project**: name it `LibVerse` → **Next** → **Create Project**.
3. Click **Create** (or **Build a Database**) → **M0 (Free)**, provider **AWS**, a region close to
   the Render region you will use (e.g. *Mumbai ap-south-1* or *Singapore*).
4. Cluster name: `libverse` → **Create Deployment**.

### A1.2 Network access

Render's free services and GitHub Actions don't have fixed IP addresses, so Atlas must accept
connections from anywhere (the database users and passwords still protect it).

1. **Security → Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) → **Confirm**.
2. Also **Add Current IP Address** so you can seed from your computer.

### A1.3 Two database users, both limited to `libverse_demo`

1. **Security → Database Access** → **Add New Database User**.
2. Authentication **Password**, username `libverse-demo-app`, **Autogenerate Secure Password** →
   copy it to your password manager.
3. Under **Database User Privileges** open **Specific Privileges** → **Add Specific Privilege** →
   role **`readWrite`**, database **`libverse_demo`** (leave the collection empty). Do **not** pick a
   built-in role such as *Read and write to any database*.
4. **Add User**.
5. Repeat for a second user, **`libverse-demo-reset`**, with the same single privilege. It is used
   only by the nightly reset on GitHub, so a leaked GitHub secret can never reach any other
   database, and you can replace it without touching the API.

### A1.4 Connection strings

1. **Database → Clusters** → **Connect** on `libverse` → **Drivers** → copy the string.
2. Put each user's password in place of `<db_password>` and the database name **`libverse_demo`**
   right after `.mongodb.net/`:

   ```
   mongodb+srv://libverse-demo-app:PASSWORD@libverse.xxxxx.mongodb.net/libverse_demo?retryWrites=true&w=majority&appName=libverse
   mongodb+srv://libverse-demo-reset:PASSWORD@libverse.xxxxx.mongodb.net/libverse_demo?retryWrites=true&w=majority&appName=libverse
   ```

   The first is the demo API's **`MONGODB_URI`**, the second is the GitHub secret
   **`DEMO_MONGODB_URI`** (step A5). If a password has characters such as `@ : / ? #`, URL-encode
   them or generate one with letters and digits only.

## A2. Seed the demo database

From `backend/` on your computer, with the **`libverse-demo-app`** string (the seed refuses any
database not named `libverse_demo`):

```powershell
# PowerShell (Windows)
$env:DEMO_MONGODB_URI = "mongodb+srv://libverse-demo-app:PASSWORD@libverse.xxxxx.mongodb.net/libverse_demo?retryWrites=true&w=majority&appName=libverse"
node scripts/seedDemo.js --live
node scripts/resetDemo.js            # dry run: shows what a nightly reset replaces
Remove-Item Env:DEMO_MONGODB_URI
```

bash/zsh: `export DEMO_MONGODB_URI="mongodb+srv://..."` and `unset DEMO_MONGODB_URI`.

`--live` creates the full catalogue (about 500 books) and 28 fictional accounts (`@example.com`)
with four months of activity, all marked `isDemo` and with a random password that is never shown:
they can only be used through the demo buttons. Without `--live` (local screenshots) the accounts
use the fixed password from `scripts/demo/buildDemoData.js`, so never seed the live demo without it.

The demo needs no admin of your own. If you want one anyway, run `node scripts/createAdmin.js`
with `MONGODB_URI` set to the same string; it cannot sign in on the demo website (password login is
off there) but keeps the database administrable from scripts.

## A3. Render: demo API and recommendation service

### A3.1 Create both services from the Blueprint

1. <https://dashboard.render.com> → **New** → **Blueprint**.
2. Connect GitHub, pick this repository and the branch to deploy (**`main`** after the pull request
   is merged, see step C). Render reads `render.yaml` and lists **libverse-demo-api** and
   **libverse-ai** (the production service in that file is commented out).
3. Fill in the variables (the file only names them):

**libverse-ai**

| Variable | Value |
|---|---|
| `PYTHON_VERSION` | `3.11.9` |
| `HOST` | `0.0.0.0` |
| `AI_SERVICE_TOKEN` | the demo `AI_SERVICE_TOKEN` secret |
| `CORS_ORIGINS` | `https://libverse-demo-api.onrender.com` (the API's URL; only the API calls it) |

**libverse-demo-api**

| Variable | Value |
|---|---|
| `NODE_VERSION` | `22` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | the `libverse-demo-app` string (A1.4) |
| `JWT_SECRET` | the demo `JWT_SECRET` secret |
| `DEMO_MODE` | `true` |
| `DEMO_JWT_EXPIRE` | `2h` (how long a demo session lasts) |
| `CORS_ORIGINS` | the demo website URL, e.g. `https://libverse-demo.vercel.app` (a placeholder now, corrected in A4.3) |
| `CSP_API_ORIGINS` | the API's own URL, e.g. `https://libverse-demo-api.onrender.com` |
| `TRUST_PROXY` | `1` |
| `REMINDERS_ENABLED` | `true` |
| `AI_SERVICE_URL` | the AI service URL, e.g. `https://libverse-ai.onrender.com` |
| `AI_SERVICE_TOKEN` | the **same** `AI_SERVICE_TOKEN` secret |

No SMTP variables: the demo has no password reset.

4. **Apply**. Render builds both services (a few minutes). `autoDeploy` is off: later changes
   deploy when you click **Manual Deploy** on a service.

If Render gives a service a different name (e.g. `libverse-demo-api-x1y2`), use the URLs shown on
each service's page everywhere above and for `VITE_API_BASE_URL` (A4).

### A3.2 Check they are healthy

- `https://libverse-demo-api.onrender.com/api/health` → `{"status":"ok","db":"connected",...}`
- `https://libverse-demo-api.onrender.com/api/auth/demo` → `{"success":true,"enabled":true}`
- `https://libverse-ai.onrender.com/health` → `"trainedBooks"` above 0 (if 0, restart the API)

## A4. Vercel: the demo website

### A4.1 Import the project

1. <https://vercel.com/new> → import this repository.
2. Project name `libverse-demo`. **Root Directory** → **Edit** → **`frontend`**.
3. Framework preset **Vite** (`frontend/vercel.json` sets the build too).
4. **Environment Variables**: `VITE_API_BASE_URL` = `https://libverse-demo-api.onrender.com/api`
   (the API URL + `/api`).
5. **Deploy**.

The website asks the API whether it is the demo; on the demo it shows only the three buttons and
"This is a demo with sample data. It resets daily." Signed in, every page shows "You're viewing a
demo account. Data resets daily."

### A4.2 Note the website URL

E.g. `https://libverse-demo.vercel.app` (a custom domain can be added under **Settings → Domains**).

### A4.3 Allow the website on the API

Render → **libverse-demo-api** → **Environment** → `CORS_ORIGINS` = the exact website URL(s),
comma-separated, no trailing slash → **Save, rebuild and deploy**.

## A5. The nightly reset (GitHub Actions)

1. GitHub → the repository → **Settings → Secrets and variables → Actions** → **New repository
   secret**: name **`DEMO_MONGODB_URI`**, value the **`libverse-demo-reset`** string (A1.4).
2. **Actions** → **Demo reset** → **Run workflow** once. The log shows only counts (accounts,
   loans, notifications...), never the connection string or any email.
3. From then on it runs every day at 02:00 IST (20:30 UTC). GitHub can start scheduled runs some
   minutes late, and pauses schedules after 60 days without commits: a manual **Run workflow**
   switches it back on.

What a reset does: deletes only what the `isDemo` accounts own (loans, reservations, reviews,
wishlists, notifications, audit entries, files), recreates the accounts with fresh sample data
and a new random password (every demo session ends), and recounts book stock. Books and any
account without `isDemo` are never touched.

## A6. Demo checklist

- [ ] `/api/health` shows `"db":"connected"`, `/api/auth/demo` shows `"enabled":true`, the AI `/health` shows `trainedBooks` > 0.
- [ ] The demo website shows only the three buttons and the reset line: no email field, no password, no "Create an account". `/signup` and `/forgot-password` go back to the login page.
- [ ] Each button opens its portal with the demo banner on top.
- [ ] Student: request a book, return one, pay a fine (the receipt shown to staff is the generated demo receipt), reserve a book that is out.
- [ ] Librarian: approve the request, verify the payment, issue and return at the scan desk.
- [ ] Admin: Analytics, Reports and the Audit log open.
- [ ] Blocked actions show "Disabled in demo mode": change password, edit/delete a book, CSV import, change a user's role, deactivate or delete a user, upload an avatar or cover.
- [ ] Sign-in rate limit: click a demo button 31 times in 15 minutes from one network; the 31st is refused. Then confirm a second network (e.g. phone data) can still sign in. If it cannot, Render passes more proxy hops: try `TRUST_PROXY=2`.
- [ ] Run **Demo reset** manually and check the changes you made are gone and the demo still signs in.
- [ ] Atlas has no automatic backups on M0, but the demo can always be rebuilt with `seedDemo.js --live`.

---

# Part B: production (when you need it)

Production is the same code with `DEMO_MODE` off. Do it after the demo works.

1. **Atlas:** in the same cluster create a user `libverse-app` with **readWrite on database
   `libverse`** only, and its connection string with `/libverse` after `.mongodb.net/`.
2. **Catalogue:** `npm run catalogue:export` (reads your local database), then with
   `$env:MONGODB_URI` set to the production string: `node scripts/importCatalogue.js` (dry run),
   `node scripts/importCatalogue.js --apply`, `node scripts/createAdmin.js`, and
   `Remove-Item Env:MONGODB_URI`. The import refuses a database that already has books.
3. **Render:** uncomment the `libverse-api` block in `render.yaml` and add a copy of the
   `libverse-ai` block named `libverse-ai-prod` (one recommendation service is trained with one
   catalogue, and the two catalogues differ). Commit, open **Blueprint → Sync**, and fill in:

   | Variable | Value |
   |---|---|
   | `NODE_VERSION` | `22` |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | the `libverse-app` string |
   | `JWT_SECRET` | a **new** secret (not the demo one) |
   | `JWT_EXPIRE` | `7d` |
   | `CORS_ORIGINS` | the production website URL |
   | `CSP_API_ORIGINS` | `https://libverse-api.onrender.com` |
   | `TRUST_PROXY` | `1` |
   | `REMINDERS_ENABLED` | `true` |
   | `AI_SERVICE_URL` | `https://libverse-ai-prod.onrender.com` |
   | `AI_SERVICE_TOKEN` | a **new** token, the same on `libverse-ai-prod` |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | optional, see below |

   Leave **`DEMO_MODE` unset**. The demo endpoints then answer 404 and demo accounts cannot exist
   there (seedDemo and resetDemo refuse any database not named `libverse_demo`).
4. **Vercel:** a second project `libverse` from the same repository (root `frontend`),
   `VITE_API_BASE_URL` = `https://libverse-api.onrender.com/api`, then put its URL in the API's
   `CORS_ORIGINS`.
5. **Forgot password by email (optional):** set all five SMTP variables on `libverse-api` (any
   provider: Brevo, Mailjet, SendGrid, or Gmail with an *App password*), e.g. `SMTP_HOST`
   `smtp-relay.brevo.com`, `SMTP_PORT` `587` (or `465`), `MAIL_FROM`
   `LibVerse <no-reply@yourdomain.com>`. The login page then shows **Forgot your password?**.
6. **Production checklist:**
   - [ ] `/api/health` connected; `/api/auth/demo` shows `"enabled":false`.
   - [ ] Sign in as the admin; refresh a deep link (e.g. `/admin/books`): no 404.
   - [ ] Every librarian/admin uses a unique password of 12+ characters; librarians are created under **Users → Add user** and change their temporary password at once.
   - [ ] `CORS_ORIGINS` lists only your website URL(s), never `*`.
   - [ ] Sign up a test student, borrow and return through a librarian, check the reports; deactivate the test accounts afterwards.
   - [ ] Upload a profile photo and a book cover; both survive a reload (stored in Atlas).
   - [ ] If SMTP is set, a reset code arrives by email.
   - [ ] Export the catalogue now and then (`npm run catalogue:export` with `MONGODB_URI` set to production), or use `mongodump`: M0 has no automatic backups.
   - [ ] If a secret was ever exposed, generate a new one and update it on Render (a new `JWT_SECRET` signs everyone out; a new `AI_SERVICE_TOKEN` must be set on both services).

---

# C. Getting the code onto `main`

Render and Vercel deploy from `main`. All finished work is on **`backup/security-fixes`**:

1. GitHub → **Pull requests** → **New pull request** → **base: `main`** ← **compare: `backup/security-fixes`**.
2. Wait for the **CI** checks (backend tests, frontend build, AI service tests).
3. Review → **Merge pull request** with **Create a merge commit** (a squash would make a local
   `main` that already has these commits diverge).
4. Locally: `git checkout main` then `git pull --ff-only`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Website loads but every request fails / "Network Error" | `VITE_API_BASE_URL` wrong (must end in `/api`; redeploy Vercel after changing it), or the website URL is missing from `CORS_ORIGINS` on the API. |
| The demo website shows the email/password form | `DEMO_MODE` is not exactly `true` on the API, or `VITE_API_BASE_URL` points at the production API. |
| "The demo accounts are being reset" on a demo button | The reset is running (a few seconds), or the database has no `isDemo` accounts: run `seedDemo.js --live` (A2). |
| A demo session ends suddenly | The nightly reset ran, or the 2-hour demo session expired: click a button again. |
| Demo reset workflow fails with "Refusing" | `DEMO_MONGODB_URI` must name the database `libverse_demo`. |
| `/api/health` returns 503, `"db":"disconnected"` | `MONGODB_URI` wrong (password, database name), or Atlas **Network Access** lacks `0.0.0.0/0`. |
| First request takes ~1 minute | Free Render services sleep when idle; that's expected. |
| No **AI** badge on "Picked for you" | AI service asleep or `AI_SERVICE_URL` / `AI_SERVICE_TOKEN` mismatch. |
| Browser console shows a CSP error for the API | The API is not on `*.onrender.com`: update `connect-src`/`img-src` in `frontend/vercel.json`. |

For running everything locally instead, see the README.
