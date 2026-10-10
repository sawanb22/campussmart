import axios from 'axios';
import { getAdminToken, clearAdminSession } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const cache = new Map<string, { data: any; headers: any; timestamp: number }>();
const CACHE_TTL_MS = 30000; // 30 seconds tab switch cache

export function clearAdminCache(pathPrefix?: string) {
    if (!pathPrefix) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.includes(pathPrefix)) {
            cache.delete(key);
        }
    }
}

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
});

// Add auth token and handle GET in-memory cache
api.interceptors.request.use((config) => {
    const token = getAdminToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method || 'get').toLowerCase();
    const skipCache = config.headers?.['x-skip-cache'] === 'true' || config.headers?.['x-skip-cache'] === true;

    if (method === 'get' && !skipCache) {
        const cacheKey = `${config.url || ''}:${JSON.stringify(config.params || {})}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
            config.adapter = async () => ({
                data: cached.data,
                status: 200,
                statusText: 'OK',
                headers: cached.headers,
                config,
            });
        }
    }

    return config;
});

// Handle caching & auth errors
api.interceptors.response.use(
    (res) => {
        const method = (res.config.method || 'get').toLowerCase();
        if (method === 'get' && res.status === 200) {
            const cacheKey = `${res.config.url || ''}:${JSON.stringify(res.config.params || {})}`;
            cache.set(cacheKey, {
                data: res.data,
                headers: res.headers,
                timestamp: Date.now(),
            });
        } else if (['post', 'put', 'patch', 'delete'].includes(method)) {
            cache.clear();
        }

        return res;
    },
    (err) => {
        if (err.response?.status === 401) {
            clearAdminSession();
            cache.clear();
            const currentPath = window.location.pathname + window.location.search;
            const redirectParam = currentPath.startsWith('/admin') ? `?redirect=${encodeURIComponent(currentPath)}` : '';
            window.location.href = `/login${redirectParam}`;
        }

        return Promise.reject(err);
    }
);

export default api;