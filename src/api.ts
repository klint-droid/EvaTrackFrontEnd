import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

  if (match) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(match[1]);
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      // 401: Unauthorized / Session Expired
      if (status === 401) {
        const hadToken = !!localStorage.getItem("token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Avoid infinite redirect loop if already on login or landing
        const currentPath = window.location.pathname;
        if (hadToken && currentPath !== "/login" && currentPath !== "/") {
          window.location.href = "/login?session_expired=1";
        }
      }

      // 403: Forbidden - Log for security auditing
      if (status === 403) {
        console.warn("Access Denied (403):", error.config?.url);
      }

      // 500: Internal Server Error
      if (status >= 500) {
        console.error("Internal Server Error (500):", error.config?.url, error.response.data);
      }
    } else if (error.request) {
      // Network error or server completely down
      console.error("Network or Connectivity Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;