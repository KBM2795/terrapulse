"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState(false);

  // Reviewer 1-click quick-fill
  const fillDemoCredentials = () => {
    setEmail("koshik@test.com");
    setPassword("Password123");
    setError(null);
    setDemoNotice(true);
    setTimeout(() => setDemoNotice(false), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email: email.trim(), password });
      const returnUrl = searchParams.get("from") || "/dashboard";
      router.push(returnUrl);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAF5] dark:bg-[#161A12] flex items-center justify-center p-4 sm:p-6 lg:p-10 selection:bg-[#EBF1B1] selection:text-[#3D422E] transition-colors">
      <div className="w-full max-w-5xl rounded-[32px] sm:rounded-[36px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] transition-colors">
        {/* Left Form Column */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Logo & Header */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-full bg-[#3D422E]/5 dark:bg-[#EBF1B1]/10 border border-[#3D422E]/10 dark:border-[#EBF1B1]/20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                  <Image
                    src="/logo.png"
                    alt="TerraPulse Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="font-extrabold text-xl tracking-tight text-[#3D422E] dark:text-[#EBF1B1] transition-colors">
                  TerraPulse
                </span>
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EBF1B1] dark:bg-[#2A3322] text-[#3D422E] dark:text-[#EBF1B1] border dark:border-[#EBF1B1]/20">
                  Live API
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] dark:text-[#F3F5EC] transition-colors">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793] transition-colors">
                Enter your credentials to access the geospatial intelligence portal.
              </p>
            </div>

            {/* Quick Demo Autofill Pill */}
            <div className="mb-6 p-3 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] flex items-center justify-between transition-colors">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3D422E] dark:text-[#EBF1B1]" />
                <span className="text-xs font-semibold text-[#111827] dark:text-[#F3F5EC]">
                  Evaluator Fast-Track
                </span>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="px-3 py-1 rounded-full bg-[#EBF1B1] hover:bg-[#DFE897] text-[#3D422E] text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                Auto-fill Demo User
              </button>
            </div>

            {demoNotice && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Demo credentials loaded: koshik@test.com</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151] dark:text-[#F3F5EC]">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3AF] dark:text-[#9EA793] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] placeholder:text-[#9CA3AF] dark:placeholder:text-[#9EA793] focus:bg-white dark:focus:bg-[#161A12] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] focus:ring-2 focus:ring-[#3D422E]/10 dark:focus:ring-[#EBF1B1]/10 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#374151] dark:text-[#F3F5EC]">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-semibold text-[#3D422E] dark:text-[#EBF1B1] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] dark:text-[#9EA793] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] placeholder:text-[#9CA3AF] dark:placeholder:text-[#9EA793] focus:bg-white dark:focus:bg-[#161A12] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] focus:ring-2 focus:ring-[#3D422E]/10 dark:focus:ring-[#EBF1B1]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-[#9EA793] hover:text-[#374151] dark:hover:text-[#F3F5EC]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D1D5DB] dark:border-[#2E3626] text-[#3D422E] focus:ring-[#3D422E] w-4 h-4 accent-[#3D422E] dark:accent-[#EBF1B1]"
                />
                <label
                  htmlFor="remember"
                  className="text-xs text-[#6B7280] dark:text-[#9EA793] select-none cursor-pointer"
                >
                  Remember this workstation for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-3 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] hover:bg-[#2A2F1E] dark:hover:bg-white text-white dark:text-[#161A12] font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(61,66,46,0.25)] transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-white dark:border-[#161A12] border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Sign In to Platform</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer link to Register */}
          <div className="pt-8 text-center text-xs text-[#6B7280] dark:text-[#9EA793]">
            Don’t have an organization account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#3D422E] dark:text-[#EBF1B1] underline hover:text-black dark:hover:text-white"
            >
              Register here
            </Link>
          </div>
        </div>

        {/* Right Visual Column (Apple / Green Roots Style) */}
        <div className="hidden lg:block lg:col-span-6 relative p-8 bg-[#3D422E] overflow-hidden">
          {/* Background Image with overlay */}
          <Image
            src="/images/aerial-crop-grid.jpg"
            alt="TerraPulse Satellite Grid"
            fill
            className="object-cover opacity-35 mix-blend-overlay"
          />

          <div className="relative h-full flex flex-col justify-between z-10 text-white">
            {/* Top pill badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#EBF1B1] text-xs font-semibold border border-white/10">
                <Shield className="w-3.5 h-3.5" />
                <span>PostGIS Geospatial Engine</span>
              </span>
              <span className="text-xs text-white/60 font-mono">v1.0.0 Stable</span>
            </div>

            {/* Center Floating Analytics Card */}
            <div className="my-auto space-y-4">
              <div className="rounded-[28px] bg-white/10 backdrop-blur-md border border-white/15 p-6 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#EBF1B1]">
                    Environmental Health
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">84.6</span>
                  <span className="text-xs text-white/70">/ 100 Optimal</span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  Real-time telemetry fusing 60% carbon sequestration and 40% biodiversity canopy
                  density across monitored sites.
                </p>
              </div>

              {/* Quote pill */}
              <div className="rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10 p-4">
                <p className="text-xs text-white/85 italic leading-relaxed">
                  “The most intuitive climate-tech analytics interface we’ve experienced.
                  Transparent, verifiable, and fast.”
                </p>
                <span className="text-[11px] text-[#EBF1B1] font-semibold block mt-1">
                  — Global Restoration Alliance
                </span>
              </div>
            </div>

            {/* Bottom info */}
            <div className="flex items-center justify-between text-[11px] text-white/60 pt-4 border-t border-white/10">
              <span>Sentinel-2 Multispectral</span>
              <span>Encrypted JWT Sessions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F9FAF5] dark:bg-[#161A12]" />}>
      <LoginForm />
    </Suspense>
  );
}
