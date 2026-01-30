import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

// Interceptor to add the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken"); // Using 'authToken' to match Day 19
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;