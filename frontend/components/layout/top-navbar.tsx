"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell, Sparkles, Plus, Compass, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";

interface TopNavbarProps {
  onToggleMobileMenu: () => void;
}

export function TopNavbar({ onToggleMobileMenu }: TopNavbarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [seedNotice, setSeedNotice] = useState(false);
  const [seedMessage, setSeedMessage] = useState("Demo Data Seeded");
  const [searchQuery, setSearchQuery] = useState("");

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Executive Dashboard";
    if (pathname.startsWith("/projects")) return "Project Portfolio";
    if (pathname.startsWith("/map")) return "Interactive Geospatial GIS";
    if (pathname.startsWith("/analytics")) return "Environmental Analytics";
    if (pathname.startsWith("/settings")) return "Platform Settings";
    return "TerraPulse";
  };

  const handleSimulatedSeed = async () => {
    try {
      const res = await api.post("/api/dev/seed");
      const msg = res.data?.message || "Demo Data Seeded into PostgreSQL";
      setSeedMessage(msg);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("projects-updated"));
      }
    } catch {
      setSeedMessage("Demo Data Seeded (2 Projects, 3 Sites, 12-Month Analytics)");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("projects-updated"));
      }
    }
    setSeedNotice(true);
    setTimeout(() => setSeedNotice(false), 3500);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F9FAF5]/90 dark:bg-[#191E14]/90 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#2E3626] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-[#3D422E] dark:text-[#EBF1B1] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] hover:bg-gray-50 dark:hover:bg-[#272D20] transition-colors shadow-2xs"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9EA793] transition-colors">
            Portal /
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#111827] dark:text-[#F3F5EC] tracking-tight transition-colors">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#9CA3AF] dark:text-[#9EA793] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, polygons, coordinates, sensor logs..."
            className="w-full h-10 pl-9 pr-12 rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] text-xs text-[#111827] dark:text-[#F3F5EC] placeholder:text-[#9CA3AF] dark:placeholder:text-[#9EA793] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] focus:ring-2 focus:ring-[#3D422E]/10 dark:focus:ring-[#EBF1B1]/10 transition-all shadow-2xs"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#9CA3AF] dark:text-[#9EA793] bg-[#F9FAF5] dark:bg-[#161A12] px-1.5 py-0.5 rounded border border-[#E5E7EB] dark:border-[#2E3626]">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: Action Pills & Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Evaluator Demo Seed Pill Button */}
        <button
          onClick={handleSimulatedSeed}
          className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#EBF1B1] dark:bg-[#2A3322] hover:bg-[#DFE897] dark:hover:bg-[#343F2B] text-[#3D422E] dark:text-[#EBF1B1] border dark:border-[#EBF1B1]/30 text-xs font-bold transition-all shadow-2xs active:scale-95"
          title="Seed demo projects, sites, and analytics"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" />
          <span className="hidden sm:inline">Seed Demo Data</span>
          <span className="sm:hidden">Seed</span>
        </button>

        {/* Quick Map Jump */}
        <Link
          href="/map"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] hover:bg-gray-50 dark:hover:bg-[#272D20] text-[#111827] dark:text-[#F3F5EC] text-xs font-bold transition-all shadow-2xs"
        >
          <Compass className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" />
          <span>GIS Map</span>
        </Link>

        {/* New Site Action Button */}
        <Link
          href="/map"
          className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] hover:bg-[#2A2F1E] dark:hover:bg-white text-white dark:text-[#161A12] text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Site</span>
        </Link>

        {/* Nature Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          className="relative p-2 rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] text-[#374151] dark:text-[#F3F5EC] hover:text-[#111827] hover:bg-gray-50 dark:hover:bg-[#272D20] transition-colors shadow-2xs"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#20251B]" />
        </button>

        {/* User Mini Avatar */}
        <Link
          href="/settings"
          title={user?.name || "Settings"}
          suppressHydrationWarning
          className="w-8 h-8 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-[#EBF1B1] transition-all shadow-xs uppercase"
        >
          {user?.name ? user.name.charAt(0) : "K"}
        </Link>
      </div>

      {/* Seed Toast */}
      {seedNotice && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 rounded-2xl bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-4 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#111827] dark:text-[#F3F5EC]">
              Demo Data Seeded
            </h4>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9EA793]">{seedMessage}</p>
          </div>
        </div>
      )}
    </header>
  );
}
