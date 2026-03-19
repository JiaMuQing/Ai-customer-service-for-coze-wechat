import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Prefer store token (avoids race right after login) then localStorage
  try {
    const t = useAuthStore().token ?? localStorage.getItem('token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
  } catch {
    const t = localStorage.getItem('token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      try {
        useAuthStore().logout();
      } catch {
        localStorage.removeItem('token');
      }
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
