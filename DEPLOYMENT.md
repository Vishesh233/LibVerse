# Deploying LibVerse

LibVerse is deployed as **two websites** running the same code:

| Site | Who uses it | Database | Sign-in |
|---|---|---|---|
| **Live Demo** | interviewers, visitors | `libverse_demo`: sample data, reset every night | three buttons: *Try as Student / Librarian / Admin* |
| **Full App** (production) | a real library | `libverse`: real members | email + password, email signup, **Sign in with Google** (new users are students) |

| Part | Host | Live Demo | Full App |
|---|---|---|---|
| Database | **MongoDB Atlas** (one free M0 cluster) | database `libverse_demo` | database `libverse` |
| API | **Render** | `libverse-demo-api` (`DEMO_MODE=true`) | `libverse-api` |
| Recommendations | **Render** | `libverse-ai`, shared (catalogue `demo`) | `libverse-ai`, shared (catalogue `production`) |
| Website | **Vercel** | project `libverse-demo` | project `libverse` |
| Nightly reset | **GitHub Actions** | `.github/workflows/demo-reset.yml` | none |

```
Demo site (Vercel) ──> libverse-demo-api ──> Atlas libverse_demo      GitHub Actions 02:00 IST ──> Atlas libverse_demo
                              └─── AI_CATALOG=demo ───────┐
                                                          ├──> libverse-ai (one model per catalogue)
                              ┌─── AI_CATALOG=production ─┘
Full App (Vercel) ──> libverse-api ──> Atlas libverse
        └── Google Identity Services (Sign in with Google) ──> ID token verified by libverse-api
```

The two sites never share a database, users or sessions. On the demo (`DEMO_MODE=true`) password
login, signup, password reset and Google sign-in are switched off on the server, and the demo
accounts cannot change passwords, accounts, the catalogue or system settings.

Nothing in this repository deploys by itself: every step below is done by you in a browser or
terminal. Work through the parts in order.

---

## Render free plan: is this enough?

Render's free plan gives **750 instance hours per month per workspace**, shared by every free web
service. A free service sleeps after about 15 minutes without requests and only uses hours while
awake (the first request after a sleep takes up to a minute).

This setup has **3 services** (two APIs and one shared AI service): on average each can be awake
about **8 hours a day** before the month's hours run out. That is plenty for a demo and a small
library with light traffic. The nightly reset talks to Atlas directly and does not wake Render.

- If the hours run out, Render suspends the free services until the next month.
- For a library with real daily users, move `libverse-api` (and `libverse-ai`) to a paid
  instance: paid services do not use free hours and never sleep.
- **Do not add an uptime pinger** to keep services awake: that alone uses about 2,200 hours a month.

---

## 1. Before you start

You need:

- Accounts on **GitHub** (with access to this repository), **MongoDB Atlas**, **Render**,
  **Vercel** and **Google Cloud** (a Google account).
- Node.js 20 or newer, and this repository checked out with `npm install` done in `backend/`.
- Random secrets, each generated with:

  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  ```

  | Secret | Used by |
  |---|---|
  | `JWT_SECRET` for the demo | `libverse-demo-api` only |
  | `JWT_SECRET` for the full app | `libverse-api` only (a **different** value) |
  | `AI_SERVICE_TOKEN` | `libverse-ai` and both APIs (the same value on all three) |
  | 3 Atlas database passwords | the database users (step 2.3) |

Keep them in a password manager. Never paste a secret into a committed file, an issue or a chat.

---

## 2. MongoDB Atlas: one cluster, two databases, separate users

### 2.1 Create the cluster

1. Go to <https://cloud.mongodb.com> and sign in.
2. **Create a project** `LibVerse` → **Create** (or **Build a Database**) → **M0 (Free)**, provider
   **AWS**, a region close to the Render region you will use (e.g. *Mumbai ap-south-1*, *Singapore*).
3. Cluster name `libverse` → **Create Deployment**.

### 2.2 Network access

Render's free services and GitHub Actions don't have fixed IP addresses:

1. **Security → Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) → **Confirm**.
2. Also **Add Current IP Address** so you can seed from your computer.

### 2.3 Three database users, each limited to one database

**Security → Database Access** → **Add New Database User**, three times. For each: authentication
**Password**, **Autogenerate Secure Password** (copy it to your password manager), then under
**Database User Privileges** open **Specific Privileges** → **Add Specific Privilege** → role
**`readWrite`** on the database below (leave the collection empty). Do **not** use a built-in role
such as *Read and write to any database*.

| Username | Database | Used by |
|---|---|---|
| `libverse-app` | `libverse` | the Full App API (`libverse-api`) and your seeding |
| `libverse-demo-app` | `libverse_demo` | the demo API (`libverse-demo-api`) and the demo seed |
| `libverse-demo-reset` | `libverse_demo` | only the nightly reset on GitHub |

A leaked demo secret can then never reach real members' data.

### 2.4 Connection strings

**Database → Clusters** → **Connect** on `libverse` → **Drivers** → copy the string. For each user,
put the password in place of `<db_password>` and the database name right after `.mongodb.net/`:

```
libverse-app         mongodb+srv://libverse-app:PASSWORD@libverse.xxxxx.mongodb.net/libverse?retryWrites=true&w=majority&appName=libverse
libverse-demo-app    mongodb+srv://libverse-demo-app:PASSWORD@libverse.xxxxx.mongodb.net/libverse_demo?retryWrites=true&w=majority&appName=libverse
libverse-demo-reset  mongodb+srv://libverse-demo-reset:PASSWORD@libverse.xxxxx.mongodb.net/libverse_demo?retryWrites=true&w=majority&appName=libverse
```

If a password has characters such as `@ : / ? #`, URL-encode them or generate one with letters and
digits only.

---

## 3. Fill the databases (from your computer)

Run these from `backend/` in PowerShell (bash/zsh: `export NAME="..."` and `unset NAME`).

### 3.1 Full App: the catalogue and the first admin

```powershell
npm run catalogue:export                     # reads your LOCAL database (backend/.env)
$env:MONGODB_URI = "<the libverse-app string>"
node scripts/importCatalogue.js              # dry run: check the counts
node scripts/importCatalogue.js --apply      # write (refuses a database that already has books)
node scripts/createAdmin.js                  # your admin: name, email, a strong password (12+ chars)
Remove-Item Env:MONGODB_URI
```

Students sign up themselves (email or Google); create librarians under **Users → Add user**.

### 3.2 Live Demo: sample data

```powershell
$env:DEMO_MONGODB_URI = "<the libverse-demo-app string>"
node scripts/seedDemo.js --live              # full catalogue + 28 fictional demo accounts
node scripts/resetDemo.js                    # dry run: what a nightly reset replaces
Remove-Item Env:DEMO_MONGODB_URI
```

`--live` marks every demo account `isDemo` with a random password that is never shown: they can
only be used through the demo buttons. Both demo scripts refuse any database not named
`libverse_demo`.

---

## 4. Google Cloud Console: "Sign in with Google" (Full App only)

You need the **website URL of the Full App** for step 4.5. If you don't have it yet, do steps
4.1-4.4 now and 4.5-4.6 after step 7 (Vercel), then redeploy the Full App site.

### 4.1 Project

1. Open <https://console.cloud.google.com> and sign in with the Google account that should own the app.
2. Project picker (top bar) → **New project** → name `LibVerse` → **Create**, then select it.

### 4.2 Consent screen (Google Auth Platform)

1. Menu → **APIs & Services → OAuth consent screen** (it opens **Google Auth Platform**) → **Get started**.
2. **App information:** app name `LibVerse`, user support email (yours) → **Next**.
3. **Audience:** **External** → **Next**.
4. **Contact information:** your email → **Next** → agree to the policy → **Create**.

### 4.3 Branding (optional but recommended)

**Branding:** application home page = the Full App URL, and under **Authorized domains** add your
own domain if you have one (e.g. `yourlibrary.org`). Google may refuse a `*.vercel.app` address
here; that is fine for sign-in with the button, or use a custom domain. Do not upload a logo unless
you want to go through Google's brand verification.

### 4.4 Scopes and publishing

1. **Data access:** nothing to add. The button only uses `openid`, `email` and `profile`, which need
   no Google review.
2. **Audience → Publishing status:** while it says **Testing**, only the **Test users** you add
   there can sign in. When the Full App is live, click **Publish app** → **Confirm** (status
   **In production**; no verification is needed for these basic scopes).

### 4.5 The OAuth client

1. **Clients → Create client** → application type **Web application** → name `LibVerse web`.
2. **Authorized JavaScript origins** → **Add URI** for each (exact, no path, no trailing slash):
   - `http://localhost`
   - `http://localhost:3000` (local development)
   - `https://libverse.vercel.app` (your Full App URL from step 7)
   - your custom domain, e.g. `https://library.yourdomain.org`, if you add one
3. **Authorized redirect URIs:** leave empty (the button uses a popup).
4. **Create** → copy the **Client ID** (`...apps.googleusercontent.com`). The client secret is not
   used by LibVerse: don't store it anywhere.

New origins can take a few minutes (rarely hours) to start working.

### 4.6 Where the Client ID goes

| Where | Variable |
|---|---|
| Render → `libverse-api` | `GOOGLE_CLIENT_ID` |
| Vercel → project `libverse` (Full App) | `VITE_GOOGLE_CLIENT_ID` (then redeploy: it is built in) |
| Demo API and demo site | **nowhere** (the demo never offers Google) |

How it behaves: a new Google user always becomes a **student** (no password; phone number asked
during onboarding). A student account with the same email is connected only when Google says the
email is verified. Staff accounts are never connected automatically: a librarian or admin signs
in with their password and connects Google under **Settings → Security**. Google accounts can set
a password later in **Settings → Security**; "Forgot password" sends them a "sign in with Google"
email instead of a code.

---

## 5. Get the code onto `main`

Render and Vercel deploy from `main`. All the work is on the branch `feature/google-signin` (it
contains everything from `backup/security-fixes` too): open the pull request
`feature/google-signin → main` on GitHub, wait for the **CI** checks, review and **Merge pull
request** with **Create a merge commit**. Then locally: `git checkout main` and `git pull --ff-only`.

---

## 6. Render: two APIs and one AI service

### 6.1 Create the services from the Blueprint

1. <https://dashboard.render.com> → **New** → **Blueprint** → connect GitHub → this repository,
   branch **`main`**. Render reads `render.yaml` and lists **libverse-demo-api**, **libverse-api**
   and **libverse-ai**.
2. Fill in the variables (the file only names them). Use the URLs Render shows for each service if
   it had to give a different name (e.g. `libverse-api-x1y2`).

**libverse-ai** (shared)

| Variable | Value |
|---|---|
| `PYTHON_VERSION` | already set to `3.11.9` by `render.yaml` (numpy 1.24 needs Python 3.11; also in `ai-service/.python-version`) |
| `HOST` | `0.0.0.0` |
| `AI_SERVICE_TOKEN` | the `AI_SERVICE_TOKEN` secret |
| `CORS_ORIGINS` | `https://libverse-demo-api.onrender.com,https://libverse-api.onrender.com` |

**libverse-demo-api** (Live Demo)

| Variable | Value |
|---|---|
| `NODE_VERSION` | `22` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | the `libverse-demo-app` string |
| `JWT_SECRET` | the **demo** `JWT_SECRET` |
| `DEMO_MODE` | `true` |
| `DEMO_JWT_EXPIRE` | `2h` |
| `CORS_ORIGINS` | the demo website URL, e.g. `https://libverse-demo.vercel.app` (placeholder until step 7) |
| `CSP_API_ORIGINS` | `https://libverse-demo-api.onrender.com` |
| `TRUST_PROXY` | `1` |
| `REMINDERS_ENABLED` | `true` |
| `AI_SERVICE_URL` | `https://libverse-ai.onrender.com` |
| `AI_SERVICE_TOKEN` | the `AI_SERVICE_TOKEN` secret |
| `AI_CATALOG` | `demo` |

**libverse-api** (Full App)

| Variable | Value |
|---|---|
| `NODE_VERSION` | `22` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | the `libverse-app` string |
| `JWT_SECRET` | the **Full App** `JWT_SECRET` |
| `JWT_EXPIRE` | `7d` |
| `CORS_ORIGINS` | the Full App website URL, e.g. `https://libverse.vercel.app` (placeholder until step 7) |
| `CSP_API_ORIGINS` | `https://libverse-api.onrender.com` |
| `TRUST_PROXY` | `1` |
| `REMINDERS_ENABLED` | `true` |
| `AI_SERVICE_URL` | `https://libverse-ai.onrender.com` |
| `AI_SERVICE_TOKEN` | the `AI_SERVICE_TOKEN` secret |
| `AI_CATALOG` | `production` |
| `GOOGLE_CLIENT_ID` | the Client ID from step 4.5 (leave empty until then: Google sign-in stays off) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | optional: "Forgot password" by email (step 9) |

Leave `DEMO_MODE` **unset** on `libverse-api`.

3. **Apply**. Render builds all three (a few minutes). `autoDeploy` is off: later changes deploy
   when you click **Manual Deploy** on a service.

### 6.2 Check them

| URL | Expected |
|---|---|
| `https://libverse-demo-api.onrender.com/api/health` | `"db":"connected"` |
| `https://libverse-demo-api.onrender.com/api/auth/demo` | `"enabled":true` |
| `https://libverse-api.onrender.com/api/health` | `"db":"connected"` |
| `https://libverse-api.onrender.com/api/auth/demo` | `"enabled":false` |
| `https://libverse-api.onrender.com/api/auth/google` | `"enabled":true` once `GOOGLE_CLIENT_ID` is set |
| `https://libverse-ai.onrender.com/health` | `"catalogs"` shows `demo` and `production` above 0 (restart an API if one is 0) |

---

## 7. Vercel: two projects from the same repository

Do this twice, at <https://vercel.com/new> → import this repository → **Root Directory** →
**Edit** → **`frontend`** (framework **Vite**; `frontend/vercel.json` sets the build too):

| Project name | Environment variables |
|---|---|
| `libverse-demo` | `VITE_API_BASE_URL` = `https://libverse-demo-api.onrender.com/api` |
| `libverse` | `VITE_API_BASE_URL` = `https://libverse-api.onrender.com/api`, `VITE_GOOGLE_CLIENT_ID` = the Client ID |

**Deploy** each and note its URL (custom domains: **Settings → Domains**). Then:

1. Render → **libverse-demo-api** → **Environment** → `CORS_ORIGINS` = the demo site URL →
   **Save, rebuild and deploy**.
2. Render → **libverse-api** → `CORS_ORIGINS` = the Full App URL(s), comma-separated, no trailing
   slash → **Save, rebuild and deploy**.
3. Google Cloud Console → your OAuth client → make sure the Full App URL is in **Authorized
   JavaScript origins** (step 4.5). If you set `VITE_GOOGLE_CLIENT_ID` after the first deploy,
   **Redeploy** the `libverse` project.

---

## 8. The nightly demo reset (GitHub Actions)

1. GitHub → the repository → **Settings → Secrets and variables → Actions** → **New repository
   secret**: `DEMO_MONGODB_URI` = the **`libverse-demo-reset`** string.
2. **Actions → Demo reset → Run workflow** once. The log shows only counts, never the connection
   string or any email.
3. It then runs every day at 02:00 IST (20:30 UTC). GitHub can start scheduled runs some minutes
   late and pauses schedules after 60 days without commits: a manual **Run workflow** switches it
   back on.

The reset replaces only what the `isDemo` accounts own and recounts stock; books and every other
account are never touched.

---

## 9. Optional: "Forgot password" by email (Full App)

Use any SMTP provider (Brevo, Mailjet, SendGrid, or Gmail with an *App password*) and set all five
on **libverse-api**: `SMTP_HOST` (e.g. `smtp-relay.brevo.com`), `SMTP_PORT` (`587`, or `465`),
`SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (e.g. `LibVerse <no-reply@yourdomain.com>`). Save and
redeploy: the login page then shows **Forgot your password?**.

---

## 10. Final checks

### Live Demo

- [ ] The demo site shows only the three buttons and "This is a demo with sample data. It resets daily." (no email field, no password, no signup, no Google button). `/signup` and `/forgot-password` go back to the login page.
- [ ] Each button opens its portal with "You're viewing a demo account. Data resets daily." on top.
- [ ] Student: request a book, return one, pay a fine, reserve a book that is out.
- [ ] Librarian: approve the request, verify the payment (the receipt is the generated demo receipt), issue and return at the scan desk.
- [ ] Admin: Analytics, Reports and the Audit log open.
- [ ] Blocked actions show "Disabled in demo mode": change password, edit/delete a book, CSV import, change a user's role, deactivate or delete a user, upload an avatar or a cover.
- [ ] **Demo reset → Run workflow**: your changes are gone and the buttons still work.

### Full App

- [ ] Sign in as the admin from step 3.1; refresh a deep link (e.g. `/admin/books`): no 404.
- [ ] **Sign in with Google** with a Google account that has no LibVerse account: you land on onboarding, which shows your Library ID and asks for your phone number, then genres; you are a **student**.
- [ ] Settings → Security of that account shows **Set a password**; after setting one, email + password sign-in works too.
- [ ] Sign up with email and password: onboarding asks only for genres (unchanged).
- [ ] A librarian clicking **Sign in with Google** with their work email is told to sign in with the password; after connecting Google in Settings → Security (current password needed), the Google button signs them in.
- [ ] `CORS_ORIGINS` on each API lists only that site's URL(s), never `*`.
- [ ] Upload a profile photo and a book cover: both survive a reload.
- [ ] "Picked for you" shows the **AI** badge on both sites, each with its own books.
- [ ] Rate limits: from one network, 11 wrong passwords in 15 minutes are refused; a second network can still sign in. If everyone gets blocked together, try `TRUST_PROXY=2`.
- [ ] Every librarian/admin uses a unique password of 12+ characters.
- [ ] Back up now and then: `npm run catalogue:export` with `MONGODB_URI` set to the Full App string, or `mongodump` (M0 has no automatic backups).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Website loads but every request fails / "Network Error" | `VITE_API_BASE_URL` wrong (must end in `/api`; redeploy Vercel after changing it), or the site URL is missing from that API's `CORS_ORIGINS`. |
| The demo site shows the email/password form | `DEMO_MODE` is not exactly `true` on `libverse-demo-api`, or the demo site's `VITE_API_BASE_URL` points at `libverse-api`. |
| No "Sign in with Google" button on the Full App | `VITE_GOOGLE_CLIENT_ID` missing on the Vercel project (redeploy after adding it) or `GOOGLE_CLIENT_ID` missing on `libverse-api`. |
| Google popup says "origin is not allowed" / error 400 | The exact site URL (https, no trailing slash) is missing from **Authorized JavaScript origins**, or was added minutes ago. |
| Only some Google accounts can sign in | The consent screen is still in **Testing**: add test users or **Publish app**. |
| "Google sign-in failed" after picking an account | `GOOGLE_CLIENT_ID` on the API differs from `VITE_GOOGLE_CLIENT_ID` on the site. |
| "The demo accounts are being reset" | The reset is running (seconds), or the demo database has no demo accounts: run `seedDemo.js --live` (3.2). |
| `/api/health` returns 503, `"db":"disconnected"` | `MONGODB_URI` wrong (password, database name), or Atlas **Network Access** lacks `0.0.0.0/0`. |
| No **AI** badge, or recommendations from the other site's books | `AI_SERVICE_URL` / `AI_SERVICE_TOKEN` mismatch, or both APIs use the same `AI_CATALOG` (must be `demo` and `production`). |
| First request takes ~1 minute | Free Render services sleep when idle; that's expected. |
| Browser console shows a CSP error | The API is not on `*.onrender.com`: update `connect-src`/`img-src` in `frontend/vercel.json`. |

For running everything locally instead, see the README.
