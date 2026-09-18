"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/page-container";
import {
  ShieldCheck,
  User as UserIcon,
  Database,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Save,
  Key,
  Lock,
  Server,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { updateProfileApi, changePasswordApi } from "@/lib/auth";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();

  // Profile fields: local overrides or user context default
  const [localName, setLocalName] = useState<string | null>(null);
  const [localEmail, setLocalEmail] = useState<string | null>(null);
  const effectiveName = localName ?? (user?.name || "");
  const effectiveEmail = localEmail ?? (user?.email || "");

  const [orgName, setOrgName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("terrapulse_org_name") || "TerraPulse Ecological Fund";
    }
    return "TerraPulse Ecological Fund";
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Mapbox Token
  const [mapboxToken, setMapboxToken] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("terrapulse_mapbox_token") ||
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
        ""
      );
    }
    return "";
  });

  // Frameworks
  const [verraEnabled, setVerraEnabled] = useState(true);
  const [goldStandardEnabled, setGoldStandardEnabled] = useState(true);
  const [planVivoEnabled, setPlanVivoEnabled] = useState(false);

  // Dev actions & Backend Health
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [backendHealth, setBackendHealth] = useState<{ status: string; db: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Check backend health
  useEffect(() => {
    api
      .get("/api/health")
      .then((res) => {
        setBackendHealth({
          status: res.data?.status || "healthy",
          db: res.data?.database || "connected",
        });
      })
      .catch(() => {
        setBackendHealth({ status: "offline", db: "disconnected" });
      });
  }, []);

  // Save Profile to Backend PUT /api/auth/profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveName.trim() || !effectiveEmail.trim()) {
      setErrorMessage("Name and email cannot be empty.");
      return;
    }

    setIsUpdatingProfile(true);
    setErrorMessage(null);

    try {
      await updateProfileApi({
        name: effectiveName.trim(),
        email: effectiveEmail.trim(),
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("terrapulse_org_name", orgName.trim());
      }

      await refreshUser();
      setLocalName(null);
      setLocalEmail(null);
      showToast("Profile credentials updated successfully in PostgreSQL backend!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      setErrorMessage(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Change Password to Backend PUT /api/auth/password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setErrorMessage("Please enter both current and new passwords.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    setErrorMessage(null);

    try {
      await changePasswordApi({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Account password changed successfully in backend!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      setErrorMessage(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Save Mapbox Token
  const handleSaveMapboxToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("terrapulse_mapbox_token", mapboxToken.trim());
      showToast("Mapbox access token updated in local configuration!");
    }
  };

  // Seed Demo Data
  const handleSeedData = async () => {
    setIsActionLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.post("/api/dev/seed");
      const d = res.data?.data;
      const countStr = d
        ? `${d.projects_created} Projects, ${d.sites_created} Sites, ${d.analytics_records_created} Records`
        : "Projects, Sites & Analytics";
      showToast(`Demo Data Seeded into PostgreSQL: ${countStr}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      showToast(`Seed failed: ${msg}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Reset Data
  const handleResetData = async () => {
    if (!confirm("Reset all project and site telemetry data for this account in PostgreSQL?")) {
      return;
    }
    setIsActionLoading(true);
    setErrorMessage(null);
    try {
      await api.delete("/api/dev/reset");
      showToast("All project & telemetry data reset in PostgreSQL. User account preserved.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      showToast(`Reset failed: ${msg}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <PageContainer>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#3D422E] dark:bg-[#20251B] dark:border dark:border-[#2E3626] text-white dark:text-[#F3F5EC] p-3.5 shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#EBF1B1] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
          Platform Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F5EC] tracking-tight">
          System Settings & Dev Tools
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793] mt-0.5">
          Manage user profile credentials, password authentication, compliance standards, and
          reviewer database seeds.
        </p>
      </div>

      {/* Error alert if any operation failed */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-400 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Organization Profile & Password */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Organization & User Profile Card (Connected to PUT /api/auth/profile) */}
          <div className="rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm space-y-5 transition-colors">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5E7EB] dark:border-[#2E3626]">
              <div className="w-9 h-9 rounded-full bg-[#EBF1B1] dark:bg-[#2A3322] flex items-center justify-center text-[#3D422E] dark:text-[#EBF1B1]">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F5EC]">
                  User & Organization Profile
                </h3>
                <span className="text-xs text-[#6B7280] dark:text-[#9EA793]">
                  Connected to backend{" "}
                  <code className="font-mono text-[10px]">PUT /api/auth/profile</code>
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#374151] dark:text-[#F3F5EC]">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#374151] dark:text-[#F3F5EC]">
                    Lead Evaluator Name
                  </label>
                  <input
                    type="text"
                    value={effectiveName}
                    onChange={(e) => setLocalName(e.target.value)}
                    required
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#374151] dark:text-[#F3F5EC]">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={effectiveEmail}
                    onChange={(e) => setLocalEmail(e.target.value)}
                    required
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] text-xs font-bold hover:bg-[#2A2F1E] dark:hover:bg-white shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdatingProfile ? "Saving to Backend..." : "Save Profile Changes"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. Security & Password Update Card (Connected to PUT /api/auth/password) */}
          <div className="rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm space-y-5 transition-colors">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5E7EB] dark:border-[#2E3626]">
              <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F5EC]">
                  Security & Password
                </h3>
                <span className="text-xs text-[#6B7280] dark:text-[#9EA793]">
                  Connected to backend{" "}
                  <code className="font-mono text-[10px]">PUT /api/auth/password</code>
                </span>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#374151] dark:text-[#F3F5EC]">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#374151] dark:text-[#F3F5EC]">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#374151] dark:text-[#F3F5EC]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-10 px-3.5 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isUpdatingPassword ? "Updating Password..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 3. Environmental Compliance Standards */}
          <div className="rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5E7EB] dark:border-[#2E3626]">
              <div className="w-9 h-9 rounded-full bg-[#EBF1B1] dark:bg-[#2A3322] flex items-center justify-center text-[#3D422E] dark:text-[#EBF1B1]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F5EC]">
                  Verification Protocols
                </h3>
                <span className="text-xs text-[#6B7280] dark:text-[#9EA793]">
                  Registry validation standards
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] cursor-pointer transition-colors">
                <div>
                  <span className="text-xs font-bold text-[#111827] dark:text-[#F3F5EC] block">
                    Verra VCS Carbon Methodology
                  </span>
                  <span className="text-[11px] text-[#6B7280] dark:text-[#9EA793]">
                    Verified Carbon Standard (VM0007 / VM0015 REDD+)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={verraEnabled}
                  onChange={(e) => setVerraEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#3D422E] dark:accent-[#EBF1B1]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] cursor-pointer transition-colors">
                <div>
                  <span className="text-xs font-bold text-[#111827] dark:text-[#F3F5EC] block">
                    Gold Standard for Global Goals
                  </span>
                  <span className="text-[11px] text-[#6B7280] dark:text-[#9EA793]">
                    Biodiversity benefit and soil carbon accounting
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={goldStandardEnabled}
                  onChange={(e) => setGoldStandardEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#3D422E] dark:accent-[#EBF1B1]"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] cursor-pointer transition-colors">
                <div>
                  <span className="text-xs font-bold text-[#111827] dark:text-[#F3F5EC] block">
                    Plan Vivo Standard
                  </span>
                  <span className="text-[11px] text-[#6B7280] dark:text-[#9EA793]">
                    Community forestry and indigenous agroforestry stewardship
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={planVivoEnabled}
                  onChange={(e) => setPlanVivoEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#3D422E] dark:accent-[#EBF1B1]"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Backend Status, Mapbox Config & Dev Tools */}
        <div className="lg:col-span-5 space-y-6">
          {/* Backend Status Card */}
          <div className="rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" />
                Backend Architecture
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{backendHealth?.status === "healthy" ? "Healthy" : "Active"}</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] space-y-2.5 text-xs transition-colors">
              <div className="flex justify-between">
                <span className="text-[#6B7280] dark:text-[#9EA793]">API Base URL</span>
                <span className="font-mono font-bold text-[#111827] dark:text-[#F3F5EC]">
                  http://localhost:8000
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] dark:text-[#9EA793]">Database Engine</span>
                <span className="font-bold text-[#111827] dark:text-[#F3F5EC]">
                  PostgreSQL + PostGIS ({backendHealth?.db || "connected"})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] dark:text-[#9EA793]">Auth Mode</span>
                <span className="font-bold text-[#3D422E] dark:text-[#EBF1B1]">
                  Bearer JWT (Owner-Scoped)
                </span>
              </div>
            </div>
          </div>

          {/* Mapbox Token Configuration */}
          <div className="rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F5EC]">
                  Mapbox Access Token
                </h3>
                <span className="text-[11px] text-[#6B7280] dark:text-[#9EA793]">
                  Vector maps & high-res satellite tiles
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveMapboxToken} className="space-y-3 text-xs">
              <input
                type="text"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                placeholder="pk.eyJ1Ijo..."
                className="w-full h-10 px-3.5 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] font-mono text-xs text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1]"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] hover:bg-[#EBF1B1] dark:hover:bg-[#EBF1B1] text-[#3D422E] dark:text-[#EBF1B1] dark:hover:text-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] font-bold transition cursor-pointer"
              >
                Save Mapbox Token
              </button>
            </form>
          </div>

          {/* Dev Seed & Reset Panel */}
          <div className="rounded-[28px] bg-[#3D422E] dark:bg-[#1E2419] dark:border dark:border-[#2E3626] text-white p-6 sm:p-8 shadow-md space-y-5 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#EBF1B1] dark:bg-[#2A3322] flex items-center justify-center text-[#3D422E] dark:text-[#EBF1B1]">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reviewer Dev Tools</h3>
                <span className="text-xs text-white/70 dark:text-[#9EA793]">
                  Instant demo dataset controls
                </span>
              </div>
            </div>

            <p className="text-xs text-white/80 dark:text-[#F3F5EC]/80 leading-relaxed">
              Quickly populate or reset the platform with the full hackathon evaluation dataset (2
              Projects, 3 Sites, 12-Month Analytics & Activity Logs).
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleSeedData}
                className="w-full py-2.5 rounded-full bg-[#EBF1B1] hover:bg-white text-[#3D422E] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isActionLoading ? "Executing..." : "Seed Demo Data (/api/dev/seed)"}</span>
              </button>

              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleResetData}
                className="w-full py-2.5 rounded-full border border-white/20 hover:border-white/40 text-white/80 hover:text-white hover:bg-white/10 text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset User Data (/api/dev/reset)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
