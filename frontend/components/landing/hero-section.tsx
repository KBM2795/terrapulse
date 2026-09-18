"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles, MapPin, CheckCircle2 } from "lucide-react";

export function HeroSection() {
  const [activePreset, setActivePreset] = useState<"amazon" | "cerrado" | "borneo">("amazon");

  const telemetryData = {
    amazon: {
      name: "Amazon Reforestation Basin",
      area: "1,897 Hectares",
      status: "Active Monitoring",
      carbon: "88/100",
      biodiversity: "81/100",
      health: "85.2",
      healthStatus: "Healthy",
      coordinates: "-3.4653° S, 62.2159° W",
    },
    cerrado: {
      name: "Cerrado Native Biome Restoration",
      area: "940 Hectares",
      status: "Active Monitoring",
      carbon: "79/100",
      biodiversity: "74/100",
      health: "77.0",
      healthStatus: "Moderate",
      coordinates: "-14.2350° S, 51.9253° W",
    },
    borneo: {
      name: "Borneo Mangrove Carbon Corridor",
      area: "2,350 Hectares",
      status: "Verified Carbon Credit",
      carbon: "94/100",
      biodiversity: "89/100",
      health: "92.0",
      healthStatus: "Healthy",
      coordinates: "4.2105° N, 115.8988° E",
    },
  };

  const current = telemetryData[activePreset];

  return (
    <section id="overview" className="relative pt-6 sm:pt-10 pb-16 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Top Centered Hero Content */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF1B1]/70 dark:bg-[#EBF1B1]/15 border border-[#3D422E]/15 dark:border-[#EBF1B1]/30 text-[#3D422E] dark:text-[#EBF1B1] text-xs sm:text-sm font-semibold tracking-wide transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" />
            <span>Next-Gen Climate Intelligence & Geospatial Analytics</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#111827] dark:text-[#F3F5EC] leading-[1.12] transition-colors">
            Environmental Intelligence,{" "}
            <span className="text-[#3D422E] dark:text-[#EBF1B1] underline decoration-[#EBF1B1] dark:decoration-[#3D422E] decoration-wavy decoration-2">
              Measured from Orbit to Soil
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-[#6B7280] dark:text-[#9EA793] leading-relaxed max-w-2xl mx-auto transition-colors">
            Track carbon sequestration, calculate verified biodiversity metrics, and audit ecosystem
            resilience across global sites with satellite-grade precision.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] dark:text-[#161A12] px-7 py-3.5 text-base font-semibold text-white shadow-[0_10px_25px_rgba(61,66,46,0.25)] dark:shadow-[0_10px_25px_rgba(235,241,177,0.2)] transition-all hover:bg-[#2A2F1E] dark:hover:bg-white active:scale-95"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] px-6 py-3.5 text-base font-semibold text-[#111827] dark:text-[#F3F5EC] shadow-sm hover:bg-[#F9FAF5] dark:hover:bg-[#272D20] transition-all active:scale-95"
            >
              <Compass className="w-4 h-4 text-[#3D422E] dark:text-[#EBF1B1]" />
              <span>Interactive GIS Map</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793] transition-colors">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#3D422E] dark:text-[#EBF1B1]" />
              <span>PostGIS Polygon Engine</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#3D422E] dark:text-[#EBF1B1]" />
              <span>Verra & Gold Standard Aligned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#3D422E] dark:text-[#EBF1B1]" />
              <span>Zero-Lag Client Preview</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card (Apple / Green Roots Style) */}
        <div className="mt-12 sm:mt-16 relative rounded-[28px] sm:rounded-[32px] overflow-hidden border border-[#E5E7EB] dark:border-[#2E3626] bg-white dark:bg-[#20251B] shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] group transition-colors">
          {/* Main Visual Image */}
          <div className="relative h-[380px] sm:h-[480px] md:h-[540px] w-full overflow-hidden">
            <Image
              src="/images/aerial-crop-grid.jpg"
              alt="Aerial agricultural and forest monitoring grid"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* Top Left Floating Pill */}
            <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#20251B]/90 backdrop-blur-md text-[#3D422E] dark:text-[#EBF1B1] text-xs sm:text-sm font-semibold border border-white/40 dark:border-white/15 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry: Sentinel-2 Multispectral
              </span>
              <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-[#EBF1B1]/90 dark:bg-[#EBF1B1]/20 backdrop-blur-md text-[#3D422E] dark:text-[#EBF1B1] text-xs font-semibold border border-white/30 dark:border-white/10">
                10m Spatial Resolution
              </span>
            </div>

            {/* Top Right Preset Selector */}
            <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-10 hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-white/85 dark:bg-[#20251B]/85 backdrop-blur-md border border-white/40 dark:border-white/15 shadow-sm">
              <button
                onClick={() => setActivePreset("amazon")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  activePreset === "amazon"
                    ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] shadow-sm"
                    : "text-[#111827] dark:text-[#F3F5EC] hover:bg-white dark:hover:bg-[#272D20]"
                }`}
              >
                Amazon
              </button>
              <button
                onClick={() => setActivePreset("cerrado")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  activePreset === "cerrado"
                    ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] shadow-sm"
                    : "text-[#111827] dark:text-[#F3F5EC] hover:bg-white dark:hover:bg-[#272D20]"
                }`}
              >
                Cerrado
              </button>
              <button
                onClick={() => setActivePreset("borneo")}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  activePreset === "borneo"
                    ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] shadow-sm"
                    : "text-[#111827] dark:text-[#F3F5EC] hover:bg-white dark:hover:bg-[#272D20]"
                }`}
              >
                Borneo
              </button>
            </div>

            {/* Bottom Content Bar floating over image */}
            <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-6 z-10">
              <div className="rounded-[24px] bg-white/95 dark:bg-[#20251B]/95 backdrop-blur-xl border border-white/60 dark:border-[#2E3626] p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
                {/* Site Title & Coordinates */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] text-xs font-bold uppercase tracking-wider border dark:border-[#EBF1B1]/30">
                      {current.status}
                    </span>
                    <span className="text-xs text-[#6B7280] dark:text-[#9EA793] font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#3D422E] dark:text-[#EBF1B1]" />
                      {current.coordinates}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#111827] dark:text-[#F3F5EC]">
                    {current.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793]">
                    Total Monitored Area:{" "}
                    <span className="font-semibold text-[#111827] dark:text-[#F3F5EC]">
                      {current.area}
                    </span>
                  </p>
                </div>

                {/* Score Pills */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E7EB] dark:border-[#2E3626]">
                  <div className="rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] px-3.5 py-2 text-center min-w-[90px]">
                    <span className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA793] block">
                      Carbon
                    </span>
                    <span className="text-base font-bold text-[#3D422E] dark:text-[#EBF1B1]">
                      {current.carbon}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] px-3.5 py-2 text-center min-w-[90px]">
                    <span className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA793] block">
                      Biodiversity
                    </span>
                    <span className="text-base font-bold text-[#3D422E] dark:text-[#EBF1B1]">
                      {current.biodiversity}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-[#EBF1B1]/70 dark:bg-[#EBF1B1]/20 border border-[#3D422E]/10 dark:border-[#EBF1B1]/30 px-4 py-2 text-center min-w-[110px]">
                    <span className="text-[11px] font-bold text-[#3D422E] dark:text-[#EBF1B1] block uppercase tracking-wider">
                      Health Index
                    </span>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg font-black text-[#3D422E] dark:text-[#EBF1B1]">
                        {current.health}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="p-3 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] hover:bg-[#2A2F1E] dark:hover:bg-white transition-transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"
                    title="View Analytics"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
