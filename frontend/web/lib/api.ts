import axios from "axios";

function isLocalBrowserHost() {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

function isLocalhostUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function normalizeApiBase(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function resolveApiBase() {
  const configuredApiBase = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configuredApiBase) {
    if (!isLocalBrowserHost() && isLocalhostUrl(configuredApiBase)) return "";
    return normalizeApiBase(configuredApiBase);
  }
  return isLocalBrowserHost() ? "http://localhost:5058" : "";
}

export const API_BASE = resolveApiBase();

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (!isLocalBrowserHost() && config.baseURL && isLocalhostUrl(config.baseURL)) {
    config.baseURL = "";
  }
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
