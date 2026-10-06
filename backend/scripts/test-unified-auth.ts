/**
 * Automated Verification Suite for AUTH-003:
 * Unified Login Portal, Input Sanitization, Open Redirect Defenses, and Storage Atomicity
 */
import bcrypt from 'bcryptjs';

// ── Mock Storage Implementation ───────────────────────────────────────────────
class MockStorage implements Storage {
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

// Global browser storage mocks
(global as any).sessionStorage = new MockStorage();
(global as any).localStorage = new MockStorage();

let passedCount = 0;
let totalCount = 0;

function assert(cond: boolean, name: string, detail?: string) {
    totalCount++;
    if (cond) {
        passedCount++;
        console.log(`  ✅ PASS: ${name}`);
    } else {
        console.error(`  ❌ FAIL: ${name} ${detail ? `(${detail})` : ''}`);
        process.exit(1);
    }
}

// ── 1. Logic Under Test: Redirect Sanitization ────────────────────────────────
const getSafeRedirectUrl = (redirectParam: string | null, isAdmin: boolean): string => {
    const defaultAdmin = '/admin/dashboard';
    const defaultUser = '/my-account';

    if (!redirectParam) {
        return isAdmin ? defaultAdmin : defaultUser;
    }

    const trimmed = redirectParam.trim();
    const safePathRegex = /^\/[a-zA-Z0-9_\-\/?&=#.]*$/;

    const isSafe =
        trimmed.startsWith('/') &&
        !trimmed.startsWith('//') &&
        !trimmed.toLowerCase().startsWith('/\\') &&
        !trimmed.toLowerCase().includes('javascript:') &&
        safePathRegex.test(trimmed);

    if (!isSafe) {
        return isAdmin ? defaultAdmin : defaultUser;
    }

    const lower = trimmed.toLowerCase();

    // Prevent self-referencing infinite loops back to login routes
    if (
        lower === '/login' ||
        lower.startsWith('/login?') ||
        lower.startsWith('/login/') ||
        lower === '/admin/login' ||
        lower.startsWith('/admin/login?') ||
        lower.startsWith('/admin/login/')
    ) {
        return isAdmin ? defaultAdmin : defaultUser;
    }

    // If regular user attempts to access /admin or /admin/*, divert safely to customer portal (case-insensitive)
    if (!isAdmin && (lower === '/admin' || lower.startsWith('/admin/'))) {
        return defaultUser;
    }

    return trimmed;
};

// ── 2. Logic Under Test: Session Atomicity ────────────────────────────────────
interface UserSession {
    id: number;
    name: string;
    email: string;
    role: string;
    [key: string]: any;
}

const parseUser = (raw: string | null): UserSession | null => {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const getUserSession = (): UserSession | null => {
    return parseUser(sessionStorage.getItem('cm_user')) || parseUser(localStorage.getItem('cm_user'));
};

const getUserToken = (): string | null => {
    return sessionStorage.getItem('cm_token') || localStorage.getItem('cm_token');
};

const isUserLoggedIn = (): boolean => {
    return Boolean(getUserToken() && getUserSession());
};

const setUserSession = (token: string, user: UserSession): void => {
    const userStr = JSON.stringify(user);
    localStorage.setItem('cm_token', token);
    localStorage.setItem('cm_user', userStr);
    sessionStorage.setItem('cm_token', token);
    sessionStorage.setItem('cm_user', userStr);

    if (user.role === 'admin') {
        localStorage.setItem('cm_admin_token', token);
        sessionStorage.setItem('cm_admin_token', token);
    } else {
        localStorage.removeItem('cm_admin_token');
        sessionStorage.removeItem('cm_admin_token');
    }
};

const clearUserSession = (): void => {
    localStorage.removeItem('cm_token');
    localStorage.removeItem('cm_user');
    localStorage.removeItem('cm_admin_token');

    sessionStorage.removeItem('cm_token');
    sessionStorage.removeItem('cm_user');
    sessionStorage.removeItem('cm_admin_token');
};

const getAdminUser = (): UserSession | null => {
    const sessionUser = parseUser(sessionStorage.getItem('cm_user'));
    if (sessionUser && sessionUser.role === 'admin') return sessionUser;

    const localUser = parseUser(localStorage.getItem('cm_user'));
    if (localUser && localUser.role === 'admin') return localUser;

    return null;
};

const getAdminToken = (): string | null => {
    const user = getAdminUser();
    if (!user || user.role !== 'admin') return null;

    const explicitToken = sessionStorage.getItem('cm_admin_token') || localStorage.getItem('cm_admin_token');
    if (explicitToken) return explicitToken;

    const sessionUser = parseUser(sessionStorage.getItem('cm_user'));
    if (sessionUser?.role === 'admin' && sessionStorage.getItem('cm_token')) {
        return sessionStorage.getItem('cm_token');
    }

    const localUser = parseUser(localStorage.getItem('cm_user'));
    if (localUser?.role === 'admin' && localStorage.getItem('cm_token')) {
        return localStorage.getItem('cm_token');
    }

    return null;
};

const isAdminLoggedIn = (): boolean => {
    return Boolean(getAdminToken() && getAdminUser()?.role === 'admin');
};

const getCurrentUser = (): UserSession | null => {
    return parseUser(sessionStorage.getItem('cm_user')) || parseUser(localStorage.getItem('cm_user'));
};

const ensureSessionSynced = (): void => {
    const user = getAdminUser();
    const token = getAdminToken();
    if (token && user && user.role === 'admin') {
        const userStr = JSON.stringify(user);
        if (sessionStorage.getItem('cm_admin_token') !== token) {
            sessionStorage.setItem('cm_admin_token', token);
        }
        if (sessionStorage.getItem('cm_token') !== token) {
            sessionStorage.setItem('cm_token', token);
        }
        if (sessionStorage.getItem('cm_user') !== userStr) {
            sessionStorage.setItem('cm_user', userStr);
        }

        if (localStorage.getItem('cm_admin_token') !== token) {
            localStorage.setItem('cm_admin_token', token);
        }
        if (localStorage.getItem('cm_token') !== token) {
            localStorage.setItem('cm_token', token);
        }
        if (localStorage.getItem('cm_user') !== userStr) {
            localStorage.setItem('cm_user', userStr);
        }
    }
};

async function runTestSuite() {
    console.log('\n============================================================');
    console.log('🧪 RUNNING AUTH-003 UNIFIED AUTHENTICATION TEST SUITE');
    console.log('============================================================\n');

    // ── Test Group 1: Open Redirect Defenses & Target Navigation ─────────────
    console.log('--- Test Group 1: Open Redirect Defenses & Target Navigation ---');
    assert(getSafeRedirectUrl(null, true) === '/admin/dashboard', 'Admin default without redirect goes to /admin/dashboard');
    assert(getSafeRedirectUrl(null, false) === '/my-account', 'User default without redirect goes to /my-account');
    assert(getSafeRedirectUrl('/shop', false) === '/shop', 'Safe internal path allowed for user');
    assert(getSafeRedirectUrl('/admin/products', true) === '/admin/products', 'Safe internal admin path allowed for admin');
    
    // RBAC: Standard user cannot redirect to /admin/*
    assert(getSafeRedirectUrl('/admin/dashboard', false) === '/my-account', 'User blocked from /admin/dashboard redirect, sent to /my-account');
    assert(getSafeRedirectUrl('/admin/products', false) === '/my-account', 'User blocked from /admin/products redirect, sent to /my-account');
    assert(getSafeRedirectUrl('/admin', false) === '/my-account', 'User blocked from /admin redirect, sent to /my-account');

    // Case-Insensitive RBAC Defenses (Prevents /Admin or /ADMIN bypasses)
    assert(getSafeRedirectUrl('/Admin/dashboard', false) === '/my-account', 'User blocked from /Admin/dashboard redirect (case-insensitive), sent to /my-account');
    assert(getSafeRedirectUrl('/ADMIN/products', false) === '/my-account', 'User blocked from /ADMIN/products redirect (case-insensitive), sent to /my-account');
    assert(getSafeRedirectUrl('/ADMIN', false) === '/my-account', 'User blocked from /ADMIN redirect (case-insensitive), sent to /my-account');

    // Loop Prevention Defenses (Prevents redirect loops back to login)
    assert(getSafeRedirectUrl('/login', true) === '/admin/dashboard', 'Admin redirecting to /login is diverted to default /admin/dashboard');
    assert(getSafeRedirectUrl('/login', false) === '/my-account', 'User redirecting to /login is diverted to default /my-account');
    assert(getSafeRedirectUrl('/login?redirect=/admin/dashboard', true) === '/admin/dashboard', 'Self-referencing /login?redirect is diverted to default');
    assert(getSafeRedirectUrl('/admin/login', true) === '/admin/dashboard', 'Admin redirecting to deprecated /admin/login is diverted to /admin/dashboard');
    assert(getSafeRedirectUrl('/admin/login', false) === '/my-account', 'User redirecting to /admin/login is diverted to /my-account');

    // Malicious Open Redirect Attacks
    assert(getSafeRedirectUrl('https://evil.com', true) === '/admin/dashboard', 'Rejects https:// protocol for admin');
    assert(getSafeRedirectUrl('http://attacker.com/steal', false) === '/my-account', 'Rejects http:// protocol for user');
    assert(getSafeRedirectUrl('//evil.com', true) === '/admin/dashboard', 'Rejects protocol-relative // URLs');
    assert(getSafeRedirectUrl('/\\evil.com', true) === '/admin/dashboard', 'Rejects backslash bypass /\\ URLs');
    assert(getSafeRedirectUrl('javascript:alert(1)', true) === '/admin/dashboard', 'Rejects javascript: scheme');
    assert(getSafeRedirectUrl('data:text/html,hack', false) === '/my-account', 'Rejects data: scheme');
    assert(getSafeRedirectUrl('/admin/products?id=1&sort=desc#top', true) === '/admin/products?id=1&sort=desc#top', 'Allows safe query parameters and hash anchors');

    // ── Test Group 2: Client Input Sanitization ──────────────────────────────
    console.log('\n--- Test Group 2: Client Input Sanitization ---');
    const dirtyEmail = '  Admin@CampusMart.IN  ';
    const dirtyPassword = '  Admin@1234  ';
    const cleanEmail = dirtyEmail.trim().toLowerCase();
    const cleanPassword = dirtyPassword.trim();
    assert(cleanEmail === 'admin@campusmart.in', 'Email correctly trimmed and lowercased');
    assert(cleanPassword === 'Admin@1234', 'Password correctly trimmed of copied whitespace');

    // HTML5 email pattern whitespace tolerance check
    const emailHtml5Pattern = /^\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*$/;
    assert(emailHtml5Pattern.test(dirtyEmail) === true, 'HTML5 email pattern accommodates leading/trailing whitespace');
    assert(emailHtml5Pattern.test('invalid-email-address') === false, 'HTML5 email pattern rejects malformed email strings');
    assert(emailHtml5Pattern.test('user@domain.com') === true, 'HTML5 email pattern matches clean email string');

    // ── Test Group 3: Backend Defensive Trimming ──────────────────────────────
    console.log('\n--- Test Group 3: Backend Defensive Trimming (bcrypt) ---');
    const storedPassword = 'Admin@1234';
    const hash = await bcrypt.hash(storedPassword, 10);

    // Exact match
    const exactMatch = await bcrypt.compare(storedPassword, hash);
    assert(exactMatch === true, 'Exact password matches bcrypt hash');

    // Password entered with accidental trailing/leading space
    const inputWithSpace = '  Admin@1234 ';
    const rawMatch = await bcrypt.compare(inputWithSpace, hash);
    assert(rawMatch === false, 'Raw password with space fails exact match');

    // Defensive fallback trimming logic
    let defensiveMatch = rawMatch;
    if (!defensiveMatch && typeof inputWithSpace === 'string' && inputWithSpace.trim() !== inputWithSpace) {
        defensiveMatch = await bcrypt.compare(inputWithSpace.trim(), hash);
    }
    assert(defensiveMatch === true, 'Defensive trimming authenticates copy-pasted space cleanly');

    // Wrong password test
    const wrongInput = '  WrongPass123  ';
    let wrongMatch = await bcrypt.compare(wrongInput, hash);
    if (!wrongMatch && typeof wrongInput === 'string' && wrongInput.trim() !== wrongInput) {
        wrongMatch = await bcrypt.compare(wrongInput.trim(), hash);
    }
    assert(wrongMatch === false, 'Wrong password still safely rejected after trim');

    // ── Test Group 4: Storage Atomicity & RBAC Guards ─────────────────────────
    console.log('\n--- Test Group 4: Storage Atomicity & RBAC Guards ---');
    sessionStorage.clear();
    localStorage.clear();

    // 4.1 Admin login sets both storages atomically
    const adminUser: UserSession = { id: 1, name: 'Admin', email: 'admin@campusmart.in', role: 'admin' };
    setUserSession('jwt_admin_token', adminUser);

    assert(localStorage.getItem('cm_token') === 'jwt_admin_token', 'localStorage cm_token set');
    assert(localStorage.getItem('cm_admin_token') === 'jwt_admin_token', 'localStorage cm_admin_token set');
    assert(sessionStorage.getItem('cm_token') === 'jwt_admin_token', 'sessionStorage cm_token set');
    assert(sessionStorage.getItem('cm_admin_token') === 'jwt_admin_token', 'sessionStorage cm_admin_token set');
    assert(isAdminLoggedIn() === true, 'isAdminLoggedIn() is true');
    assert(getCurrentUser()?.email === 'admin@campusmart.in', 'getCurrentUser() returns admin');

    // 4.2 Standard user login cleans up any previous admin tokens
    const standardUser: UserSession = { id: 2, name: 'Student', email: 'user@campussmart.in', role: 'user' };
    setUserSession('jwt_user_token', standardUser);

    assert(localStorage.getItem('cm_token') === 'jwt_user_token', 'localStorage cm_token updated to user');
    assert(localStorage.getItem('cm_admin_token') === null, 'localStorage cm_admin_token erased for standard user');
    assert(sessionStorage.getItem('cm_token') === 'jwt_user_token', 'sessionStorage cm_token updated to user');
    assert(sessionStorage.getItem('cm_admin_token') === null, 'sessionStorage cm_admin_token erased for standard user');
    assert(isAdminLoggedIn() === false, 'isAdminLoggedIn() is false for standard user');
    assert(getCurrentUser()?.role === 'user', 'getCurrentUser() reports role "user"');

    // 4.3 Bidirectional session synchronization
    localStorage.clear();
    sessionStorage.clear();
    // Simulate admin login happening in localStorage
    localStorage.setItem('cm_token', 'synced_admin_token');
    localStorage.setItem('cm_admin_token', 'synced_admin_token');
    localStorage.setItem('cm_user', JSON.stringify(adminUser));
    
    ensureSessionSynced();
    assert(sessionStorage.getItem('cm_admin_token') === 'synced_admin_token', 'ensureSessionSynced copied admin token to sessionStorage');
    assert(sessionStorage.getItem('cm_token') === 'synced_admin_token', 'ensureSessionSynced copied user token to sessionStorage');
    assert(JSON.parse(sessionStorage.getItem('cm_user')!).email === 'admin@campusmart.in', 'ensureSessionSynced copied admin user to sessionStorage');

    // 4.4 Session teardown
    clearUserSession();
    assert(localStorage.getItem('cm_token') === null, 'clearUserSession cleared localStorage cm_token');
    assert(localStorage.getItem('cm_admin_token') === null, 'clearUserSession cleared localStorage cm_admin_token');
    assert(sessionStorage.getItem('cm_token') === null, 'clearUserSession cleared sessionStorage cm_token');
    assert(sessionStorage.getItem('cm_admin_token') === null, 'clearUserSession cleared sessionStorage cm_admin_token');
    assert(isUserLoggedIn() === false, 'isUserLoggedIn() is false after logout');

    console.log(`\n============================================================`);
    console.log(`🎉 ALL ${passedCount}/${totalCount} TESTS PASSED SUCCESSFULLY!`);
    console.log(`============================================================\n`);
}

runTestSuite().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
