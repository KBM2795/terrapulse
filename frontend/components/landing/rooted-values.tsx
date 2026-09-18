"use client";

import React from "react";
import Image from "next/image";
import { ShieldCheck, Sparkles, Users, Cpu } from "lucide-react";

export function RootedValues() {
  const values = [
    {
      title: "Sustainability First",
      desc: "Prioritizing verified ecological health and carbon drawdown for long-term ecosystem stability.",
      icon: ShieldCheck,
    },
    {
      title: "Quality & Auditability",
      desc: "Immutable activity logs and spatial polygons compatible with premier global registries.",
      icon: Sparkles,
    },
    {
      title: "Community Empowerment",
      desc: "Providing indigenous landowners and local stewards with transparent tracking tools.",
      icon: Users,
    },
    {
      title: "Geospatial Innovation",
      desc: "Harnessing orbital multispectral imaging and real-time NDVI analysis for high-resolution intelligence.",
      icon: Cpu,
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[32px] bg-[#EBF1B1] dark:bg-[#272E20] p-8 sm:p-14 border border-[#3D422E]/15 dark:border-[#EBF1B1]/20 shadow-sm transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Framed Botanical Photo */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Double Border Framing Effect */}
            <div className="relative p-2 rounded-[32px] border-2 border-[#3D422E]/20 dark:border-[#EBF1B1]/20 bg-white/40 dark:bg-white/5 shadow-md">
              <div className="relative w-[280px] sm:w-[320px] h-[340px] sm:h-[380px] rounded-[24px] overflow-hidden">
                <Image
                  src="/images/gardener-pruning.jpg"
                  alt="Precision ecological fieldwork"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Values Content & 2x2 Grid */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-white/70 dark:bg-[#1E2419] text-[#3D422E] dark:text-[#EBF1B1] text-xs font-extrabold uppercase tracking-wider border border-[#3D422E]/10 dark:border-[#EBF1B1]/20">
                  VALUES
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#3D422E] dark:text-[#EBF1B1] transition-colors">
                Rooted in Precision & Ecology
              </h2>
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div key={i} className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1E2419] flex items-center justify-center text-[#3D422E] dark:text-[#EBF1B1] shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-base text-[#3D422E] dark:text-[#F3F5EC]">
                      {v.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#52593F] dark:text-[#A8B29C] leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
