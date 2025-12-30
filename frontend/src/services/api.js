import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

let csrfTokenCache = "";
let isRefreshing = false;
let failedQueue = [];

const fetchCsrfToken = async () => {
  try {
    const { data } = await api.get("/auth/csrf");
    csrfTokenCache = data?.csrfToken || "";
    return csrfTokenCache;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    csrfTokenCache = "";
    return "";
  }
};

const getCsrfToken = async () => {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }
  return fetchCsrfToken();
};

const updateCsrfToken = (token) => {
  if (token && typeof token === 'string') {
    csrfTokenCache = token;
  }
};

const clearCsrfToken = () => {
  csrfTokenCache = "";
};

api.interceptors.request.use(
  async (config) => {
    const method = (config.method || "GET").toUpperCase();
    const isUnsafe = !["GET", "HEAD", "OPTIONS"].includes(method);

    if (isUnsafe) {
      const token = await getCsrfToken();
      config.headers = config.headers || {};
      config.headers["X-CSRF-Token"] = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    if (response.data?.csrfToken) {
      updateCsrfToken(response.data.csrfToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.code;
      
      if (errorCode === 'CSRF_MISSING' || errorCode === 'CSRF_MISMATCH') {
        try {
          await fetchCsrfToken();
          return api(originalRequest);
        } catch (csrfError) {
          return Promise.reject(error);
        }
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh", {});
        
        if (data?.csrfToken) {
          updateCsrfToken(data.csrfToken);
        }
        
        processQueue(null);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        clearCsrfToken();
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { fetchCsrfToken, clearCsrfToken, updateCsrfToken };
