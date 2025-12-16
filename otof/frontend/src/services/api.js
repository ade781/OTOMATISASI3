import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true
});

let accessToken = null;
let refreshHandler = null;
let logoutHandler = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const setRefreshHandler = (handler) => {
  refreshHandler = handler;
};

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

api.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  nextConfig.headers = nextConfig.headers || {};
  if (accessToken && !nextConfig.headers.Authorization) {
    nextConfig.headers.Authorization = `Bearer ${accessToken}`;
  }
  return nextConfig;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response } = error;
    const originalRequest = error.config || {};

    if (
      response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.headers?.['x-no-retry'] &&
      typeof refreshHandler === 'function'
    ) {
      try {
        if (!refreshPromise) {
          refreshPromise = refreshHandler();
        }
        const newToken = await refreshPromise;
        refreshPromise = null;

        if (!newToken) {
          throw new Error('Tidak mendapatkan token baru');
        }

        originalRequest._retry = true;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        if (typeof logoutHandler === 'function') {
          logoutHandler();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
