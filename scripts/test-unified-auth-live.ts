/**
 * Direct Module Verification Suite for AUTH-003:
 * Imports actual TypeScript implementation modules (src/lib/redirect.ts,
 * src/lib/auth-session.ts, src/admin/lib/auth.ts) directly without any mock duplication.
 */

// ── Mock Browser Storage Environment ─────────────────────────────────────────
class MemoryStorage implements Storage {
    private store: Map<string, string> = new Map();

    get length(): number {
        return this.store.size;
    }

    clear(): void {
        this.store.clear();
    }

    getItem(key: string): string | null {
        return this.store.has(key) ? this.store.get(key)! : null;
    }

    key(index: number): string | null {
        return Array.from(this.store.keys())[index] || null;
    }

    removeItem(key: string): void {
        this.store.delete(key);
    }

    setItem(key: string, value: string): void {
        this.store.set(key, String(value));
    }
}

(globalThis as any).sessionStorage = new MemoryStorage();
(globalThis as any).localStorage = new MemoryStorage();

// ── Real Module Imports ───────────────────────────────────────────────────────
import { getSafeRedirectUrl } from '../src/lib/redirect.ts';
import {
    setUserSession,
    getUserSession,
    getUserToken,
    isUserLoggedIn,
    clearUserSession,
} from '../src/lib/auth-session.ts';
import {
    getAdminUser,
    getAdminToken,
    isAdminLoggedIn,
    getCurrentUser,
    ensureSessionSynced,
    clearAdminSession,
} from '../src/admin/lib/auth.ts';

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
        passed++;
        console.log(`  ✅ PASS: ${testName}`);
    } else {
        console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
        process.exit(1);
    }
}

async function runLiveModuleVerification() {
    console.log('\n============================================================');
    console.log('🔬 DIRECT MODULE VERIFICATION (IMPORTING LIVE SOURCE FILES)');
    console.log('============================================================\n');

    // 1. Redirect Module Verification (src/lib/redirect.ts)
    console.log('--- 1. Testing src/lib/redirect.ts directly ---');
    assert(getSafeRedirectUrl(null, true) === '/admin/dashboard', 'Default admin redirect');
    assert(getSafeRedirectUrl(null, false) === '/my-account', 'Default user redirect');
    assert(getSafeRedirectUrl('/admin/products', true) === '/admin/products', 'Safe admin route');
    assert(getSafeRedirectUrl('/shop', false) === '/shop', 'Safe user route');

    // Case-insensitive RBAC divert
    assert(getSafeRedirectUrl('/admin/dashboard', false) === '/my-account', 'Blocks /admin/dashboard for user');
    assert(getSafeRedirectUrl('/Admin/dashboard', false) === '/my-account', 'Blocks /Admin/dashboard (mixed case) for user');
    assert(getSafeRedirectUrl('/ADMIN/pages', false) === '/my-account', 'Blocks /ADMIN/pages (uppercase) for user');
    assert(getSafeRedirectUrl('/admin', false) === '/my-account', 'Blocks /admin exact for user');
    assert(getSafeRedirectUrl('/ADMIN', false) === '/my-account', 'Blocks /ADMIN exact for user');

    // Loop prevention
    assert(getSafeRedirectUrl('/login', true) === '/admin/dashboard', 'Admin /login diverted to dashboard');
    assert(getSafeRedirectUrl('/login', false) === '/my-account', 'User /login diverted to my-account');
    assert(getSafeRedirectUrl('/login?redirect=/admin/dashboard', true) === '/admin/dashboard', 'Self-referential /login?redirect diverted');
    assert(getSafeRedirectUrl('/admin/login', true) === '/admin/dashboard', 'Deprecated /admin/login diverted to dashboard');
    assert(getSafeRedirectUrl('/admin/login', false) === '/my-account', 'Deprecated /admin/login diverted to my-account');

    // Open redirect attacks
    assert(getSafeRedirectUrl('https://evil.com', true) === '/admin/dashboard', 'Rejects https://');
    assert(getSafeRedirectUrl('http://evil.com', false) === '/my-account', 'Rejects http://');
    assert(getSafeRedirectUrl('//evil.com', true) === '/admin/dashboard', 'Rejects protocol-relative //');
    assert(getSafeRedirectUrl('/\\evil.com', true) === '/admin/dashboard', 'Rejects backslash bypass');
    assert(getSafeRedirectUrl('javascript:alert(1)', true) === '/admin/dashboard', 'Rejects javascript:');

    // 2. Storage Atomicity Verification (src/lib/auth-session.ts & src/admin/lib/auth.ts)
    console.log('\n--- 2. Testing src/lib/auth-session.ts & src/admin/lib/auth.ts directly ---');
    sessionStorage.clear();
    localStorage.clear();

    const adminUser = { id: 1, name: 'Admin User', email: 'admin@campusmart.in', role: 'admin' };
    setUserSession('token_adm_123', adminUser);

    assert(localStorage.getItem('cm_token') === 'token_adm_123', 'localStorage cm_token set');
    assert(localStorage.getItem('cm_admin_token') === 'token_adm_123', 'localStorage cm_admin_token set');
    assert(sessionStorage.getItem('cm_token') === 'token_adm_123', 'sessionStorage cm_token set');
    assert(sessionStorage.getItem('cm_admin_token') === 'token_adm_123', 'sessionStorage cm_admin_token set');
    assert(isAdminLoggedIn() === true, 'isAdminLoggedIn() reports true');
    assert(getAdminToken() === 'token_adm_123', 'getAdminToken() returns token');
    assert(getCurrentUser()?.email === 'admin@campusmart.in', 'getCurrentUser() returns admin user');

    // Standard user overwrite
    const studentUser = { id: 2, name: 'Student', email: 'student@campusmart.in', role: 'user' };
    setUserSession('token_stu_456', studentUser);

    assert(localStorage.getItem('cm_token') === 'token_stu_456', 'localStorage cm_token updated to student');
    assert(localStorage.getItem('cm_admin_token') === null, 'localStorage cm_admin_token cleaned up');
    assert(sessionStorage.getItem('cm_token') === 'token_stu_456', 'sessionStorage cm_token updated to student');
    assert(sessionStorage.getItem('cm_admin_token') === null, 'sessionStorage cm_admin_token cleaned up');
    assert(isAdminLoggedIn() === false, 'isAdminLoggedIn() reports false for student');
    assert(getAdminToken() === null, 'getAdminToken() returns null for student');
    assert(getCurrentUser()?.role === 'user', 'getCurrentUser() reports user role');

    // Bidirectional sync
    sessionStorage.clear();
    localStorage.clear();
    localStorage.setItem('cm_token', 'token_sync_789');
    localStorage.setItem('cm_admin_token', 'token_sync_789');
    localStorage.setItem('cm_user', JSON.stringify(adminUser));

    ensureSessionSynced();
    assert(sessionStorage.getItem('cm_admin_token') === 'token_sync_789', 'ensureSessionSynced populated sessionStorage admin token');
    assert(sessionStorage.getItem('cm_token') === 'token_sync_789', 'ensureSessionSynced populated sessionStorage token');
    assert(sessionStorage.getItem('cm_user') !== null, 'ensureSessionSynced populated sessionStorage user');
    assert(isAdminLoggedIn() === true, 'isAdminLoggedIn() is true after ensureSessionSynced');

    // Teardown
    clearUserSession();
    assert(localStorage.getItem('cm_token') === null, 'clearUserSession wiped localStorage cm_token');
    assert(sessionStorage.getItem('cm_token') === null, 'clearUserSession wiped sessionStorage cm_token');
    assert(isUserLoggedIn() === false, 'isUserLoggedIn() is false');
    assert(isAdminLoggedIn() === false, 'isAdminLoggedIn() is false');

    console.log('\n============================================================');
    console.log(`🎉 ALL ${passed}/${total} LIVE MODULE ASSERTIONS PASSED!`);
    console.log('============================================================\n');
}

runLiveModuleVerification();
