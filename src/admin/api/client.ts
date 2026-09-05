import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.campusmart.in/api';

const api = axios.create({
    baseURL: API_BASE,
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
    const token =
        sessionStorage.getItem('cm_admin_token') ||
        sessionStorage.getItem('cm_token');

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
            sessionStorage.removeItem('cm_admin_token');
            sessionStorage.removeItem('cm_token');
            sessionStorage.removeItem('cm_user');

            localStorage.removeItem('cm_admin_token');
            localStorage.removeItem('cm_token');
            localStorage.removeItem('cm_user');

            window.location.href = '/admin/login';
        }

        return Promise.reject(err);
    }
);

export default api;