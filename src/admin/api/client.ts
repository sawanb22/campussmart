import axios from 'axios';
import { getAdminToken, clearAdminSession } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE,
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
    const token = getAdminToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            clearAdminSession();
            const currentPath = window.location.pathname + window.location.search;
            const redirectParam = currentPath.startsWith('/admin') ? `?redirect=${encodeURIComponent(currentPath)}` : '';
            window.location.href = `/login${redirectParam}`;
        }

        return Promise.reject(err);
    }
);

export default api;