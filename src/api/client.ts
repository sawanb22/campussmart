import axios from 'axios';
import { clearUserSession } from '@/lib/auth-session';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE,
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('cm_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Every page that calls a protected endpoint already handles its own 401
// (login prompt modal, inline alert, etc.), so this interceptor only clears
// a stale/invalid token — it must never redirect, or it hijacks those flows
// (e.g. clicking "Add to wishlist" while logged out would get yanked to
// /login before the page's own login-prompt modal could show).
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            clearUserSession();
        }

        return Promise.reject(err);
    }
);

export default api;