"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Quote } from "lucide-react";

export function FounderQuote() {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[32px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-8 sm:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center transition-colors">
          {/* Left Column: Quote Content */}
          <div className="md:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 flex items-center justify-center text-[#3D422E] dark:text-[#EBF1B1]">
                <Quote className="w-6 h-6 fill-current" />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-[#3D422E] dark:text-[#EBF1B1] text-xs font-bold uppercase tracking-wider">
                THE FOUNDER
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] dark:text-[#F3F5EC] leading-snug transition-colors">
              When I started TerraPulse, my goal was simple:
            </h2>

            <p className="text-base sm:text-lg text-[#6B7280] dark:text-[#9EA793] leading-relaxed transition-colors">
              To build a precision climate-tech platform that replaces guesswork with orbital radar
              and multispectral sensor telemetry. We believe every hectare of reforested land and
              every tonne of captured carbon should be open, verifiable, and permanent.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-[#EBF1B1] hover:bg-[#DFE897] text-[#3D422E] text-sm font-bold transition-colors shadow-sm"
              >
                Read Mission
              </Link>
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-[#111827] dark:text-[#F3F5EC] block">
                  Dr. Daniel Hartman
                </span>
                <span className="text-[#6B7280] dark:text-[#9EA793]">
                  Founder & Chief Ecologist
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Founder Photo */}
          <div className="md:col-span-5 relative h-[320px] sm:h-[380px] rounded-[28px] overflow-hidden border border-[#E5E7EB] dark:border-[#2E3626] shadow-md group">
            <Image
              src="/images/founder-portrait.jpg"
              alt="Dr. Daniel Hartman, Founder of TerraPulse"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
