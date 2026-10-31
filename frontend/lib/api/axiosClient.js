import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// ─── Singleton axios instance ─────────────────────────────────────────────────
export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends httpOnly refresh cookie automatically
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ─── In-memory access token (never localStorage) ─────────────────────────────
let _accessToken = null;

export function setAccessToken(token) {
  _accessToken = token;
}

export function getAccessToken() {
  return _accessToken;
}

// ─── Request interceptor: inject Bearer token ─────────────────────────────────
axiosClient.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ─── Response interceptor: on 401 → try /api/auth/refresh once then retry ────
let isRefreshing = false;
let pendingQueue = [];

function processPendingQueue(err, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (err) reject(err);
    else resolve(token);
  });
  pendingQueue = [];
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry the refresh endpoint itself — avoids infinite loop
    const isRefreshEndpoint = originalRequest.url?.includes("/api/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh cookie is sent automatically via withCredentials
        const { data } = await axiosClient.post("/api/auth/refresh");
        const newToken = data.accessToken;
        setAccessToken(newToken);
        processPendingQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        processPendingQueue(refreshErr, null);
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
