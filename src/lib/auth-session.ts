export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  institution?: string | null;
  emailVerified?: boolean;
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

/**
 * Returns the currently authenticated user from localStorage.
 */
export const getUserSession = (): UserSession | null => {
  return parseUser(localStorage.getItem('cm_user'));
};

/**
 * Returns the current JWT access token from localStorage.
 */
export const getUserToken = (): string | null => {
  return localStorage.getItem('cm_token');
};

/**
 * Returns true if both a token and user object are present in storage.
 */
export const isUserLoggedIn = (): boolean => {
  return Boolean(getUserToken() && getUserSession());
};

/**
 * Saves authenticated user credentials across storages adhering to role requirements.
 * Synchronizes admin credentials with sessionStorage to maintain admin portal state.
 */
export const setUserSession = (token: string, user: UserSession): void => {
  const userStr = JSON.stringify(user);
  localStorage.setItem('cm_token', token);
  localStorage.setItem('cm_user', userStr);

  if (user.role === 'admin') {
    localStorage.setItem('cm_admin_token', token);
    sessionStorage.setItem('cm_admin_token', token);
    sessionStorage.setItem('cm_token', token);
    sessionStorage.setItem('cm_user', userStr);
  }
};

/**
 * Complete, unified teardown of all authentication session keys across both
 * localStorage and sessionStorage to eradicate stale or orphaned tokens.
 */
export const clearUserSession = (): void => {
  localStorage.removeItem('cm_token');
  localStorage.removeItem('cm_user');
  localStorage.removeItem('cm_admin_token');

  sessionStorage.removeItem('cm_token');
  sessionStorage.removeItem('cm_user');
  sessionStorage.removeItem('cm_admin_token');
};
