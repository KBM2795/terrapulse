import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor to attach JWT from cookies or localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("terrapulse_token") ||
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("terrapulse_token="))
          ?.split("=")[1];

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      "An unexpected server error occurred";

    return Promise.reject(new Error(message));
  }
);
