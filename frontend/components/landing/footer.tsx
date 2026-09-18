"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#3D422E] dark:bg-[#191E14] dark:border-t dark:border-[#2E3626] text-white pt-16 pb-12 px-4 sm:px-6 rounded-t-[36px] sm:rounded-t-[48px] mt-12 transition-colors">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Top Footer Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/10">
          <div className="space-y-3 max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="TerraPulse Logo"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">TerraPulse</span>
            </div>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Environmental Intelligence Platform. High-resolution satellite analytics, carbon flux
              accounting, and biodiversity resilience metrics.
            </p>
          </div>

          {/* Newsletter Input Capsule */}
          <div className="w-full md:w-auto space-y-2">
            <p className="text-xs font-semibold text-white/90">
              Get weekly geospatial telemetry briefings
            </p>
            <div className="flex items-center rounded-full bg-white/10 border border-white/20 p-1 pl-4 max-w-md focus-within:border-[#EBF1B1]">
              <input
                type="email"
                placeholder="Enter your work email"
                className="bg-transparent text-xs text-white placeholder-white/50 focus:outline-none w-full pr-2"
              />
              <button
                type="button"
                className="rounded-full bg-[#EBF1B1] text-[#3D422E] font-bold text-xs px-4 py-2 hover:bg-white transition-colors shrink-0"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Links & Navigation Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
              Platform
            </span>
            <ul className="space-y-2 text-white/70">
              <li>
                <Link href="/dashboard" className="hover:text-[#EBF1B1] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-[#EBF1B1] transition-colors">
                  Projects Grid
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#EBF1B1] transition-colors">
                  Geospatial Map
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-[#EBF1B1] transition-colors">
                  Health Index Analytics
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
              Standards
            </span>
            <ul className="space-y-2 text-white/70">
              <li>Verra VCS Methodology</li>
              <li>Gold Standard Biomass</li>
              <li>Sentinel-2 Multispectral</li>
              <li>Turf.js PostGIS Engine</li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
              Backend Architecture
            </span>
            <ul className="space-y-2 text-white/70">
              <li>FastAPI Async REST</li>
              <li>PostgreSQL + PostGIS</li>
              <li>Owner-Scoped Security</li>
              <li>Health API Check</li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
              Platform Status
            </span>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-emerald-400 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>UI Demo Mode Active</span>
              </div>
              <p className="text-[11px] text-white/60">Crafted for Fullstack Climate Hackathon</p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} TerraPulse Inc. Environmental Intelligence.</p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-white/80 hover:text-[#EBF1B1] transition-colors font-semibold"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
