import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('munch_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stored token
      localStorage.removeItem('munch_token');
      // Dispatch a custom event so AuthContext can react
      window.dispatchEvent(new CustomEvent('munch:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
