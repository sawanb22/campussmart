/**
 * URL Redirection and Security Policy Utility.
 * Validates and sanitizes the ?redirect= URL parameter.
 * Protects against open redirect attacks, self-referencing redirect loops,
 * and enforces role-based access control (RBAC).
 */

export const getSafeRedirectUrl = (redirectParam: string | null, isAdmin: boolean): string => {
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
