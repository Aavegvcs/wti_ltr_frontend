// src/hooks/api.ts
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptors (optional) - can add auth token here if needed
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // normalize error
    return Promise.reject(err.response?.data || err.message || err);
  }
);

export default api;
