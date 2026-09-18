"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, Sprout, ArrowUpRight } from "lucide-react";

export function BentoGrid() {
  const [visionSlide, setVisionSlide] = useState(0);

  const visions = [
    {
      title: "Vision",
      desc: "To lead the future of ecological verification by making satellite-grade environmental monitoring the global standard for carbon and biodiversity.",
      step: "1/2",
    },
    {
      title: "Mission",
      desc: "Empowering conservationists, farmers, and carbon markets with transparent geospatial telemetry, immutable audit trails, and automated health scores.",
      step: "2/2",
    },
  ];

  const currentVision = visions[visionSlide];

  return (
    <section id="bento" className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Bento Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {/* Card 1: Top Left - Vision & Mission Hero Card */}
          <div className="md:col-span-7 relative h-[380px] sm:h-[420px] rounded-[32px] overflow-hidden border border-[#E5E7EB] dark:border-[#2E3626] bg-white dark:bg-[#20251B] shadow-sm group transition-colors">
            <Image
              src="/images/farmer-harvest.jpg"
              alt="Farmer and researcher in harvest field"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Top Right Pill Badge */}
            <div className="absolute top-5 right-5 z-10">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/80 dark:bg-[#20251B]/85 backdrop-blur-md text-[#3D422E] dark:text-[#EBF1B1] text-xs font-bold border border-white/60 dark:border-white/10 uppercase tracking-wider">
                VISION & MISSION
              </span>
            </div>

            {/* Bottom Left Step Indicator */}
            <div className="absolute bottom-6 left-6 z-10">
              <span className="text-3xl sm:text-4xl font-black text-white/90 drop-shadow-md">
                {currentVision.step}
              </span>
            </div>

            {/* Floating Inner Card (Vision/Mission) */}
            <div className="absolute bottom-5 right-5 z-10 w-[85%] sm:w-[320px] rounded-[24px] bg-white/95 dark:bg-[#20251B]/95 backdrop-blur-md p-4 sm:p-5 shadow-xl border border-white/80 dark:border-[#2E3626] transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3D422E] dark:text-[#EBF1B1]">
                  {currentVision.title}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setVisionSlide(0)}
                    disabled={visionSlide === 0}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#272D20] disabled:opacity-30 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" />
                  </button>
                  <button
                    onClick={() => setVisionSlide(1)}
                    disabled={visionSlide === 1}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#272D20] disabled:opacity-30 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" />
                  </button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9EA793] leading-relaxed">
                {currentVision.desc}
              </p>
            </div>
          </div>

          {/* Card 2: Top Right - "AIMS FOR" in Pale Lime */}
          <div className="md:col-span-5 rounded-[32px] bg-[#EBF1B1] dark:bg-[#272E20] p-6 sm:p-7 border border-[#3D422E]/10 dark:border-[#EBF1B1]/20 flex flex-col justify-between shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#3D422E] dark:text-[#EBF1B1] tracking-tight">
                AIMS FOR
              </h3>
              <Sparkles className="w-5 h-5 text-[#3D422E]/60 dark:text-[#EBF1B1]/60" />
            </div>

            <div className="space-y-2.5">
              {/* Item 1 */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-white dark:bg-[#1E2319] p-3.5 shadow-sm border border-black/5 dark:border-[#2E3626] hover:translate-x-1 transition-transform">
                <span className="w-6 h-6 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </span>
                <p className="text-xs sm:text-sm font-medium text-[#111827] dark:text-[#F3F5EC]">
                  Organizations monitoring carbon sequestration with verified metrics
                </p>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-white dark:bg-[#1E2319] p-3.5 shadow-sm border border-black/5 dark:border-[#2E3626] hover:translate-x-1 transition-transform">
                <span className="w-6 h-6 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </span>
                <p className="text-xs sm:text-sm font-medium text-[#111827] dark:text-[#F3F5EC]">
                  Project managers requiring continuous GIS polygon boundaries
                </p>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-white dark:bg-[#1E2319] p-3.5 shadow-sm border border-black/5 dark:border-[#2E3626] hover:translate-x-1 transition-transform">
                <span className="w-6 h-6 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </span>
                <p className="text-xs sm:text-sm font-medium text-[#111827] dark:text-[#F3F5EC]">
                  Ecologists tracking soil biodiversity and vegetative canopy health
                </p>
              </div>

              {/* Item 4 */}
              <div className="flex items-center gap-3.5 rounded-2xl bg-white dark:bg-[#1E2319] p-3.5 shadow-sm border border-black/5 dark:border-[#2E3626] hover:translate-x-1 transition-transform">
                <span className="w-6 h-6 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] flex items-center justify-center text-xs font-bold shrink-0">
                  4
                </span>
                <p className="text-xs sm:text-sm font-medium text-[#111827] dark:text-[#F3F5EC]">
                  Auditors and registries needing verifiable immutable telemetry logs
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Bottom Left - Sustainability Manager Card */}
          <div className="md:col-span-4 rounded-[32px] overflow-hidden border border-[#E5E7EB] dark:border-[#2E3626] bg-white dark:bg-[#20251B] shadow-sm flex flex-col justify-between group transition-colors">
            <div className="relative h-[280px] w-full overflow-hidden">
              <Image
                src="/images/sustainability-lead.jpg"
                alt="Sophia Nguyen - Sustainability Lead"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5 bg-white dark:bg-[#20251B] transition-colors">
              <h4 className="font-bold text-lg text-[#111827] dark:text-[#F3F5EC]">
                Sophia Nguyen
              </h4>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA793] font-medium">
                Head of Geospatial Ecology
              </p>
            </div>
          </div>

          {/* Card 4 & 5: Bottom Middle - Split Cards */}
          <div className="md:col-span-4 flex flex-col gap-4">
            {/* Card 4: Top - Organic Crop Cultivation / GIS Boundary Engine in Pale Lime */}
            <div className="flex-1 rounded-[28px] bg-[#EBF1B1] dark:bg-[#272E20] p-5 border border-[#3D422E]/10 dark:border-[#EBF1B1]/20 relative overflow-hidden flex flex-col justify-between shadow-sm transition-colors">
              <div className="space-y-1.5 relative z-10">
                <h4 className="font-bold text-base text-[#3D422E] dark:text-[#EBF1B1]">
                  Geospatial Polygon Storage
                </h4>
                <p className="text-xs text-[#52593F] dark:text-[#A8B29C] leading-relaxed">
                  PostGIS vector polygons with millimetric GPS accuracy and automated Turf.js
                  hectare calculation.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between relative z-10">
                <span className="px-2.5 py-1 rounded-full bg-white/70 dark:bg-white/10 text-[#3D422E] dark:text-[#EBF1B1] text-[11px] font-bold">
                  PostGIS + Turf
                </span>
                <Sprout className="w-7 h-7 text-[#3D422E]/20 dark:text-[#EBF1B1]/20" />
              </div>
            </div>

            {/* Card 5: Bottom - Dark Forest Card "Let's Grow Together" */}
            <div className="rounded-[28px] bg-[#3D422E] dark:bg-[#1A2016] border border-[#3D422E] dark:border-[#2E3626] p-5 text-white flex flex-col justify-between shadow-sm transition-colors">
              <div>
                <h4 className="font-bold text-base tracking-tight text-white mb-1">
                  Let’s Monitor Together
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Owner-scoped access, real-time analytics, and verified credit issuance.
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EBF1B1] text-[#3D422E] text-xs font-bold hover:bg-white transition-colors"
                >
                  <span>Launch Platform</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 6: Bottom Right - Greenhouse & Field Office */}
          <div className="md:col-span-4 relative h-[360px] md:h-auto rounded-[32px] overflow-hidden border border-[#E5E7EB] dark:border-[#2E3626] bg-white dark:bg-[#20251B] shadow-sm group transition-colors">
            <Image
              src="/images/greenhouse-team.jpg"
              alt="Field Office and Agronomists"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Floating Contact / Office card */}
            <div className="absolute bottom-4 inset-x-4 z-10 rounded-[24px] bg-white/95 dark:bg-[#20251B]/95 backdrop-blur-md p-4 shadow-xl border border-white/80 dark:border-[#2E3626] space-y-2 transition-colors">
              <h5 className="font-bold text-sm text-[#111827] dark:text-[#F3F5EC]">
                Geospatial Intelligence HQ
              </h5>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9EA793]">
                Ecological Station 12, Amazon Carbon Corridor
              </p>
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="font-mono text-[#3D422E] dark:text-[#EBF1B1] font-medium">
                  +1 (800) 240-ECHO
                </span>
                <Link
                  href="/map"
                  className="text-[#3D422E] dark:text-[#EBF1B1] font-bold underline hover:text-white"
                >
                  View on Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
