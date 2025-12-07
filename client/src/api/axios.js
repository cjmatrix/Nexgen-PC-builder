import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
});

// --- CONCURRENCY LOCK VARIABLES ---
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

    // 1. SKIP INTERCEPTOR FOR SPECIFIC ROUTES
    // If the error comes from Login, Logout, or Refresh, simply reject it.
    // We don't want to try refreshing in these cases.
    if (
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/logout") ||
      originalRequest.url.includes("/auth/refresh") ||
      originalRequest.url.includes("/auth/profile")
    ) {
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

      try {
        // Attempt Refresh
        await api.post("/auth/refresh");

        // Success! Process the queue
        processQueue(null);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        // Failure! Log out user
        processQueue(refreshError, null);
        isRefreshing = false;

        console.log("Session expired. Logging out...");
        // Cleanup local state
        localStorage.removeItem("user");
        // Redirect to login
        // Redirect to login
        // window.location.href = '/login'; // DISABLED: Causing infinite loop on profile fetch

        return Promise.reject(refreshError);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
