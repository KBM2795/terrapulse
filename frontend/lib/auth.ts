import Cookies from "js-cookie";
import { api } from "./api";

export const TOKEN_COOKIE_NAME = "terrapulse_token";
export const USER_STORAGE_KEY = "terrapulse_user";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponseData {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Call backend POST /api/auth/login
 */
export async function loginApi(payload: LoginPayload): Promise<AuthResponseData> {
  const res = await api.post<ApiResponse<AuthResponseData>>("/api/auth/login", payload);
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || "Login failed");
  }
  return res.data.data;
}

/**
 * Call backend POST /api/auth/register
 */
export async function registerApi(payload: RegisterPayload): Promise<AuthResponseData> {
  const res = await api.post<ApiResponse<AuthResponseData>>("/api/auth/register", payload);
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || "Registration failed");
  }
  return res.data.data;
}

/**
 * Call backend GET /api/auth/me
 */
export async function getMeApi(): Promise<User> {
  const res = await api.get<ApiResponse<User>>("/api/auth/me");
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || "Failed to fetch user profile");
  }
  return res.data.data;
}

/**
 * Persist token in Cookie (for Next.js Edge Middleware) and localStorage (for fast client access)
 */
export function saveAuthSession(token: string, user: User) {
  // Store cookie with 7 days expiration, accessible across root path
  Cookies.set(TOKEN_COOKIE_NAME, token, {
    expires: 7,
    path: "/",
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_COOKIE_NAME, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

/**
 * Clear session on logout
 */
export function clearAuthSession() {
  Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });

  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_COOKIE_NAME);
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

/**
 * Retrieve stored token
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return Cookies.get(TOKEN_COOKIE_NAME) || localStorage.getItem(TOKEN_COOKIE_NAME) || null;
}

/**
 * Retrieve stored user
 */
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/**
 * Call backend PUT /api/auth/profile
 */
export async function updateProfileApi(payload: { name?: string; email?: string }): Promise<User> {
  const res = await api.put<ApiResponse<User>>("/api/auth/profile", payload);
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.message || "Failed to update profile");
  }
  return res.data.data;
}

/**
 * Call backend PUT /api/auth/password
 */
export async function changePasswordApi(payload: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  const res = await api.put<ApiResponse<null>>("/api/auth/password", payload);
  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to change password");
  }
}
