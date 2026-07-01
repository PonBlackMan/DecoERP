import axios from "axios";

const configuredApiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
const browserHost = typeof window !== "undefined" ? window.location.hostname : "";
const isBrowserLocalhost = browserHost === "localhost" || browserHost === "127.0.0.1";
const pointsToLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredApiBase ?? "");
const shouldIgnoreConfiguredLocalhost = !!configuredApiBase && !isBrowserLocalhost && pointsToLocalhost;

const API_BASE = shouldIgnoreConfiguredLocalhost
  ? ""
  : configuredApiBase || (isBrowserLocalhost ? "http://localhost:5058" : "");

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
