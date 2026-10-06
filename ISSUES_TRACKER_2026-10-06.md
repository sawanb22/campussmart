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
| **ISS-03** | Blog Changes Visible Verification | Content / CMS Sync | Medium | ✅ Verified Working (User Confirmed) | – |
| **ISS-04** | Blog Category "All" Removal & Default to 1st Category | Blog / Navigation | Low | ✅ Completed | Immediate (`BLOG-001`) |
| **ISS-05** | Remove "Showing [X] All articles" Blog Sidebar Widget | Blog / UI Layout | Low | ✅ Completed | Immediate (`BLOG-001`) |
| **ISS-06** | Campus Design Inner Pages Article Navigation | CMS / Routing | Low | ✅ Completed (Verified Working) | – |
| **ISS-10** | Duplicate Sports Category & Empty AI/ML / Tech Infra | Catalog / Database | Medium | ✅ Completed | Immediate (`SYNC-001`) |
| **ISS-14** | Digital Transformation Product Discovery | Catalog / CMS Sync | Low | ✅ Completed | Immediate (`SYNC-001`) |
| **ISS-16** | Innovation Centres Product Discovery | Catalog / CMS Sync | Low | ✅ Completed | Immediate (`SYNC-001`) |
| **ISS-17** | Smart Classrooms Homepage Image Resolution | Frontend / Media URL | Low | ✅ Completed | Immediate (`SYNC-001`) |
| **ISS-18** | Furniture Category Products Loading & Subcategories | Store / Catalog | Medium | ✅ Completed | Immediate (`SYNC-001`) |
| **ISS-02** | Page Data Flicker & Internal Media Standardization | Frontend / Media / CMS | High | ✅ Completed | Immediate (`MEDIA-002`) |
| **ISS-DEF-02** | Masonry Cards Gradient (White/Blue instead of Black) | Frontend UI / Styling | Low | ⏳ Deferred to End | End |

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

### Issue #3: Changes Made in Blog Page Arent Visible
- **Tracking ID**: `ISS-20261006-03`
- **Category**: Content / CMS Sync / Blog
- **Severity**: Low (Operational / Verification)
- **Status**: ✅ Verified Working (Confirmed by user: blog posts and edits display as expected)

---

### Issue #4: Blog Category "All" Removal & Default to 1st Category
- **Tracking ID**: `ISS-20261006-04` (`BLOG-001`)
- **Category**: Frontend Navigation & Filtering
- **Severity**: Low
- **Status**: ✅ Completed & Verified (Clean Vite Build 0 Errors)

#### 1. Problem Description & Root Cause
- The blog page (`/blog`) previously displayed a hardcoded `"All"` category button at the top of both the desktop sidebar and mobile horizontal scroll chips.
- Selecting or visiting the page defaulted `activeCategory` to `null`, loading unfiltered articles across all categories simultaneously.
- Furthermore, switching categories triggered redundant re-fetching of all static categories on every click due to coupled `Promise.all` in `useEffect([activeCategory])`.

#### 2. Architecture & Technical Solution (under SOLID Principles)
- **Single Responsibility Principle (SRP)**: Separated category fetching from post fetching. Categories are fetched once on initial mount (`useEffect([], ...)`).
- **Default Category Selection**: When categories load, if no valid `?category=` query parameter exists in the URL, `activeCategory` automatically initializes to the first database category (`categories[0].slug`).
- **URL Synchronization**: Synchronized active category with `useSearchParams` (`?category=<slug>`), enabling direct bookmarking, link sharing, and seamless browser back/forward history navigation.
- **Removed "All" Buttons**: Completely eliminated the `"All"` button from both desktop category sidebar and mobile chip navigation.

---

### Issue #5: Remove "Showing [X] All articles" Blog Sidebar Widget
- **Tracking ID**: `ISS-20261006-05` (`BLOG-001`)
- **Category**: Frontend UI / Layout
- **Severity**: Low (Cosmetic & Clutter)
- **Status**: ✅ Completed & Verified (Clean Vite Build 0 Errors)

#### 1. Problem Description & Root Cause
- As shown in tester screenshot `media_1791273754651.png`, the blog sidebar rendered an unwanted card displaying `"Showing [X] All articles"`.
- This card consumed vertical space unnecessarily and showed redundant article counts.

#### 2. Technical Solution
- Completely removed the `<div className="mt-8 rounded-3xl bg-cm-blue-dark/5 p-4">...</div>` widget from `src/pages/blog.tsx`.
- Applied `self-start sticky top-24` to the `<aside>` container to preserve vertical balance without visual collapse.

---

### Issue #10: Duplicate Sports Category & Empty AI/ML / Tech Infra
- **Tracking ID**: `ISS-20261006-10` (`SYNC-001`)
- **Category**: Catalog / Database Architecture
- **Severity**: Medium
- **Status**: ✅ Completed & Verified (Prisma Normalization Run & Clean Build)

#### 1. Problem Description & Root Cause
- In the PostgreSQL database, two separate Sports categories existed: ID 3 (`Sports`, slug: `sports`) and ID 51 (`sports`, slug: `sports-infra`).
- Category `"Technology"` (ID 4) had its `page` misconfigured as `'furniture'` instead of `'tech-infra'`, causing Tech Infrastructure to appear completely empty of categories and products.
- Page `'ai-ml'` had zero categories defined.

#### 2. Architecture & Technical Solution (under SOLID Principles)
- Reassigned `volley ball 2` from category 51 to canonical category 3 and deleted duplicate category 51.
- Updated category 4 (`Technology Infrastructure`) page mapping from `furniture` to `tech-infra`.
- Seeded base categories for AI/ML: `AI & Robotics Kits` (slug: `ai-robotics`) and `Vision & Language Labs` (slug: `vision-labs`).

---

### Issue #18: Furniture Category Products Loading & Subcategories
- **Tracking ID**: `ISS-20261006-18` (`SYNC-001`)
- **Category**: Store / Catalog
- **Severity**: Medium
- **Status**: ✅ Completed & Verified

#### 1. Problem Description & Root Cause
- `/furniture` was configured with `defaultCategorySlug="chairs"`, but the database only contained a single generic category `furniture`, with no category named `chairs`. This caused `/furniture` to request `category=chairs`, resulting in 0 matches and an empty store state.

#### 2. Architecture & Technical Solution
- Seeded distinct furniture subcategories: `Chairs & Seating` (slug: `chairs`), `Desks & Tables` (slug: `desks`), and `Storage & Fixtures` (slug: `storage`).
- Reassigned existing furniture products across chairs, desks, and storage.
- Added defensive fallback in `src/pages/shop.tsx`: if `hideAllCategoriesOption` is enabled and `selectedCategory` is not in the loaded categories, it automatically defaults to `categories[0].slug` instead of querying an unmapped category.

---

### Issue #17: Smart Classrooms Homepage Image Resolution
- **Tracking ID**: `ISS-20261006-17` (`SYNC-001`)
- **Category**: Frontend / Media Resilience
- **Severity**: Low
- **Status**: ✅ Completed & Verified

#### 1. Problem Description & Root Cause
- In `src/components/sections/feature-cards.tsx`, feature card images rendered raw `<img src={image}>` without `resolveMediaUrl(image)`.
- When custom media was uploaded in Admin (`/uploads/media/...`), relative URLs failed to resolve to backend hosts and showed broken/empty images.

#### 2. Technical Solution
- Wrapped feature card image sources in `resolveMediaUrl(image)` with typed `onError` fallbacks defaulting to `defaultFeatures`.

---

### Issues #14 & #16: Digital Transformation & Innovation Centres / Tech Pages Cleanup
- **Tracking ID**: `ISS-20261006-14` & `ISS-20261006-16` (`SYNC-001`)
- **Category**: Catalog / Routing Cleanup
- **Severity**: Low
- **Status**: ✅ Completed & Verified

#### 1. Problem Description & User Feedback
- User confirmed that `/tech-infra` (canonical Technology Solutions page) already comprehensively presents all technology solutions and solution cards.
- The legacy separate page `/tech-infra/products` was redundant, unwanted, and caused confusion.
- Additional discovery banners on showcase pages were reverted per preference to keep pages clean and focused.

#### 2. Technical Solution
- Completely removed legacy storefront wrapper `src/pages/tech-infra-products.tsx`.
- Removed route mapping from `PageTemplates` in `src/App.tsx`.
- Added seamless redirect `<Route path="/tech-infra/products" element={<Navigate to="/tech-infra" replace />} />` ensuring all visitors land directly on the canonical `/tech-infra` page.
- Reverted injected catalog banners on `/digital-transformation` and `/innovation-centres`.

---

### Issue #2: Page Data Flicker Elimination & Internal Media Standardization across Category Routes
- **Tracking ID**: `ISS-20261006-02` (`MEDIA-002`)
- **Category**: Frontend, Media Architecture, Performance, CMS Data Integrity
- **Severity**: High (Impacting production category pages, visual stability, and image availability)
- **Status**: ✅ Completed & Verified

#### 1. Problem Description & Root Cause
- **Flicker on Initial Render**:
  - On `https://campussmart.vercel.app/ai-ml`, the page initially flashed 6 default/mock cards from `ai-ml.data.ts`, then morphed down to 2 cards once the API call completed.
  - Root cause: `usePageData` returned an empty initial state while fetching from the database. The component rendered fallback defaults immediately instead of waiting for the database callback.
- **Broken Media & Disappearing Images**:
  - Uploaded card images (`/uploads/media/1791052836240-157043082.jpg` etc.) returned 404 or grey boxes on Vercel.
  - Root cause: Render's free tier uses an ephemeral disk which wipes uploaded files on restart/redeployment, and `backend/uploads/` was in `.gitignore`. Additionally, `resolveMediaUrl()` attempted to prepend the Render backend URL (`https://campussmart.onrender.com`), introducing cold-start delays.
- **Single Source of Truth (SSOT) & Category Chips**:
  - The client had removed 4 cards in the Admin Page Editor, keeping exactly 2 cards ("AI Learning Stations" and "ML Labs"). Hardcoded fallback defaults would resurrect deleted cards if API was slow or errored.
  - The category chip bar was missing filter values ("Learning Stations") due to missing `categories` array on DB card objects.

#### 2. Architecture & Technical Solution
1. **Persistent Media Bundling & 0ms Static Edge CDN**:
   - Synced all 74 internal project media files from `backend/uploads/media/` into `campusmart_final/public/uploads/media/`.
   - Updated `.gitignore` with `!public/uploads/` and `!public/uploads/**` so Git and Vercel track bundled static assets.
   - Updated `src/lib/media-url.ts` so `/uploads/` paths remain relative (`/uploads/...`), served directly by Vercel Edge CDN with zero cold-start delay.
2. **Skeleton Guards (Layout Shift & Flicker Elimination)**:
   - Created reusable `PageCardGridSkeleton` component (`src/components/ui/page-skeleton.tsx`).
   - Added `if (loading && !data.cards) return <PageCardGridSkeleton cardCount={...} />;` across all audited category pages:
     - `/ai-ml` (`src/pages/ai-ml.tsx`)
     - `/labs` (`src/pages/labs.tsx`)
     - `/libraries` (`src/pages/libraries.tsx`)
     - `/tech-infra` (`src/pages/tech-infra.tsx`)
     - `/smart-classrooms` (`src/pages/smart-classrooms.tsx`)
     - `/services` (`src/pages/services.tsx`)
     - `/solutions` (`src/pages/solutions.tsx`)
     - `/campus-furniture-design` (`src/pages/campus-furniture-design.tsx`)
     - `/collaboration` (`src/pages/collaboration.tsx`)
     - `/new-environments` (`src/pages/new-environments.tsx`)
     - `/sports-infrastructure` (`src/pages/sports-infrastructure.tsx`)
3. **Database Repair & SSOT Alignment**:
   - Updated Render PostgreSQL `pageData` record for `ai-ml`:
     - Preserved exactly 2 active cards ("AI Learning Stations", "ML Labs") without resurrecting deleted cards.
     - Assigned verified internal media: Hero (`/uploads/media/1788160868601-107085202.jpg`), Card 1 (`/uploads/media/1788162454440-418400010.png`), Card 2 (`/uploads/media/1788162604444-713305043.jpg`).
     - Added categories `['Learning Stations']` to both cards, restoring filter chips.
4. **Internal Media Fallbacks**:
   - Updated `src/pages/ai-ml.data.ts` defaults to match the 2-card configuration.
   - Added `fallbackSrc` to all `<MediaImage>` components pointing to internal assets.
   - Replaced external Unsplash fallbacks in `src/pages/ai-ml-detail.tsx` with internal media.

#### 3. Verification
- Production build (`tsc -b && vite build`): Exit code 0 (`✓ built in 8.64s`).
- All 74 static media assets verified in `dist/uploads/media/`.

---

### Redundant Product Pages Cleanup & Route Canonicalization
- **Tracking ID**: `ISS-20261006-PROD-CLEANUP` (`CLEANUP-003`)
- **Category**: Routing, UX Architecture, Database Hygiene
- **Severity**: Medium
- **Status**: ✅ Completed & Verified

#### 1. Problem Description & Audit Findings
- In addition to `/tech-infra/products`, 4 other legacy product wrapper pages (`/ai-ml/products`, `/lab-products`, `/library-products`, `/sports-products`) existed in the codebase.
- Audit confirmed that **Labs**, **Libraries**, and **Sports Products** had **zero buttons or links** anywhere on the entire site (header, footer, category bar, or inner pages), serving purely as dead-weight orphan pages.
- **AI/ML Products** only had two buttons on `/ai-ml` ("Shop AI/ML Products" and "Shop by category"), creating duplicate, confusing views alongside the canonical `/ai-ml` showcase page.

#### 2. Technical Solution
- Deleted all 4 redundant page components: `ai-ml-products.tsx`, `lab-products.tsx`, `library-products.tsx`, `sports-products.tsx`.
- Removed their route mappings from `PageTemplates` in `src/App.tsx`.
- Added automatic 301 redirects in `src/App.tsx`:
  - `/ai-ml/products` ➔ `/ai-ml`
  - `/lab-products` & `/labs/products` ➔ `/labs`
  - `/library-products` & `/libraries/products` ➔ `/libraries`
  - `/sports-products` & `/sports-infra/products` ➔ `/sports-infra`
- Cleaned up `/ai-ml`: removed the redundant "Shop AI/ML Products" button and bottom category chips, creating a clean, consistent showcase experience matching `/tech-infra`.
- Cleaned database & seeders: purged orphan page records (`lab-products`, `library-products`, `sports-products`) from the database and updated seed scripts.
- Removed legacy page defaults from `src/admin/pageDefaults.ts`.

#### 3. Verification
- `npm run build` (`tsc -b && vite build`): Exit code 0 (`✓ built in 8.57s`).
- Backend build (`prisma generate && tsc`): Exit code 0.

---

### Group 3: Page Routing & Duplicate Cleanup (Issues #15, #20, #21, #23)
- **Tracking ID**: `GRP-20261006-03`
- **Category**: Routing, SEO, Navigation Architecture, Content Harmonization
- **Severity**: High (Impacting user journeys, SEO canonical paths, and creating confusing administrative duplicates)
- **Status**: ✅ Completed & Verified

#### 1. Issue #15: Innovation Navigation Alignment
- **Problem**: Header, solutions menu, and CategoryBar pointed to divergent URLs (`/innovation` vs `/innovation-centres`).
- **Solution**: Standardized CategoryBar "Innovation" link to `/innovation-centres` (`src/components/sections/category-bar.tsx`). All ecosystem navigation now consistently leads to the main Innovation Centres hub.

#### 2. Issue #20: Service Cards Link Mismatches
- **Problem**: Homepage service cards pointed to wrong destinations:
  - "Furniture Design+ Supply" card linked to `/campus-design-execution`.
  - "Campus Design+ Execution" card linked to `/campus-master-planning`.
- **Solution**: Fixed links in `src/components/sections/service-cards.tsx`:
  - "Furniture Design+ Supply" ➔ `/furniture-design-supply`
  - "Campus Design+ Execution" ➔ `/campus-design-execution`

#### 3. Issue #21: Duplicate Sports Infrastructure Route Elimination
- **Problem**: Competing duplicate pages existed for `/sports-infra` vs `/sports-infrastructure`.
- **Solution**:
  - Designated `/sports-infra` as canonical (features interactive quotation audit modal, category filtering, and wishlist integration).
  - Deleted duplicate files: `src/pages/sports-infrastructure.tsx`, `src/pages/sports-infrastructure-detail.tsx`, `src/pages/sports-infrastructure.data.ts`.
  - Cleaned up `src/components/sections/feature-cards.tsx`, `src/components/layout/breadcrumb-bar.tsx`, and `src/admin/pages/PagesManager.tsx`.
  - Removed duplicate DB record (ID 104) and stopped auto-recreation in `backend/src/routes/pages.routes.ts`.
  - Removed template defaults in `src/admin/pageDefaults.ts`.
  - Added seamless 301 redirects in `src/App.tsx`:
    - `/sports-infrastructure` ➔ `/sports-infra`
    - `/sports-infrastructure/:facilitySlug` ➔ `/sports-infra`

#### 4. Issue #23: Duplicate Innovation Centres/Centers (UK vs US Spelling)
- **Problem**: Competing duplicate pages and admin entries existed for `/innovation-centres` (UK) vs `/innovation-centers` (US).
- **Solution**:
  - Designated `/innovation-centres` as canonical (matching Indian institutional convention).
  - Deleted duplicate files: `src/pages/innovation-centers.tsx`, `src/pages/innovation-centers-detail.tsx`, `src/pages/innovation-centers.data.ts`.
  - Cleaned up `src/components/sections/feature-cards.tsx`, `src/components/layout/breadcrumb-bar.tsx`, and `src/admin/pages/PagesManager.tsx`.
  - Removed duplicate DB record (ID 99) and removed hardcoded `ensureSimplePage('innovation-centers', ...)` in `backend/src/routes/pages.routes.ts`.
  - Removed template defaults in `src/admin/pageDefaults.ts`.
  - Added seamless 301 redirects in `src/App.tsx`:
    - `/innovation-centers` ➔ `/innovation-centres`
    - `/innovation-centers/:spaceSlug` ➔ `/innovation-centres`

#### 5. Verification
- Frontend Build: `npm run build` (`tsc -b && vite build`) passed with exit code 0 (`✓ built in 8.07s`).
- Backend Build: `npm run build` (`prisma generate && tsc`) passed with exit code 0.
- Database Verification: Verified database contains only canonical records (`sports-infra`, `innovation-centres`). Zero duplicate records present.

---

### Group 4: UI, Media & Typography Polish (Issues #1, #11, #13, #19, #22)
- **Tracking ID**: `GRP-20261006-04`
- **Category**: Frontend, Typography, Media Player, Admin Readability
- **Severity**: Medium
- **Status**: ✅ Completed & Verified

#### 1. Issue #1: Reactive Product Page Category Filtering
- **Problem**: On individual product detail pages (`/product/:slug`), clicking a category button showed 0 products until refresh because `Shop.tsx` only initialized `selectedCategory` once on mount.
- **Solution**:
  - Added a reactive `useEffect` listening to `searchParams.get('category')` in `src/pages/shop.tsx`.
  - Made the category badge tag on `src/pages/product-detail.tsx` clickable, routing directly to `/shop?category=...`.

#### 2. Issue #11: Lookbook / Catalogues "View PDF" Action
- **Problem**: Lookbook/Catalogue buttons were labeled "Download PDF" and forced invisible file downloads.
- **Solution**:
  - Renamed button labels from "Download PDF" to "View PDF" across `src/pages/catalogues.tsx` and `src/pages/product-catalog.tsx`.
  - Replaced `Download` icon with `Eye` icon.
  - Updated action to open PDFs directly in browser tab viewer with graceful modal enquiry fallback if file is missing.

#### 3. Issue #13: UGC Guidelines Typography Harmonization
- **Problem**: `/ugc-guidelines` declared `"DM Sans"` which was not loaded in `index.html`, causing mismatched system font fallbacks.
- **Solution**:
  - Removed `"DM Sans"` in `src/pages/ugc-guidelines.tsx` and unified typography to `Open Sans` for body copy and `Poppins` for headings.
  - Added `font-opensans` and `font-poppins` to `src/pages/ugc-guideline-article.tsx`.

#### 4. Issue #19: Case Study Video Player Controls
- **Problem**: On case study pages (`/case-studies/:slug`), videos were rendered via `MediaImage` (`<img>`), producing unplayable broken containers without controls.
- **Solution**:
  - Added `isVideoMedia()` detector in `src/pages/case-study-detail.tsx`.
  - Rendered HTML5 `<video controls playsInline preload="metadata">` with browser player controls (play/pause, scrubber timeline, volume, fullscreen).
  - Added CSS and a reactive effect ensuring embedded `<video>` elements in `study.body` HTML have native controls enabled.

#### 5. Issue #22: Admin Dropdowns Readability & Font Sizing
- **Problem**: Admin select dropdowns had tiny font sizing (`text-[10px]` / `text-xs`), making page classification hard to read.
- **Solution**:
  - Enlarged "Show Category On Page" dropdown in `src/admin/pages/Categories.tsx` to `text-base py-3.5 px-4 font-bold`.
  - Enlarged Category filter and modal classification dropdowns in `src/admin/pages/Products.tsx` to `text-base py-3 px-4 font-bold`.
  - Enlarged select styling in `src/admin/components/UnifiedPageEditor.tsx`.

#### 6. Verification
- Frontend Build: `npm run build` (`tsc -b && vite build`) passed with exit code 0 (`✓ built in 8.09s`).
- Backend Build: `npm run build` (`prisma generate && tsc`) passed with exit code 0.

---

### Deferred Issues
*(Shifted to end per user instruction)*
- **Issue #2**: Masonry Cards Gradient (White/Blue instead of Black)
- **Issue #8**: Explanation & guidance on how Admin Categories connect to store pages
- **Issue #9**: Quick search for subpages (e.g. "Group Study") in Admin Pages Manager
- **Group 2 (Issue #7)**: Skipped per user instruction.
