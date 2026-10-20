# LibVerse deploy checklist (Windows, PowerShell)

The short version of **DEPLOYMENT.md**: do the steps in order and tick them off. Commands are for
**Windows PowerShell**, typed exactly as shown. Replace only the text in `<angle brackets>` (and
remove the brackets). Never paste a secret into a file in this repository, an issue or a chat:
keep every secret in a password manager.

Site names used below (yours may differ: use the URLs Vercel and Render give you):

| What | Example URL |
|---|---|
| Full App website (Vercel project `libverse`) | `https://libverse.vercel.app` |
| Demo website (Vercel project `libverse-demo`) | `https://libverse-demo.vercel.app` |
| Full App API (Render `libverse-api`) | `https://libverse-api.onrender.com` |
| Demo API (Render `libverse-demo-api`) | `https://libverse-demo-api.onrender.com` |
| AI service (Render `libverse-ai`) | `https://libverse-ai.onrender.com` |

---

## 1. Merge the code

1. On GitHub, open the pull request `feat/email-otp-and-demo-polish → main`, wait for the green **CI** checks, then **Merge pull request** → **Create a merge commit**.
2. Get `main` on your computer:

   ```powershell
   cd "D:\Codes\project\Library Management System\smart-library-system"
   git checkout main
   git pull --ff-only
   cd backend
   npm ci
   ```

## 2. Generate the secrets

1. Run this **three times** (still in `backend`), and save each output in your password manager under the name shown:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

   - 1st output → **JWT_SECRET (production)**
   - 2nd output → **JWT_SECRET (demo)**: must be different from the production one
   - 3rd output → **AI_SERVICE_TOKEN**: one value, used by all three Render services

## 3. MongoDB Atlas (one cluster, databases `libverse` and `libverse_demo`)

1. <https://cloud.mongodb.com> → **New Project** `LibVerse` → **Create** → **Build a Database** → **M0 Free**, provider **AWS**, a region near your Render region → name `libverse` → **Create Deployment**.
2. **Security → Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) → **Confirm**. Then **Add IP Address** → **Add Current IP Address** → **Confirm**.
3. **Security → Database Access** → **Add New Database User**, three times. Each: **Password** → **Autogenerate Secure Password** (save it) → **Database User Privileges** → **Specific Privileges** → **Add Specific Privilege** → `readWrite` on the database below (collection empty) → **Add User**.

   | Username | Database |
   |---|---|
   | `libverse-app` | `libverse` |
   | `libverse-demo-app` | `libverse_demo` |
   | `libverse-demo-reset` | `libverse_demo` |

4. **Database → Clusters → Connect** (on `libverse`) → **Drivers** → copy the connection string. Make three strings and save them (password in place of `<db_password>`, database name after `.mongodb.net/`):

   ```
   PROD    mongodb+srv://libverse-app:<password>@libverse.<xxxxx>.mongodb.net/libverse?retryWrites=true&w=majority&appName=libverse
   DEMO    mongodb+srv://libverse-demo-app:<password>@libverse.<xxxxx>.mongodb.net/libverse_demo?retryWrites=true&w=majority&appName=libverse
   RESET   mongodb+srv://libverse-demo-reset:<password>@libverse.<xxxxx>.mongodb.net/libverse_demo?retryWrites=true&w=majority&appName=libverse
   ```

## 4. Seed the production database (`libverse`)

1. Export the catalogue from your local database, then import it and create the first admin (in `backend`):

   ```powershell
   npm run catalogue:export
   $env:MONGODB_URI = "<PROD connection string>"
   node scripts/importCatalogue.js
   node scripts/importCatalogue.js --apply
   node scripts/createAdmin.js
   Remove-Item Env:MONGODB_URI
   ```

2. `importCatalogue.js` without `--apply` only shows counts; check them before the `--apply` line.
3. `createAdmin.js` asks for a name, an email and a password: use a **strong password of 12+ characters with letters and a number** that you use nowhere else (it is hidden while you type).

## 5. Seed the demo database (`libverse_demo`)

1. In `backend`:

   ```powershell
   $env:DEMO_MONGODB_URI = "<DEMO connection string>"
   node scripts/seedDemo.js --live
   node scripts/resetDemo.js
   Remove-Item Env:DEMO_MONGODB_URI
   ```

2. The last script is a dry run: it only prints what a reset would replace.

## 6. Brevo (email codes for the Full App)

1. Sign up at <https://www.brevo.com> (free plan) and confirm your account email.
2. **Senders, Domains & Dedicated IPs → Senders → Add a sender**: name `LibVerse`, the sending address (e.g. `no-reply@<yourdomain>` or your own Gmail address) → **Save** → open Brevo's confirmation email at that address and confirm.
3. Optional, better delivery: **Domains → Add a domain** and publish the DNS records Brevo shows.
4. **Profile menu → SMTP & API → API Keys → Generate a new API key** → name `libverse-api` → copy the key (`xkeysib-...`) into your password manager (shown only once).
5. **Security → Authorised IPs**: make sure the IP check is **off** (Render has no fixed IP).
6. Optional SMTP fallback: on the same **SMTP & API** page, tab **SMTP**, note the SMTP server, port, login and create an SMTP key.

## 7. Google OAuth client (Sign in with Google)

1. <https://console.cloud.google.com> → project picker → **New project** `LibVerse` → **Create** → select it.
2. **APIs & Services → OAuth consent screen** → **Get started** → app name `LibVerse`, your support email → **Next** → **External** → **Next** → your email → **Next** → agree → **Create**.
3. **Clients → Create client** → **Web application** → name `LibVerse web`.
4. **Authorized JavaScript origins** → **Add URI** for each (exact, no trailing slash):
   - `http://localhost`
   - `http://localhost:3000`
   - `https://libverse.vercel.app` (your Full App URL)
   - `https://libverse-demo.vercel.app` (your demo URL)
5. **Authorized redirect URIs**: leave empty → **Create** → copy the **Client ID** (`...apps.googleusercontent.com`). Do not save the client secret anywhere: it is not used.
6. **Audience** → **Publish app** → **Confirm** when you are ready for everyone (while in **Testing**, only the test users you add can sign in).

## 8. Render (Blueprint: two APIs and the AI service)

1. <https://dashboard.render.com> → **New** → **Blueprint** → connect GitHub → this repository → branch `main`. It lists `libverse-demo-api`, `libverse-api` and `libverse-ai`.
2. Fill in every variable:

   **libverse-ai**

   | Variable | Value |
   |---|---|
   | `PYTHON_VERSION` | already `3.11.9` (from `render.yaml`) |
   | `HOST` | `0.0.0.0` |
   | `AI_SERVICE_TOKEN` | **AI_SERVICE_TOKEN** |
   | `CORS_ORIGINS` | `https://libverse-demo-api.onrender.com,https://libverse-api.onrender.com` |

   **libverse-demo-api**

   | Variable | Value |
   |---|---|
   | `NODE_VERSION` | `22` |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | **DEMO** connection string |
   | `JWT_SECRET` | **JWT_SECRET (demo)** |
   | `DEMO_MODE` | `true` |
   | `DEMO_JWT_EXPIRE` | `2h` |
   | `CORS_ORIGINS` | `https://libverse-demo.vercel.app` |
   | `CSP_API_ORIGINS` | `https://libverse-demo-api.onrender.com` |
   | `TRUST_PROXY` | `1` |
   | `REMINDERS_ENABLED` | `true` |
   | `AI_SERVICE_URL` | `https://libverse-ai.onrender.com` |
   | `AI_SERVICE_TOKEN` | **AI_SERVICE_TOKEN** |
   | `AI_CATALOG` | `demo` |

   **libverse-api**

   | Variable | Value |
   |---|---|
   | `NODE_VERSION` | `22` |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | **PROD** connection string |
   | `JWT_SECRET` | **JWT_SECRET (production)** |
   | `JWT_EXPIRE` | `7d` |
   | `CORS_ORIGINS` | `https://libverse.vercel.app` |
   | `CSP_API_ORIGINS` | `https://libverse-api.onrender.com` |
   | `TRUST_PROXY` | `1` |
   | `REMINDERS_ENABLED` | `true` |
   | `AI_SERVICE_URL` | `https://libverse-ai.onrender.com` |
   | `AI_SERVICE_TOKEN` | **AI_SERVICE_TOKEN** |
   | `AI_CATALOG` | `production` |
   | `GOOGLE_CLIENT_ID` | the Client ID (step 7) |
   | `BREVO_API_KEY` | the Brevo API key (step 6) |
   | `MAIL_FROM` | the verified Brevo sender address |
   | `MAIL_FROM_NAME` | `LibVerse` |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | optional fallback (step 6.6), otherwise leave empty |

   Do **not** set `DEMO_MODE` on `libverse-api`.

3. **Apply** and wait until all three are **Live**.
4. Check in a browser:
   - `https://libverse-demo-api.onrender.com/api/health` → `"db":"connected"`
   - `https://libverse-demo-api.onrender.com/api/auth/demo` → `"enabled":true`
   - `https://libverse-api.onrender.com/api/health` → `"db":"connected"`
   - `https://libverse-api.onrender.com/api/auth/email` → `"enabled":true`
   - `https://libverse-api.onrender.com/api/auth/google` → `"enabled":true`
   - `https://libverse-ai.onrender.com/health` → `demo` and `production` catalogues above 0

## 9. Vercel (two projects from this repository)

1. <https://vercel.com/new> → import this repository → **Root Directory** → **Edit** → `frontend` → project name `libverse-demo` → **Environment Variables**:

   | Name | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://libverse-demo-api.onrender.com/api` |
   | `VITE_DEMO_MODE` | `true` |
   | `VITE_FULL_APP_URL` | `https://libverse.vercel.app` |

   → **Deploy**.
2. Again <https://vercel.com/new> → same repository → Root Directory `frontend` → project name `libverse` → **Environment Variables**:

   | Name | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://libverse-api.onrender.com/api` |
   | `VITE_GOOGLE_CLIENT_ID` | the Client ID (step 7) |
   | `VITE_DEMO_APP_URL` | `https://libverse-demo.vercel.app` |

   → **Deploy**.
3. If the URLs Vercel gave you differ from the examples: fix `VITE_FULL_APP_URL` / `VITE_DEMO_APP_URL` under **Settings → Environment Variables**, then **Deployments → ⋯ → Redeploy** each project (`VITE_` values are built in).

## 10. CORS for both APIs

1. Render → `libverse-demo-api` → **Environment** → `CORS_ORIGINS` = the exact demo site URL (https, no trailing slash) → **Save, rebuild and deploy**.
2. Render → `libverse-api` → **Environment** → `CORS_ORIGINS` = the exact Full App URL (several: comma-separated, no spaces, no trailing slash) → **Save, rebuild and deploy**.
3. Google Cloud → your OAuth client → check both site URLs are under **Authorized JavaScript origins** (step 7.4).

## 11. Demo reset every 6 hours (GitHub)

1. GitHub → the repository → **Settings → Secrets and variables → Actions → New repository secret** → Name `DEMO_MONGODB_URI`, Secret = the **RESET** connection string → **Add secret**.
2. **Actions → Demo reset → Run workflow** → **Run workflow**. It should finish green; the log shows counts only.
3. From now on it runs every 6 hours (00:30, 06:30, 12:30, 18:30 UTC).

## 12. Final tests

**Demo site** (`https://libverse-demo.vercel.app`)

1. Only **View as Student**, **View as Librarian**, **View as Admin** and "Data resets every 6 hours"; no email or password field, no Google button.
2. Top-right **Sign in / Create your own account** opens the Full App sign-in page.
3. After the demo API has slept (15+ minutes idle), the page shows "Waking up the demo library…" with a progress bar, then the role buttons.
4. Each role opens its portal with the demo banner ("Data resets every 6 hours") and the top-right link.
5. Student: request a book and pay a fine; Librarian: approve the request and verify the payment; Admin: open Analytics, Reports, Audit log.
6. Changing a password, editing a book or uploading a photo says "Disabled in demo mode".
7. **Actions → Demo reset → Run workflow**: your demo changes are gone.

**Full App** (`https://libverse.vercel.app`)

1. Sign in as the admin from step 4; open and refresh `/admin/books` (no 404).
2. `https://libverse.vercel.app/demo` opens the demo site.
3. Sign up with a new email and a password → the "Verify your email" screen → the emailed 6-digit code signs you in (look in spam the first time). **Resend code** unlocks after 60 seconds.
4. Make another account but sign in with its password before entering the code → "Please verify your email" and the code screen.
5. **Email code** tab → your email → **Email me a code** → the code signs you in.
6. **Forgot your password?** → code → new password works; the old one does not.
7. **Sign in with Google** with a new Google account → onboarding (phone, genres) → you are a student.
8. A librarian's work email on the Google button → "sign in with your password, then connect Google in Settings".
9. Upload a profile photo and a book cover; both survive a reload.
10. "Picked for you" shows the **AI** badge on both sites.
11. Browser console (F12): no red errors on the sign-in page of either site.
