"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu, X, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6">
      <nav className="mx-auto max-w-6xl rounded-full bg-white/90 dark:bg-[#20251B]/90 backdrop-blur-md border border-[#E5E7EB] dark:border-[#2E3626] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300">
        <div className="flex h-16 sm:h-[68px] items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-[#3D422E]/5 dark:bg-[#EBF1B1]/10 border border-[#3D422E]/10 dark:border-[#EBF1B1]/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="TerraPulse Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-[#3D422E] dark:text-[#EBF1B1] transition-colors">
                TerraPulse
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider text-[#6B7280] dark:text-[#9EA793] transition-colors">
                Environmental Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="#overview"
              className="px-4 py-2 text-sm font-medium text-[#111827] dark:text-[#F3F5EC] hover:text-[#3D422E] dark:hover:text-[#EBF1B1] rounded-full hover:bg-[#F9FAF5] dark:hover:bg-[#272D20] transition-colors"
            >
              Overview
            </Link>
            <Link
              href="#health-index"
              className="px-4 py-2 text-sm font-medium text-[#111827] dark:text-[#F3F5EC] hover:text-[#3D422E] dark:hover:text-[#EBF1B1] rounded-full hover:bg-[#F9FAF5] dark:hover:bg-[#272D20] transition-colors"
            >
              Health Index
            </Link>
            <Link
              href="#bento"
              className="px-4 py-2 text-sm font-medium text-[#111827] dark:text-[#F3F5EC] hover:text-[#3D422E] dark:hover:text-[#EBF1B1] rounded-full hover:bg-[#F9FAF5] dark:hover:bg-[#272D20] transition-colors"
            >
              Intelligence Bento
            </Link>
            <Link
              href="#reviewer"
              className="px-4 py-2 text-sm font-medium text-[#111827] dark:text-[#F3F5EC] hover:text-[#3D422E] dark:hover:text-[#EBF1B1] rounded-full hover:bg-[#F9FAF5] dark:hover:bg-[#272D20] transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" />
              Reviewer Tour
            </Link>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[#3D422E] dark:text-[#EBF1B1] hover:bg-[#F9FAF5] dark:hover:bg-[#272D20] rounded-full transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-1.5 rounded-full bg-[#EBF1B1] px-5 py-2.5 text-sm font-semibold text-[#3D422E] shadow-sm transition-all duration-200 hover:bg-[#DFE897] hover:shadow-md active:scale-95"
            >
              <span>Launch Platform</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-1.5">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-[#3D422E] dark:text-[#EBF1B1] hover:bg-[#F9FAF5] dark:hover:bg-[#272D20] transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] dark:border-[#2E3626] px-4 py-4 space-y-2 bg-white/95 dark:bg-[#20251B]/95 backdrop-blur-lg rounded-b-[24px]">
            <Link
              href="#overview"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-[#111827] dark:text-[#F3F5EC] rounded-xl hover:bg-[#F9FAF5] dark:hover:bg-[#272D20]"
            >
              Overview
            </Link>
            <Link
              href="#health-index"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-[#111827] dark:text-[#F3F5EC] rounded-xl hover:bg-[#F9FAF5] dark:hover:bg-[#272D20]"
            >
              Environmental Health Index
            </Link>
            <Link
              href="#bento"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-[#111827] dark:text-[#F3F5EC] rounded-xl hover:bg-[#F9FAF5] dark:hover:bg-[#272D20]"
            >
              Intelligence Bento
            </Link>
            <Link
              href="#reviewer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-[#111827] dark:text-[#F3F5EC] rounded-xl hover:bg-[#F9FAF5] dark:hover:bg-[#272D20]"
            >
              Reviewer Tour
            </Link>
            <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#2E3626] flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-full border border-[#E5E7EB] dark:border-[#2E3626] py-2 text-sm font-semibold text-[#111827] dark:text-[#F3F5EC] hover:bg-[#F9FAF5] dark:hover:bg-[#272D20]"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-full bg-[#EBF1B1] py-2.5 text-sm font-semibold text-[#3D422E]"
              >
                Launch Platform
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
