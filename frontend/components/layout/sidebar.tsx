"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Map,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import { ProjectData } from "@/lib/projects";

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [activeProjectsCount, setActiveProjectsCount] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!user) return;

    api
      .get<{ success: boolean; data: ProjectData[] }>("/api/projects")
      .then((res) => {
        if (!ignore && res.data?.data && Array.isArray(res.data.data)) {
          const count = res.data.data.filter(
            (p) => (p.status || "").toLowerCase() === "active"
          ).length;
          setActiveProjectsCount(count);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("terrapulse_active_projects", String(count));
          }
        }
      })
      .catch(() => {
        // Retain existing count on transient network issue
      });

    return () => {
      ignore = true;
    };
  }, [user, pathname]);

  useEffect(() => {
    const handleProjectsUpdated = () => {
      if (!user) return;
      api
        .get<{ success: boolean; data: ProjectData[] }>("/api/projects")
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            const count = res.data.data.filter(
              (p) => (p.status || "").toLowerCase() === "active"
            ).length;
            setActiveProjectsCount(count);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("terrapulse_active_projects", String(count));
            }
          }
        })
        .catch(() => {});
    };

    window.addEventListener("projects-updated", handleProjectsUpdated);
    return () => {
      window.removeEventListener("projects-updated", handleProjectsUpdated);
    };
  }, [user]);

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Projects",
      href: "/projects",
      icon: FolderKanban,
      badge: activeProjectsCount !== null ? `${activeProjectsCount} Active` : null,
    },
    {
      label: "Geospatial Map",
      href: "/map",
      icon: Map,
      badge: "PostGIS",
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 sm:w-72 bg-[#F9FAF5] dark:bg-[#191E14] border-r border-[#E5E7EB] dark:border-[#2E3626] p-5 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="TerraPulse"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-[#3D422E] dark:text-[#EBF1B1] block leading-tight transition-colors">
                  TerraPulse
                </span>
                <span className="text-[10px] font-bold tracking-wider text-[#6B7280] dark:text-[#9EA793] uppercase block transition-colors">
                  Intelligence Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 pt-2">
            <div className="px-3 pb-2 text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] shadow-sm"
                      : "text-[#4B5563] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC] hover:bg-white dark:hover:bg-[#20251B]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? "text-[#EBF1B1] dark:text-[#161A12]"
                          : "text-[#6B7280] dark:text-[#9EA793]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      suppressHydrationWarning
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#EBF1B1] dark:bg-[#161A12] text-[#3D422E] dark:text-[#EBF1B1]"
                          : "bg-white dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-[#6B7280] dark:text-[#9EA793]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4 pt-4 border-t border-[#E5E7EB] dark:border-[#2E3626]">
          {/* Telemetry Status Widget */}
          <div className="rounded-2xl bg-white dark:bg-[#20251B] p-3.5 border border-[#E5E7EB] dark:border-[#2E3626] shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#3D422E] dark:text-[#EBF1B1] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Telemetry System
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9EA793] leading-relaxed">
              FastAPI REST + PostGIS Vector Storage Active
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#3D422E] dark:text-[#EBF1B1]">
              <span>Health: 77.6 EHI</span>
              <span className="text-emerald-700 dark:text-emerald-400">Healthy</span>
            </div>
          </div>

          {/* User Profile / Logout */}
          <div className="rounded-2xl bg-white dark:bg-[#20251B] p-3 border border-[#E5E7EB] dark:border-[#2E3626] shadow-xs flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                suppressHydrationWarning
                className="w-8 h-8 rounded-full bg-[#EBF1B1] text-[#3D422E] font-extrabold text-xs flex items-center justify-center shrink-0 uppercase"
              >
                {user?.name ? user.name.charAt(0) : "K"}
              </div>
              <div className="overflow-hidden">
                <span
                  suppressHydrationWarning
                  className="font-bold text-xs text-[#111827] dark:text-[#F3F5EC] block truncate"
                >
                  {user?.name || "Koshik"}
                </span>
                <span
                  suppressHydrationWarning
                  className="text-[10px] text-[#6B7280] dark:text-[#9EA793] block truncate"
                >
                  {user?.email || "Lead Evaluator"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#DC2626] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
