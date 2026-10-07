# Post-Development & Real Live Deployment Runbook

> **File Name**: `POST_DEPLOYMENT_LIVE_CHECKLIST.md`  
> **Target Audience**: DevSecOps, Deployment Team, Project Owners  
> **Status**: Live Production Execution Checklist  
> **Purpose**: Critical operational steps, secret rotations, and infrastructure configurations that must be performed **during actual live production deployment / release time** rather than during local development.

---

## 1. Secrets & Credentials Rotation (Mandatory Before Going Live)

### 1.1. Revoke Compromised Gmail App Password
- [ ] Log in to Google Account: `rayakanti.sathwik012@gmail.com`
- [ ] Go to **Google Account Settings** $\rightarrow$ **Security** $\rightarrow$ **2-Step Verification** $\rightarrow$ **App Passwords**.
- [ ] Find and **Delete / Revoke** the exposed app password (`uezu fhbl trwo fbta` leaked in initial commit `f5f4d093`).
- [ ] Generate a fresh App Password specifically for production mail delivery (e.g., named `CampusMart-Production-Mail`).
- [ ] Update `EMAIL_PASS` in your production hosting dashboard (Railway/Render). **Never commit it to Git.**

### 1.2. Generate Cryptographically Strong Production JWT Secrets
Do not reuse old development keys. Run this command in terminal to generate unique 64-byte random strings:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
- [ ] Set generated output as `JWT_SECRET` in Railway/production environment variables.
- [ ] Generate a second string and set as `JWT_REFRESH_SECRET`.

### 1.3. Enforce Strong Admin Initial Password
- [ ] In production hosting dashboard, set `ADMIN_INITIAL_PASSWORD` to a strong unique password (minimum 16 characters with letters, numbers, and symbols).
- [ ] Verify that default password `Admin@1234` is never used in any live environment.

---

## 2. Production Environment Variables Checklist

Configure these variables directly in your production hosting platform (e.g., Railway, Render, Vercel) — **do not commit them to repository files**:

| Environment Variable | Production Value Requirement | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enforces production security headers, disables stack traces, activates strict CORS. |
| `DATABASE_URL` | `postgresql://...:5432/... ?sslmode=require` | Live database URL with mandatory TLS/SSL encryption. |
| `JWT_SECRET` | *(64-byte random string)* | Cryptographic signing key for JWT auth tokens. |
| `JWT_REFRESH_SECRET` | *(64-byte random string)* | Cryptographic key reserved for token refresh rotations. |
| `ADMIN_INITIAL_EMAIL` | `admin@campusmart.in` | Live administrative account email. |
| `ADMIN_INITIAL_PASSWORD` | *(Strong custom password)* | Replaces the default `Admin@1234`. |
| `FRONTEND_URL` | `https://campusmart.in` | Live customer frontend origin (strict CORS target). |
| `ADMIN_URL` | `https://admin.campusmart.in` (or same) | Live admin portal origin. |
| `GROQ_API_KEY` | `gsk_...` | Live Groq Cloud API key for Chatbot service. |
| `GROQ_MODEL` | `llama-3.1-8b-instant` or `mixtral-8x7b-32768` | AI inference model name. |
| `EMAIL_USER` | `info@campusmart.in` or Gmail account | Production SMTP username. |
| `EMAIL_PASS` | *(Fresh Google App Password)* | Production SMTP authorization key. |
| `GOOGLE_SHEETS_WEBHOOK_URL` | `https://script.google.com/macros/s/.../exec` | Production enquiry mirroring webhook. |
| `GOOGLE_SHEETS_WEBHOOK_SECRET` | *(Random alphanumeric string)* | Shared secret signature verifying webhook authenticity. |

---

## 3. Git History Sanitization (Before Making Repository Public)

Because commit `f5f4d093de4f9414680a60215e71a850bf2ec8d3` contained the old `.env` file, purge it prior to open-sourcing or transferring repository ownership:

```bash
# 1. Ensure working directory is clean and backup repository
git clone --mirror <repo-url> campusmart-backup.git

# 2. Use git-filter-repo (Python tool) to strip the file from all commits
pip install git-filter-repo
git filter-repo --path backend/.env --invert-paths

# 3. Force push cleaned branches to origin (coordinate with team before doing this)
git push origin --force --all
git push origin --force --tags
```

---

## 4. Architectural Enhancements for Live Operations (Post-Launch)

These tasks are architectural upgrades that require cross-domain alignment between frontend and backend hosts:

### 4.1. Migration to `httpOnly` Cookies for JWT Storage
* **Current State**: JWT is stored in `localStorage` (`cm_token`).
* **Live Target**:
  * Set `Set-Cookie: token=...; HttpOnly; Secure; SameSite=Lax; Domain=.campusmart.in; Path=/` on successful login/OTP verification.
  * Completely protects session tokens from being accessible by client-side JavaScript, eliminating token theft risks from XSS.
* **Prerequisite**: Frontend (`campusmart.in`) and Backend API (`api.campusmart.in`) must share the root top-level domain `.campusmart.in` in production.

### 4.2. Single-Use Pre-Signed URLs for PDF Catalogues
* **Current State**: PDF catalogues are downloaded by passing `?token=` in the URL query string.
* **Live Target**:
  * Implement an endpoint `POST /api/catalogues/:id/download-ticket` returning a short-lived (60 seconds) cryptographically signed single-use download token.
  * Eliminates long-lived 7-day session JWTs from appearing in browser URL histories and server access logs.

---

## 5. Pre-Flight Live Production Smoke Test Checklist

Execute these verifications immediately after live deployment:
- [ ] **SSL / HTTPS**: Verify SSL certificate is valid and HTTP automatically redirects to HTTPS.
- [ ] **CORS Verification**: Test calling `https://api.campusmart.in/health` from an unauthorized origin in browser console — verify request is rejected with CORS error.
- [ ] **OTP Delivery**: Register a test account with a real email and confirm OTP arrives within 30 seconds.
- [ ] **Rate Limiter Test**: Send 6 consecutive requests to `/api/auth/send-otp` and verify the 6th receives HTTP 429 (*"Too many requests"*).
- [ ] **Admin Login**: Log in with production `ADMIN_INITIAL_PASSWORD` and verify `/admin/dashboard` metrics load.
- [ ] **Upload Restrictions**: Test uploading an `.svg` file in products/media — verify server returns `400 Invalid file format`.
- [ ] **Chatbot Integration**: Send a prompt in the frontend Chatbot widget and confirm dynamic Groq response is received.
- [ ] **Error Masking**: Trigger an intentional error (e.g. invalid query) and confirm response body shows generic `"An internal server error occurred"` with no stack traces or database schema names.
