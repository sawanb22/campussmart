# Current Changes Ledger (new.md): 2026-10-09

## Summary of Completed Groups

---

### Group 4: Forms & Verification Hardening (`FORMS-002`)
- **Status:** Completed & Verified
- **Original Feedback Addressed:**
  - *"Contact form: on request quote and contact us verification is not there add it and email otp also and if login then not ask for verification"*
  - *"Contact us page: whatsapp is not working connect it with site content and phone card directly allow to whatsapp and call"*
- **Files Modified:**
  - `backend/src/routes/contact.routes.ts`: Added `POST /api/contact/send-quote-otp` with `otpLimiter`; updated `POST /api/contact/quote` with OTP verification guard, skipping for logged-in verified users.
  - `backend/src/lib/email.ts`: Created dedicated `'quote'` OTP email template with institutional branding.
  - `src/pages/request-quote.tsx`: Integrated OTP modal state machine, 60s resend timer, and pre-verification exemption.
  - `src/pages/contact-us.tsx`: Dynamically linked WhatsApp to `content.contact_whatsapp` / `content.contact_phone`; upgraded phone card with Direct Call & WhatsApp buttons.
  - `src/admin/pages/SiteContent.tsx`: Added `contact_whatsapp` to admin content labels.
- **Verification:**
  - Clean TypeScript compilation, `npm run build` passed (25.86s).

---

### Group 3: Shop, Products & Wishlist Workflow (`SHOP-003`)
- **Status:** Completed & Verified
- **Original Feedback Addressed:**
  - *"what is this product checkbox for remove it"*
  - *"Login prompt description: login to add products to your cart and continue shopping but we do not have any cart on this project this is wrong directly"*
  - *"wishlist button do something i guess but i am not getting the user info like this so only allow it who loged in so we have detils and they can send us enquiry about this if you make it with all the products with one click quotation request and also if i want to check the user then check it with other info"*
  - *"SHOP AND FURNTIRE ARE SAME / CPY HERE"*
  - URL casing discrepancy (`/Shop` vs `/shop`)
- **Files Modified:**
  - `src/pages/shop.tsx`: Removed `selectedProducts` state, `toggleProductSelection`, `addSelectedToWishlist`, the floating selection banner, and the "Select" checkbox on product cards. Retained clean, accessible "Add to Wishlist" and "✓ Wishlist" buttons adhering to SOLID SRP.
  - `src/components/login-prompt-modal.tsx`: Replaced e-commerce "cart" and "continue shopping" terminology with institutional quotation wishlist messaging.
  - `src/App.tsx`: Added canonical redirects for `/Shop` and `/Furniture` to normalize URL casing.
  - `src/components/layout/header.tsx`: Made `isActive` route matching case-insensitive.
  - `src/components/layout/breadcrumb-bar.tsx`: Normalized `/shop` title to `'Shop'` and made `basePath` lookup case-insensitive.
  - `src/pages/furniture.tsx`: Added institutional trust badges (BIFMA/ISO, custom dimensions, ergonomic posture, turnkey installation) under the hero to distinctly present it as an educational furniture solutions showcase.
- **Verification:**
  - `npm run build` passed cleanly with 0 errors (`✓ built in 27.63s`).
