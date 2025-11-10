// src/api/axiosInstance.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8181"; // adjust if backend runs elsewhere

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // set true if you use cookies / sameSite
});

// Attach token if present on each request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("skillgrid_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default axiosInstance;
