import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/logout") ||
      originalRequest.url.includes("/auth/refresh") ||
      originalRequest.url.includes("/auth/admin/refresh")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 404) {
      window.location.href = "/404";
      return Promise.reject(error);
    }

    if (error.response?.status === 429) {
      if (!window.location.pathname.includes("/too-many-requests")) {
         window.location.href = "/too-many-requests";
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const isAdmin = originalRequest.url?.includes("/admin");

      try {
        if (isAdmin) {
          await api.post("/auth/admin/refresh");
        } else {
          await api.post("/auth/refresh");
        }

        processQueue(null);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
