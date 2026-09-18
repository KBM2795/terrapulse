"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Map, BarChart3 } from "lucide-react";

export function ReviewerTour() {
  const reviewerSteps = [
    {
      num: "01",
      title: "Interactive Dashboard",
      desc: "View aggregated KPIs, total monitored area, carbon sequestration trajectory, and recent activity logs.",
      icon: BarChart3,
      link: "/dashboard",
    },
    {
      num: "02",
      title: "Geospatial Polygon Map",
      desc: "Interactive Mapbox GL interface. Draw and inspect site boundaries, calculate hectares, and fly to coordinates.",
      icon: Map,
      link: "/map",
    },
    {
      num: "03",
      title: "Environmental Health Analytics",
      desc: "Inspect our weighted algorithm: 60% Carbon + 40% Biodiversity + Soil Health & Tree Canopy metrics.",
      icon: ShieldCheck,
      link: "/analytics",
    },
  ];

  return (
    <section id="reviewer" className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[32px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-8 sm:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-colors">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 pb-8 border-b border-[#E5E7EB] dark:border-[#2E3626]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/15 text-[#3D422E] dark:text-[#EBF1B1] border dark:border-[#EBF1B1]/30 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reviewer & Hackathon Guide</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F5EC] transition-colors">
                Welcome Evaluator: Instant Tour Walkthrough
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793] mt-1 transition-colors">
                Explore the platform with pre-configured mock datasets and zero setup.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] hover:bg-[#2A2F1E] dark:hover:bg-white font-semibold text-sm shadow-md transition-all active:scale-95"
            >
              <span>Enter Platform Preview</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviewerSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-[24px] bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] flex flex-col justify-between space-y-4 hover:border-[#3D422E]/30 dark:hover:border-[#EBF1B1]/30 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#3D422E]/30 dark:text-[#EBF1B1]/30 font-mono">
                        {step.num}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-white dark:bg-[#20251B] flex items-center justify-center text-[#3D422E] dark:text-[#EBF1B1] shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-bold text-base text-[#111827] dark:text-[#F3F5EC] group-hover:text-[#3D422E] dark:group-hover:text-[#EBF1B1] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#6B7280] dark:text-[#9EA793] leading-relaxed transition-colors">
                      {step.desc}
                    </p>
                  </div>

                  <Link
                    href={step.link}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3D422E] dark:text-[#EBF1B1] hover:underline pt-2 transition-colors"
                  >
                    <span>View Section</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
