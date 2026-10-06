# CampusMart — Active Issues Tracker
**Date**: October 6, 2026  
**Document Version**: 1.0  
**Status**: Active Tracking  

---

## Executive Summary
This document tracks all identified application defects, UX friction points, and architecture enhancements logged on **October 6, 2026**. It serves as the single source of truth for problem statements, root cause analyses, technical requirements, implementation status, and verification criteria.

---

## Summary Matrix

| ID | Issue Title | Category | Severity | Status | Target Milestone |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ISS-01** | Unified Single Login Portal & Input Hardening | Authentication / Security | High | ✅ Completed | Immediate (`AUTH-003`) |
| **ISS-12** | Smart Contact Actions with Gmail & Desktop Call Fallback | User Experience / Cross-Platform | Medium | ✅ Completed | Immediate (`UX-012`) |
| **ISS-02** | *(Pending next user selection)* | – | – | ⏳ Awaiting Details | – |
| **ISS-03** | *(Pending user input)* | – | – | ⏳ Awaiting Details | – |

---

## Detailed Issue Specifications

### Issue #1: Unified Single Login Portal & Input Hardening
- **Tracking ID**: `ISS-20261006-01` (`AUTH-003`)
- **Category**: Authentication, Security, RBAC, User Experience
- **Severity**: High (Impacting testing workflows, mobile authentication, and administrative access)
- **Status**: ✅ Completed & Verified (100% Dual-Build & 40/40 Automated Tests Passed)

#### 1. Problem Description & Root Cause
- **Dual Login Portals**: The system currently maintains two separate login pages: `/login` (public/customer) and `/admin/login` (admin panel). This causes severe user and tester confusion.
- **Session Divergence & Discrepancies**: 
  - An administrator logging in via `/login` was automatically forwarded to `/admin/dashboard` because their stored role was `admin`.
  - A tester using `/login` with non-admin credentials was redirected to `/my-account` and was blocked if attempting to access `/admin/*`.
  - Stored sessions between `localStorage` and `sessionStorage` could diverge if one portal set keys that the other didn't synchronize.
- **Whitespace / Mobile Copy-Paste Lockout**:
  - Passwords copied from chat apps (WhatsApp, Slack, email) frequently capture trailing whitespace (`"Admin@1234 "`).
  - While emails were trimmed, passwords were sent raw. In `bcrypt`, trailing whitespace produces an entirely different hash, resulting in silent `401 Invalid credentials` errors.
  - Mobile keyboards automatically capitalize the first character or engage predictive text on password/email inputs unless explicitly disabled.

#### 2. Technical Requirements

##### A. Scalability & Architecture
- **Single Entry Point (`/login`)**: All personas (customers, QA testers, admins, and future roles like vendors/editors) authenticate through the unified `/login` page.
- **Deprecate `/admin/login`**: Route `/admin/login` immediately issues an HTTP 302/React Router replace redirect to `/login?redirect=/admin/dashboard`. Existing bookmarks, browser history, and documentation links remain 100% functional.
- **Role-Based Extensibility**: The routing logic dynamically reads `user.role` from the authenticated session and routes polymorphically:
  - `role === 'admin'` $\rightarrow$ navigates to target redirect (default: `/admin/dashboard`).
  - `role === 'user'` $\rightarrow$ navigates to target redirect (default: `/my-account`).
  - Future roles (`editor`, `vendor`) can be added without altering the authentication pipeline.

##### B. Strict Validation & Input Sanitization
- **Client-Side Sanitization**:
  - `email`: `.trim().toLowerCase()` with regex validation (`[^\s@]+@[^\s@]+\.[^\s@]+`).
  - `password`: `.trim()` on form submission to eliminate accidental whitespace without degrading entropy.
  - Mobile attributes: `autoCapitalize="none"`, `autoCorrect="off"`, `spellCheck={false}` on both credentials fields.
- **Backend Defensive Fallback**:
  - In `POST /api/auth/login`, if the raw password comparison fails, defensively test against `password.trim()` before rejecting, ensuring zero friction for users with invisible whitespace.

##### C. Data Integrity & Session Atomicity
- **Atomic Session Persistence**:
  - `setUserSession` in `src/lib/auth-session.ts` updates both `localStorage` and `sessionStorage` atomically.
  - Populates `cm_token`, `cm_user`, and `cm_admin_token` (when `role === 'admin'`) synchronously to guarantee instant cross-tab and cross-component consistency.
- **Zero Credential Modification**:
  - Absolutely no database passwords will be reset or modified. Stored credential hashes are preserved intact.

##### D. Enterprise Security Controls
- **Open Redirect Defense**:
  - The `?redirect=` query parameter is strictly sanitized: must begin with a single `/` and match internal path regex `^\/[a-zA-Z0-9_\-\/?&=#.]*$`.
  - Absolute URLs (e.g. `https://evil.com`), protocol-relative URLs (`//evil.com`), and javascript schemas (`javascript:...`) are strictly rejected and defaulted to `/admin/dashboard` or `/my-account`.
- **RBAC Access Denied View**:
  - If a user authenticated with `role: 'user'` attempts to navigate to any protected `/admin/*` route, they are presented with a clean, branded **Access Denied (403)** screen with a button to switch accounts, rather than causing an infinite redirect loop.
- **Brute-Force & Rate Limiting**:
  - Preserves Express rate limiting (`500 requests / 15 minutes / IP`).

##### E. User Experience & Ergonomics
- Clear contextual feedback:
  - Account not verified: Prompts for OTP verification with pre-filled email.
  - Invalid credentials: Clear inline error banner.
  - Network / server offline: "Cannot reach server. Please check your connection or backend server."
- Loading state: Submit button shows an active spinner and is disabled during requests to eliminate double-submits.

#### 3. Resolution & Verification Summary
- **Unified Portal (`/login`)**: Single entry point deployed in `src/pages/login.tsx` for all personas. Automatic input trimming for email (`.trim().toLowerCase()`) and password (`.trim()`). Mobile keyboard attributes (`autoCapitalize="none"`, `autoCorrect="off"`, `spellCheck={false}`) configured. Enhanced HTML5 pattern (`\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*`) and `onBlur` auto-trimming to accommodate copy-pasted whitespace without blocking browser form submission. Added already-authenticated admin session forwarding to prevent redundant prompts.
- **Deprecation of `/admin/login`**: Route in `src/admin/AdminRoutes.tsx` immediately redirects to `/login?redirect=/admin/dashboard`. Replaced `src/admin/pages/Login.tsx` with lightweight redirect bridge.
- **Open Redirect & Loop Hardening**: Modular sanitizer (`src/lib/redirect.ts`) strictly enforces internal paths (`^\/[a-zA-Z0-9_\-\/?&=#.]*$`) and blocks external schemes (`https://`, `http://`, `//`, `javascript:`, `/\`). Standard users redirected to `/admin/*` safely diverted to `/my-account` case-insensitively (`/Admin`, `/ADMIN`). Prevents self-referencing redirect loops back to `/login` or `/admin/login`.
- **RBAC 403 Access Denied View**: ProtectedRoute detects non-admin authenticated users attempting to access `/admin/*` and renders a clean Access Denied banner with "Switch to Admin Account" and "Return to Customer Portal" actions, eliminating infinite redirect loops.
- **Backend Defensive Trimming**: `POST /api/auth/login` defensively falls back to `bcrypt.compare(password.trim(), user.passwordHash)` if exact match fails, solving copied-whitespace authentication failures. Zero passwords altered in DB.
- **Session Atomicity**: `setUserSession` and `ensureSessionSynced` bidirectionally synchronize `localStorage` and `sessionStorage`.
- **Verification**:
  - Frontend production build (`tsc -b && vite build`): Exit code 0 (`✓ built in 7.78s`).
  - Backend production build (`prisma generate && tsc`): Exit code 0.
  - Live Module Test Suite (`scripts/test-unified-auth-live.ts`): 41/41 assertions passed (100%).
  - Automated Unit Test Suite (`backend/scripts/test-unified-auth.ts`): 51/51 assertions passed (100%).
  - Storage Sync Test Suite (`backend/scripts/test-admin-auth.ts`): 25/25 assertions passed (100%).

---

### Issue #12: Smart Contact Actions with Gmail & Desktop Call Fallback
- **Tracking ID**: `ISS-20261006-12` (`UX-012`)
- **Category**: User Experience, Cross-Platform Compatibility, Contact Systems
- **Severity**: Medium (Impacting desktop visitors and QA testers lacking local Outlook/telephony clients)
- **Status**: ✅ Completed & Verified (100% Build & Automated Test Suite Passed)

#### 1. Problem Description & Root Cause
- **Silent Failures on Desktop**: When users clicked `mailto:` or `tel:` links on desktop PCs lacking default email clients (Outlook, Windows Mail) or telephony dialers (Skype, Teams), browsers silently ignored the click or threw an unhandled protocol prompt. Testers reported that contact buttons were "dead".
- **Mobile vs Desktop Discrepancy**: Mobile devices handle `mailto:` and `tel:` natively via system apps, while desktops require registered protocol handlers.

#### 2. Architecture & Technical Solution
- **Sanitization & URL Utilities (`src/lib/contact-actions.ts`)**:
  - `sanitizeEmail`: Cleans, lowercases, and validates email syntax with RFC regex; blocks protocol injection and XSS payloads.
  - `sanitizePhone`: Formats 10-digit Indian numbers (`+919966109191`), international prefixes, and dialer-compatible strings.
  - `getGmailComposeUrl`: Generates official web compose URL (`https://mail.google.com/mail/?view=cm&fs=1&to=...`) with safe URI-encoded parameters.
  - `getWhatsAppUrl`: Generates official WhatsApp web/app link (`https://wa.me/...`).
  - `isMobileDevice`: Detects phone dialer / touch capability.
- **Desktop Fallback Sheet (`src/components/ui/contact-action-modal.tsx`)**:
  - Automatically activates on desktop clicks.
  - Email actions: 1-click **Open in Gmail Web**, **Open Default App**, and **Copy Email**.
  - Phone actions: 1-click **Chat on WhatsApp Web**, **Call via Desktop App**, and **Copy Number**.
  - Mobile behavior: Directly triggers `mailto:` and `tel:` without modal interruption.
- **Unified Hook (`src/hooks/useContactAction.ts`)**:
  - Integrated cleanly across [topbar.tsx](file:///d:/thirdeye-campussmart/campusssmart/campusmart_final/src/components/layout/topbar.tsx), [feature-cards.tsx](file:///d:/thirdeye-campussmart/campusssmart/campusmart_final/src/components/sections/feature-cards.tsx), and [partnership-form.tsx](file:///d:/thirdeye-campussmart/campusssmart/campusmart_final/src/components/sections/partnership-form.tsx).

#### 3. Resolution & Verification Summary
- **Automated Tests (`scripts/test-contact-actions.ts`)**: 100% assertions passed for email/phone sanitization, XSS mitigation, and URL generation.
- **Frontend Build (`tsc -b && vite build`)**: Compiled successfully in 11.22s with exit code 0.
- **Backend Build (`prisma generate && tsc`)**: Compiled successfully with exit code 0.

---

### Upcoming Issues
*(Placeholders for next problems provided by the user)*

### Issue #2: [Pending Next User Request]
- **Tracking ID**: `ISS-20261006-02`
- **Category**: *To be determined*
- **Severity**: *To be determined*
- **Status**: ⏳ Awaiting Details

---

### Issue #3: [Pending Next User Request]
- **Tracking ID**: `ISS-20261006-03`
- **Category**: *To be determined*
- **Severity**: *To be determined*
- **Status**: ⏳ Awaiting Details
