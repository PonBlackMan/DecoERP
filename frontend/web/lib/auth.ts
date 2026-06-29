import { api } from "./api";

export interface LoginResult {
  token: string;
  userId: string;
  fullName: string;
  role: string;
  tenantId: string;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const { data } = await api.post<LoginResult>("/api/auth/login", { email, password });
  return data;
}

export function saveAuth(result: LoginResult) {
  localStorage.setItem("token", result.token);
  localStorage.setItem("user", JSON.stringify(result));
}

export function getUser(): LoginResult | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
