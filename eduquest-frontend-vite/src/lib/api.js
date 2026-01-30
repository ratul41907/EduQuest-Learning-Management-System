// Path: src/lib/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// --- Previous Logic (Day 20/23) ---
export function getToken() {
  // Keeping 'authToken' key as per your implementation
  return localStorage.getItem("authToken");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor ensures EVERY request automatically gets the latest token from storage
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- New Logic (Day 25) ---
/**
 * Helper to manually update the token in both storage and current axios instance
 * useful immediately after a successful Login or Logout.
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("authToken", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("authToken");
    delete api.defaults.headers.common["Authorization"];
  }
}

export default api;