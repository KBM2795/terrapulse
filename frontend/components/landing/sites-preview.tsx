"use client";

import React from "react";
import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";

export function SitesPreview() {
  const sites = [
    {
      name: "Midwest Forest Sanctuary",
      region: "Wisconsin, USA",
      area: "2,450 Acres",
      carbon: "89/100",
      health: "87.4",
      status: "Active",
      type: "Temperate Reforestation",
    },
    {
      name: "Amazon Agroforestry Basin",
      region: "Pará, Brazil",
      area: "1,897 Hectares",
      carbon: "94/100",
      health: "91.2",
      status: "Active",
      type: "Tropical Rainforest",
    },
    {
      name: "Sunny Slope Agro-corridor",
      region: "California, USA",
      area: "875 Acres",
      carbon: "78/100",
      health: "79.5",
      status: "Verified",
      type: "Regenerative Crops",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/15 text-[#3D422E] dark:text-[#EBF1B1] border dark:border-[#EBF1B1]/30 text-xs font-bold uppercase tracking-wider">
            LOCATIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] dark:text-[#F3F5EC] transition-colors">
            Active Monitoring Sites Across the Globe
          </h2>
          <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#9EA793] transition-colors">
            Continuous satellite observation tracking carbon sequestration and biodiversity
            corridors.
          </p>
        </div>

        {/* 3 Minimal Site Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sites.map((site, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-[#E5E7EB] dark:border-[#2E3626] bg-white dark:bg-[#20251B] p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Simulated Minimal Map Top Bar */}
                <div className="h-32 w-full rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] relative overflow-hidden flex items-center justify-center p-4 transition-colors">
                  {/* Subtle map grid lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#3D422E_1px,transparent_1px)] [background-size:16px_16px] opacity-15 dark:opacity-25" />

                  {/* Simulated Polygon boundary */}
                  <div className="relative z-10 p-3 rounded-2xl bg-white/85 dark:bg-[#20251B]/85 backdrop-blur-xs border border-[#3D422E]/20 dark:border-[#EBF1B1]/20 shadow-xs flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#3D422E] dark:text-[#EBF1B1]" />
                    <span className="text-xs font-bold text-[#111827] dark:text-[#F3F5EC]">
                      {site.region}
                    </span>
                  </div>

                  {/* Type Badge */}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] text-[10px] font-bold border dark:border-[#EBF1B1]/30">
                    {site.type}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC] group-hover:text-[#3D422E] dark:group-hover:text-[#EBF1B1] transition-colors">
                    {site.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9EA793] mt-1">
                    Area: {site.area}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] dark:border-[#2E3626] text-xs transition-colors">
                  <div>
                    <span className="text-[#6B7280] dark:text-[#9EA793] block text-[11px]">
                      Carbon Score
                    </span>
                    <span className="font-bold text-[#3D422E] dark:text-[#EBF1B1]">
                      {site.carbon}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] dark:text-[#9EA793] block text-[11px]">
                      Health Index
                    </span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">
                      {site.health}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Link
                  href="/map"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] hover:bg-[#EBF1B1] dark:hover:bg-[#EBF1B1] text-[#3D422E] dark:text-[#EBF1B1] dark:hover:text-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold transition-colors"
                >
                  <span>Fly To Site on Map</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
