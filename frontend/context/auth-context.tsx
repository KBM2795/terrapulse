"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  LoginPayload,
  RegisterPayload,
  loginApi,
  registerApi,
  getMeApi,
  saveAuthSession,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(false);

  // Background token verification
  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) return;

    getMeApi()
      .then((freshUser) => {
        setUser(freshUser);
        saveAuthSession(storedToken, freshUser);
      })
      .catch(() => {
        // If token is expired / invalid on backend, clear session
        clearAuthSession();
        setUser(null);
        setToken(null);
      });
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const data = await loginApi(payload);
      setToken(data.access_token);
      setUser(data.user);
      saveAuthSession(data.access_token, data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const data = await registerApi(payload);
      setToken(data.access_token);
      setUser(data.user);
      saveAuthSession(data.access_token, data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setUser(null);
    setToken(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await getMeApi();
      setUser(freshUser);
      if (token) {
        saveAuthSession(token, freshUser);
      }
    } catch {
      // Ignored if unauthenticated
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
