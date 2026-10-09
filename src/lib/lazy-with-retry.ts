import { type ComponentType, lazy } from 'react';

const CHUNK_RELOAD_KEY = 'cm_chunk_reload_ts';
const RELOAD_DEBOUNCE_MS = 3000; // 3-second guard to prevent infinite reload loops if offline

/**
 * Enterprise-grade lazy loader with automatic deployment recovery (SOLID: Single Responsibility & Liskov Substitution).
 * Transparently recovers from Vite stale chunk 404s when a user has a long-running tab open
 * across production deployments, without disrupting UX or showing crash screens.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error: any) {
      const message = String(error?.message || '');
      const isChunkLoadError =
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Importing a module script failed') ||
        message.includes('error loading dynamically imported module') ||
        message.includes('Loading chunk') ||
        message.includes('dynamically imported');

      if (isChunkLoadError) {
        const lastReload = parseInt(sessionStorage.getItem(CHUNK_RELOAD_KEY) || '0', 10);
        const now = Date.now();

        // Prevent infinite loops if user has no internet connection
        if (now - lastReload > RELOAD_DEBOUNCE_MS) {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
          // Perform clean hard reload to pull latest index.html and fresh chunk hashes
          window.location.reload();
          // Keep Suspense in pending fallback while browser reloads
          return new Promise(() => {});
        }
      }

      throw error;
    }
  });
}

// Drop-in alias for React.lazy
export { lazyWithRetry as lazy };
