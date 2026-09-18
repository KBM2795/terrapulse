"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAF5] text-[#111827] dark:bg-[#161A12] dark:text-[#F3F5EC] selection:bg-[#EBF1B1] selection:text-[#3D422E] transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* Main Viewport Content */}
      <div className="lg:pl-64 sm:lg:pl-72 flex flex-col min-h-screen">
        {/* Sticky Top Navbar */}
        <TopNavbar onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        {/* Dynamic Page Container */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
