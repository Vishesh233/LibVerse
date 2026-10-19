# Deploying LibVerse

This guide puts LibVerse online with free tiers:

| Part | Host | What it runs |
|---|---|---|
| Database | **MongoDB Atlas** (M0 free cluster) | all data, plus uploaded avatars and covers (GridFS) |
| API | **Render** web service `libverse-api` | `backend/` (Node/Express) |
| Recommendations | **Render** web service `libverse-ai` | `ai-service/` (Python/Flask) |
| Website | **Vercel** | `frontend/` (React/Vite) |

```
Browser ──> Vercel (frontend) ──HTTPS──> Render libverse-api ──> MongoDB Atlas
                                              └──X-Service-Token──> Render libverse-ai
```

Work through the steps in order. It takes about an hour. Nothing in this repository deploys by
itself: every step below is done by you in a browser or terminal.

---

## 0. Before you start

You need:

- A GitHub account with access to this repository, and accounts on **MongoDB Atlas**, **Render** and
  **Vercel** (all can sign in with GitHub).
- Node.js 20 or newer on your computer, and this repository checked out with `npm install` done in
  `backend/`.
- Three long random secrets. Generate each one with:

  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  ```

  Keep them in a password manager:

  | Name | Used for |
  |---|---|
  | `JWT_SECRET` | signing login sessions (API only) |
  | `AI_SERVICE_TOKEN` | the API ⇄ recommendation service handshake (same value on both services) |
  | Atlas database password | the database user (step 1.3) |

Never paste a secret into a file that is committed, an issue, or a chat.

---

## 1. MongoDB Atlas

### 1.1 Create the cluster

1. Go to <https://cloud.mongodb.com> and sign in.
2. **Create a project**: name it `LibVerse` → **Next** → **Create Project**.
3. Click **Create** (or **Build a Database**).
4. Choose **M0 (Free)**. Provider: **AWS**. Region: the one closest to your Render region
   (e.g. *Mumbai ap-south-1* or *Singapore*; pick the same area for Render in step 3).
5. Cluster name: `libverse` → **Create Deployment**.

### 1.2 Network access

Render's free services don't have fixed outgoing IP addresses, so Atlas must accept connections
from anywhere (the database user and password still protect it).

1. Left menu **Security → Network Access** → **Add IP Address**.
2. Click **Allow Access from Anywhere** (`0.0.0.0/0`) → **Confirm**.
3. Also add your current IP (**Add Current IP Address**) so you can seed from your computer.

### 1.3 Database user

1. **Security → Database Access** → **Add New Database User**.
2. Authentication: **Password**. Username: `libverse-app`.
   Click **Autogenerate Secure Password** → copy it to your password manager.
3. Built-in role: **Read and write to any database**.
4. **Add User**.

### 1.4 Connection string

1. **Database → Clusters** → **Connect** on `libverse` → **Drivers**.
2. Copy the string. It looks like
   `mongodb+srv://libverse-app:<db_password>@libverse.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=libverse`
3. Put the password in place of `<db_password>` and add the database name **`libverse`** right after
   `.mongodb.net/`:

   ```
   mongodb+srv://libverse-app:PASSWORD@libverse.xxxxx.mongodb.net/libverse?retryWrites=true&w=majority&appName=libverse
   ```

   This full string is your **`MONGODB_URI`**. If the password has characters such as `@ : / ? #`,
   URL-encode them (or generate a new password with letters and digits only).

---

## 2. Seed the Atlas database

Run these from `backend/` on your computer. The first command reads your **local** database
(from `backend/.env`); the other two write to **Atlas** because `MONGODB_URI` is set in the shell,
which takes precedence over `backend/.env`.

### 2.1 Export the catalogue from your local database

```bash
cd backend
npm run catalogue:export
```

This writes `backend/scripts/data/catalogue-export.json` (books only: no users, loans or
personal data; the file is git-ignored). Covers uploaded on your machine are not exported; those
books fall back to their Open Library cover.

### 2.2 Import it into Atlas

PowerShell (Windows):

```powershell
$env:MONGODB_URI = "mongodb+srv://libverse-app:PASSWORD@libverse.xxxxx.mongodb.net/libverse?retryWrites=true&w=majority&appName=libverse"
node scripts/importCatalogue.js            # dry run: check the counts
node scripts/importCatalogue.js --apply    # write
```

bash/zsh (macOS/Linux): replace the first line with `export MONGODB_URI="mongodb+srv://..."`.

The import refuses to run if the Atlas database already has books. Every copy starts on the shelf.

### 2.3 Create the first admin

In the same terminal (with `MONGODB_URI` still pointing at Atlas):

```bash
node scripts/createAdmin.js
```

Enter a name, an email you can receive mail at, and a strong password (12+ characters with a
number; it is not shown while you type). Then clear the variable so later commands use your local
database again:

```powershell
Remove-Item Env:MONGODB_URI      # PowerShell
```
```bash
unset MONGODB_URI                # bash/zsh
```

Students sign up themselves on the website; create librarian accounts from **Users → Add user**
after you sign in as the admin.

---

## 3. Merge the work into `main` (pull request)

All finished work is on the branch **`backup/security-fixes`**. Render and Vercel will deploy from
`main`, so merge it through a pull request first:

1. Open the repository on GitHub → **Pull requests** → **New pull request**.
2. **base: `main`** ← **compare: `backup/security-fixes`** → **Create pull request**.
3. Title e.g. *"LibVerse: security, tests/CI, staff pages, import, OTP, data, deployment"*.
4. Wait for the **CI** checks (backend tests, frontend build, AI service tests) to pass.
5. Review the changes → **Merge pull request** → **Confirm merge**.

---

## 4. Render: API and recommendation service

### 4.1 Create both services from the Blueprint

1. Go to <https://dashboard.render.com> → **New** → **Blueprint**.
2. Connect GitHub and pick this repository, branch **`main`**. Render finds `render.yaml` and
   lists **libverse-api** and **libverse-ai**.
3. Render asks for every environment variable (the file only names them). Fill in:

**libverse-ai** (recommendation service)

| Variable | Value |
|---|---|
| `PYTHON_VERSION` | `3.11.9` |
| `HOST` | `0.0.0.0` |
| `AI_SERVICE_TOKEN` | your `AI_SERVICE_TOKEN` secret |
| `CORS_ORIGINS` | `https://libverse-api.onrender.com` (the API's URL; only the API calls this service) |

**libverse-api** (backend)

| Variable | Value |
|---|---|
| `NODE_VERSION` | `22` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | the Atlas string from step 1.4 |
| `JWT_SECRET` | your `JWT_SECRET` secret |
| `JWT_EXPIRE` | `7d` |
| `CORS_ORIGINS` | your Vercel URL, e.g. `https://libverse.vercel.app` (fill in a placeholder now and correct it in step 5.3) |
| `CSP_API_ORIGINS` | the API's own URL, e.g. `https://libverse-api.onrender.com` |
| `TRUST_PROXY` | `1` |
| `REMINDERS_ENABLED` | `true` |
| `AI_SERVICE_URL` | the AI service URL, e.g. `https://libverse-ai.onrender.com` |
| `AI_SERVICE_TOKEN` | the **same** `AI_SERVICE_TOKEN` secret |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | see step 6, or leave empty for now |

4. **Apply**. Render builds both services (a few minutes).

Service URLs are `https://<name>.onrender.com`. If Render had to give a service a different name
(e.g. `libverse-api-x1y2`), use the URLs Render shows on each service's page for
`AI_SERVICE_URL`, `CSP_API_ORIGINS`, the AI service's `CORS_ORIGINS` and `VITE_API_BASE_URL`
(step 5).

### 4.2 Check they are healthy

Open in a browser:

- `https://libverse-api.onrender.com/api/health` → `{"status":"ok","db":"connected",...}`
  (a `503` with `"db":"disconnected"` means `MONGODB_URI` or Atlas network access is wrong)
- `https://libverse-ai.onrender.com/health` → `{"status":"ok",...,"trainedBooks":<number>}`
  (the API sends the catalogue to it on start; if `trainedBooks` is 0, restart **libverse-api**)

Good to know on the free plan: services sleep after ~15 minutes without traffic and the first
request then takes up to a minute. While the AI service is asleep, "Picked for you" uses the
built-in genre-based suggestions instead (no error is shown). The AI service runs Flask's built-in
server, which is fine for a demo; for real traffic add a production server such as gunicorn.

---

## 5. Vercel: the website

### 5.1 Import the project

1. Go to <https://vercel.com/new> → import this GitHub repository.
2. **Root Directory**: click **Edit** → choose **`frontend`**.
3. Framework preset: **Vite** (build `npm run build`, output `dist`; `frontend/vercel.json` sets these too).
4. **Environment Variables**: add

   | Name | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://libverse-api.onrender.com/api` (your API URL + `/api`) |

5. **Deploy**.

`frontend/vercel.json` sends every path to the app (so `/login` or a refreshed page never shows a
404) and sets the security headers. Its Content-Security-Policy allows API calls to
`https://*.onrender.com`; if your API runs somewhere else, change `connect-src` and `img-src` in
`frontend/vercel.json` to that origin.

### 5.2 Note the website URL

Vercel shows it after the deploy, e.g. `https://libverse.vercel.app` (you can add your own domain
under **Settings → Domains**).

### 5.3 Allow the website on the API

On Render → **libverse-api** → **Environment** → set `CORS_ORIGINS` to the exact website URL(s),
comma-separated, no trailing slash (e.g. `https://libverse.vercel.app,https://www.yourdomain.com`)
→ **Save, rebuild and deploy**.

---

## 6. Optional: "Forgot password" by email

Without these settings the login page tells users to ask a librarian or admin to reset their
password. To let users reset it with a 6-digit code by email, use any SMTP provider (Brevo,
Mailjet, SendGrid, or a Gmail account with an *App password*), then on Render → **libverse-api**
→ **Environment** set all five:

| Variable | Example |
|---|---|
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` (or `465` for TLS from the start) |
| `SMTP_USER` | the SMTP login from your provider |
| `SMTP_PASS` | the SMTP password / API key |
| `MAIL_FROM` | `LibVerse <no-reply@yourdomain.com>` (an address your provider allows) |

Save and redeploy. The login page then shows **Forgot your password?**.

---

## 7. After the deploy: checklist

- [ ] `…/api/health` shows `"db":"connected"`; `…/health` on the AI service shows `trainedBooks` > 0.
- [ ] Open the website, sign in as the admin from step 2.3. Refresh on a deep link (e.g. `/admin/books`): no 404.
- [ ] **Strong staff passwords**: every librarian/admin account uses a unique password of 12+
      characters. Create librarian accounts under **Users → Add user** with a temporary password
      and ask them to change it at once (**Settings → Security**).
- [ ] **CORS**: the website works from your Vercel/custom URL; `CORS_ORIGINS` lists only your
      website URL(s), never `*`.
- [ ] **Test logins** for each role: sign up a test student, borrow and return a book through a
      librarian account, and check the admin dashboard and reports. Remove test accounts afterwards
      (deactivate them in **Users**).
- [ ] Upload a profile photo and a book cover: both show after a page reload (they are stored in
      Atlas, so they survive Render redeploys).
- [ ] "Picked for you" on the student dashboard shows the **AI** badge once the AI service is awake.
- [ ] If SMTP is set: request a reset code for the test student and check the email arrives.
- [ ] The scan desk camera works (the site must be on HTTPS, which Vercel provides).
- [ ] Atlas M0 has no automatic backups: export the catalogue now and then
      (`npm run catalogue:export` with `MONGODB_URI` set to Atlas), or use `mongodump`.
- [ ] If a secret was ever exposed, generate a new one and update it on Render (a new
      `JWT_SECRET` signs everyone out; a new `AI_SERVICE_TOKEN` must be set on both services).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Website loads but every request fails / "Network Error" | `VITE_API_BASE_URL` wrong (must end in `/api`; redeploy Vercel after changing it), or the website URL is missing from `CORS_ORIGINS` on the API. |
| `/api/health` returns 503, `"db":"disconnected"` | `MONGODB_URI` wrong (password, database name), or Atlas **Network Access** lacks `0.0.0.0/0`. |
| First request takes ~1 minute | Free Render services sleep when idle; that's expected. |
| No **AI** badge on "Picked for you" | AI service asleep or `AI_SERVICE_URL` / `AI_SERVICE_TOKEN` mismatch (the token must be identical on both services). |
| Avatars uploaded before deploy are missing | Only the catalogue is exported; users upload photos again on the live site. |
| Login page has no "Forgot your password?" link | One of the five SMTP variables is missing on the API. |
| Browser console shows a CSP error for the API | Your API is not on `*.onrender.com`: update `connect-src`/`img-src` in `frontend/vercel.json`. |

For running everything locally instead, see the README.
