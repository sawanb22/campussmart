/**
 * Unit tests for admin auth storage synchronization logic
 */

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

// Set up global browser storage mocks
(global as any).sessionStorage = new MockStorage();
(global as any).localStorage = new MockStorage();

interface StoredUser {
    id: number;
    name: string;
    email: string;
    role: string;
    [key: string]: any;
}

function assert(cond: boolean, name: string, detail?: string) {
    if (cond) {
        console.log(`✅ PASS: ${name}`);
    } else {
        console.error(`❌ FAIL: ${name} ${detail ? `(${detail})` : ''}`);
        process.exit(1);
    }
}

const parseUser = (raw: string | null): StoredUser | null => {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const getAdminUser = (): StoredUser | null => {
    const sessionUser = parseUser(sessionStorage.getItem('cm_user'));
    if (sessionUser && sessionUser.role === 'admin') {
        return sessionUser;
    }

    const localUser = parseUser(localStorage.getItem('cm_user'));
    if (localUser && localUser.role === 'admin') {
        return localUser;
    }

    return null;
};

const getAdminToken = (): string | null => {
    const user = getAdminUser();
    if (!user || user.role !== 'admin') {
        return null;
    }

    // 1. Explicit admin token in sessionStorage or localStorage
    const explicitAdminToken =
        sessionStorage.getItem('cm_admin_token') ||
        localStorage.getItem('cm_admin_token');
    if (explicitAdminToken) {
        return explicitAdminToken;
    }

    // 2. Generic token matching where the admin user was found
    const sessionUser = parseUser(sessionStorage.getItem('cm_user'));
    if (sessionUser && sessionUser.role === 'admin' && sessionStorage.getItem('cm_token')) {
        return sessionStorage.getItem('cm_token');
    }

    const localUser = parseUser(localStorage.getItem('cm_user'));
    if (localUser && localUser.role === 'admin' && localStorage.getItem('cm_token')) {
        return localStorage.getItem('cm_token');
    }

    return null;
};

const isAdminLoggedIn = (): boolean => {
    const token = getAdminToken();
    const user = getAdminUser();
    return Boolean(token && user && user.role === 'admin');
};

const syncAdminSession = (token: string, user: StoredUser): void => {
    const userStr = JSON.stringify(user);
    sessionStorage.setItem('cm_admin_token', token);
    sessionStorage.setItem('cm_token', token);
    sessionStorage.setItem('cm_user', userStr);

    localStorage.setItem('cm_admin_token', token);
    localStorage.setItem('cm_token', token);
    localStorage.setItem('cm_user', userStr);
};

const clearAdminSession = (): void => {
    sessionStorage.removeItem('cm_admin_token');
    sessionStorage.removeItem('cm_token');
    sessionStorage.removeItem('cm_user');

    localStorage.removeItem('cm_admin_token');
    localStorage.removeItem('cm_token');
    localStorage.removeItem('cm_user');
};

const ensureSessionSynced = (): void => {
    const user = getAdminUser();
    const token = getAdminToken();
    if (token && user && user.role === 'admin') {
        if (sessionStorage.getItem('cm_admin_token') !== token) {
            sessionStorage.setItem('cm_admin_token', token);
        }
        if (sessionStorage.getItem('cm_token') !== token) {
            sessionStorage.setItem('cm_token', token);
        }
        sessionStorage.setItem('cm_user', JSON.stringify(user));
    }
};

function runAuthTests() {
    console.log('🧪 Starting Admin Auth Storage Unit Tests...\n');

    // ── Scenario 1: Clean State ──────────────────────────────────────────
    sessionStorage.clear();
    localStorage.clear();
    assert(getAdminUser() === null, 'Clean state: getAdminUser() is null');
    assert(getAdminToken() === null, 'Clean state: getAdminToken() is null');
    assert(isAdminLoggedIn() === false, 'Clean state: isAdminLoggedIn() is false');

    // ── Scenario 2: Normal User in Storage ───────────────────────────────
    const normalUser: StoredUser = { id: 10, name: 'Normal User', email: 'user@test.com', role: 'user' };
    localStorage.setItem('cm_token', 'user_jwt');
    localStorage.setItem('cm_user', JSON.stringify(normalUser));

    assert(getAdminUser() === null, 'Normal user: getAdminUser() returns null');
    assert(getAdminToken() === null, 'Normal user: getAdminToken() returns null');
    assert(isAdminLoggedIn() === false, 'Normal user: isAdminLoggedIn() is false');

    // ── Scenario 3: Admin logs in via Public Login (localStorage only) ───
    // Stale non-admin user in sessionStorage must not shadow active localStorage admin
    const staleUser: StoredUser = { id: 99, name: 'Stale User', email: 'stale@test.com', role: 'user' };
    sessionStorage.setItem('cm_token', 'stale_jwt');
    sessionStorage.setItem('cm_user', JSON.stringify(staleUser));

    const adminUser: StoredUser = { id: 1, name: 'Super Admin', email: 'admin@campusmart.in', role: 'admin' };
    localStorage.setItem('cm_token', 'admin_jwt');
    localStorage.setItem('cm_admin_token', 'admin_jwt');
    localStorage.setItem('cm_user', JSON.stringify(adminUser));

    assert(getAdminUser()?.email === 'admin@campusmart.in', 'Admin user prioritized over stale non-admin in sessionStorage');
    assert(getAdminToken() === 'admin_jwt', 'Admin token resolved correctly');
    assert(isAdminLoggedIn() === true, 'isAdminLoggedIn() is true');

    // Run session synchronization
    ensureSessionSynced();
    assert(sessionStorage.getItem('cm_admin_token') === 'admin_jwt', 'ensureSessionSynced synced cm_admin_token to sessionStorage');
    assert(sessionStorage.getItem('cm_token') === 'admin_jwt', 'ensureSessionSynced overwritten stale cm_token in sessionStorage');
    const syncedSessionUser = JSON.parse(sessionStorage.getItem('cm_user')!);
    assert(syncedSessionUser.email === 'admin@campusmart.in', 'ensureSessionSynced overwritten stale cm_user in sessionStorage');

    // ── Scenario 4: Admin Direct Login via syncAdminSession ─────────────
    sessionStorage.clear();
    localStorage.clear();
    syncAdminSession('new_admin_jwt', adminUser);

    assert(sessionStorage.getItem('cm_admin_token') === 'new_admin_jwt', 'syncAdminSession sets sessionStorage cm_admin_token');
    assert(sessionStorage.getItem('cm_token') === 'new_admin_jwt', 'syncAdminSession sets sessionStorage cm_token');
    assert(localStorage.getItem('cm_admin_token') === 'new_admin_jwt', 'syncAdminSession sets localStorage cm_admin_token');
    assert(localStorage.getItem('cm_token') === 'new_admin_jwt', 'syncAdminSession sets localStorage cm_token');
    assert(isAdminLoggedIn() === true, 'Admin is logged in after syncAdminSession');

    // ── Scenario 5: Admin Logout via clearAdminSession ──────────────────
    clearAdminSession();
    assert(sessionStorage.getItem('cm_admin_token') === null, 'clearAdminSession removes sessionStorage cm_admin_token');
    assert(sessionStorage.getItem('cm_token') === null, 'clearAdminSession removes sessionStorage cm_token');
    assert(sessionStorage.getItem('cm_user') === null, 'clearAdminSession removes sessionStorage cm_user');
    assert(localStorage.getItem('cm_admin_token') === null, 'clearAdminSession removes localStorage cm_admin_token');
    assert(localStorage.getItem('cm_token') === null, 'clearAdminSession removes localStorage cm_token');
    assert(localStorage.getItem('cm_user') === null, 'clearAdminSession removes localStorage cm_user');
    assert(isAdminLoggedIn() === false, 'isAdminLoggedIn() is false after logout');

    // ── Scenario 6: Orphaned cm_admin_token without user ────────────────
    localStorage.setItem('cm_admin_token', 'orphaned_token');
    assert(getAdminUser() === null, 'Orphaned token: getAdminUser() is null');
    assert(getAdminToken() === null, 'Orphaned token: getAdminToken() returns null (prevents sending dead token)');
    assert(isAdminLoggedIn() === false, 'Orphaned token: isAdminLoggedIn() is false');

    console.log('\nAll Admin Auth Storage Unit Tests Passed Successfully!\n');
}

runAuthTests();
