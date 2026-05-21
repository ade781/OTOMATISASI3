import axios from "axios";

const resolveApiBaseUrl = () => {
  const fromEnv = (import.meta.env.VITE_API_URL || "").trim();
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    const { protocol, hostname, port, origin } = window.location;
    // Vite dev default: FE 5173, BE 5000
    if (port === "5173") {
      return `${protocol}//${hostname}:5000`;
    }
    // Production default: same-origin via reverse proxy
    return origin;
  }

  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});

let csrfTokenCache = "";
let isRefreshing = false;
let failedQueue = [];

const getRequestPath = (url = "") => {
  try {
    return new URL(url, api.defaults.baseURL).pathname;
  } catch {
    return String(url);
  }
};

const isAuthEndpoint = (url = "") => {
  const path = getRequestPath(url);
  return path.startsWith("/auth/");
};

const notifyUnauthorized = () => {
  clearCsrfToken();
  localStorage.removeItem("user");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:unauthorized"));
  }
};

const fetchCsrfToken = async () => {
  try {
    const { data } = await api.get("/auth/csrf");
    csrfTokenCache = data?.csrfToken || "";
    return csrfTokenCache;
  } catch (error) {
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
  if (token && typeof token === "string") {
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
    // Pengecualian untuk endpoint login - tidak perlu CSRF token
    const isLoginEndpoint = config.url?.includes("/auth/login");
    if (isUnsafe && !isLoginEndpoint) {
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
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestIsAuthEndpoint = isAuthEndpoint(originalRequest.url);

    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.code;

      if (
        !requestIsAuthEndpoint &&
        (errorCode === "CSRF_MISSING" || errorCode === "CSRF_MISMATCH")
      ) {
        try {
          await fetchCsrfToken();
          return api(originalRequest);
        } catch (csrfError) {
          return Promise.reject(error);
        }
      }
    }

    if (
      error.response?.status === 401 &&
      !requestIsAuthEndpoint &&
      !originalRequest._retry
    ) {
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
        notifyUnauthorized();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401 && !requestIsAuthEndpoint) {
      notifyUnauthorized();
    }

    return Promise.reject(error);
  }
);

export default api;
export { fetchCsrfToken, clearCsrfToken, updateCsrfToken, notifyUnauthorized };
