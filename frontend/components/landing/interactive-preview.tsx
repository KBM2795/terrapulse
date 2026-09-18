"use client";

import React, { useState } from "react";
import { Activity, Leaf, TreePine } from "lucide-react";

export function InteractivePreview() {
  const [carbonScore, setCarbonScore] = useState<number>(85);
  const [biodiversityScore, setBiodiversityScore] = useState<number>(78);
  const [soilHealth, setSoilHealth] = useState<number>(82);
  const [treeCoverage, setTreeCoverage] = useState<number>(70);

  // Backend Formula: (0.6 * Carbon Score) + (0.4 * Biodiversity Score)
  const healthIndex = Number((0.6 * carbonScore + 0.4 * biodiversityScore).toFixed(1));

  const getStatus = (score: number) => {
    if (score >= 75) {
      return {
        label: "Healthy",
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
        dot: "bg-emerald-500",
      };
    }
    if (score >= 50) {
      return {
        label: "Moderate",
        color: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60",
        dot: "bg-amber-500",
      };
    }
    return {
      label: "Critical",
      color: "text-rose-700 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60",
      dot: "bg-rose-500",
    };
  };

  const status = getStatus(healthIndex);

  const resetToPresets = (c: number, b: number, s: number, t: number) => {
    setCarbonScore(c);
    setBiodiversityScore(b);
    setSoilHealth(s);
    setTreeCoverage(t);
  };

  // Calculate circular stroke offset
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthIndex / 100) * circumference;

  return (
    <section
      id="health-index"
      className="py-16 px-4 sm:px-6 bg-[#F9FAF5] dark:bg-[#161A12] transition-colors"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/15 text-[#3D422E] dark:text-[#EBF1B1] text-xs font-bold uppercase tracking-wider border dark:border-[#EBF1B1]/30">
            <Activity className="w-3.5 h-3.5" />
            <span>Proprietary Algorithm</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827] dark:text-[#F3F5EC] transition-colors">
            Environmental Health Index Simulator
          </h2>
          <p className="text-sm sm:text-base text-[#6B7280] dark:text-[#9EA793] transition-colors">
            Adjust the telemetry inputs to test the weighted ecosystem scoring model implemented in
            the TerraPulse backend engine.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-[32px] border border-[#E5E7EB] dark:border-[#2E3626] bg-white dark:bg-[#20251B] p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Sliders & Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC] flex items-center gap-2">
                  <span>Geospatial Telemetry Sliders</span>
                  <span className="text-xs font-normal text-[#6B7280] dark:text-[#9EA793]">
                    (Drag to test)
                  </span>
                </h3>

                {/* Preset Pills */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => resetToPresets(92, 88, 90, 85)}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-[#F9FAF5] dark:bg-[#161A12] hover:bg-[#EBF1B1] dark:hover:bg-[#2E3626] text-[#3D422E] dark:text-[#EBF1B1] border border-[#E5E7EB] dark:border-[#2E3626] transition-colors"
                  >
                    High Health
                  </button>
                  <button
                    onClick={() => resetToPresets(65, 58, 60, 52)}
                    className="px-2.5 py-1 text-xs font-medium rounded-full bg-[#F9FAF5] dark:bg-[#161A12] hover:bg-[#EBF1B1] dark:hover:bg-[#2E3626] text-[#3D422E] dark:text-[#EBF1B1] border border-[#E5E7EB] dark:border-[#2E3626] transition-colors"
                  >
                    Stressed Plot
                  </button>
                </div>
              </div>

              {/* Slider 1: Carbon Score (60% Weight) */}
              <div className="space-y-2 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] p-4 border border-[#E5E7EB]/60 dark:border-[#2E3626]">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-[#111827] dark:text-[#F3F5EC] flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Carbon Score
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12]">
                      60% Weight
                    </span>
                  </span>
                  <span className="text-base font-bold text-[#3D422E] dark:text-[#EBF1B1] font-mono">
                    {carbonScore} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={carbonScore}
                  onChange={(e) => setCarbonScore(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-gray-200 dark:bg-[#272D20] accent-[#3D422E] dark:accent-[#EBF1B1] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#6B7280] dark:text-[#9EA793]">
                  <span>Depleted (10)</span>
                  <span>Optimal Sequestration (100)</span>
                </div>
              </div>

              {/* Slider 2: Biodiversity Score (40% Weight) */}
              <div className="space-y-2 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] p-4 border border-[#E5E7EB]/60 dark:border-[#2E3626]">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-[#111827] dark:text-[#F3F5EC] flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-[#3D422E] dark:text-[#EBF1B1]" />
                    Biodiversity Score
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EBF1B1] dark:bg-[#272D20] text-[#3D422E] dark:text-[#EBF1B1] border dark:border-[#EBF1B1]/20">
                      40% Weight
                    </span>
                  </span>
                  <span className="text-base font-bold text-[#3D422E] dark:text-[#EBF1B1] font-mono">
                    {biodiversityScore} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={biodiversityScore}
                  onChange={(e) => setBiodiversityScore(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-gray-200 dark:bg-[#272D20] accent-[#3D422E] dark:accent-[#EBF1B1] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#6B7280] dark:text-[#9EA793]">
                  <span>Monoculture (10)</span>
                  <span>Old-Growth Density (100)</span>
                </div>
              </div>

              {/* Ancillary Indicators Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] p-3.5 border border-[#E5E7EB]/60 dark:border-[#2E3626]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B7280] dark:text-[#9EA793] font-medium">
                      Soil Organic Matter
                    </span>
                    <span className="font-bold text-[#111827] dark:text-[#F3F5EC]">
                      {soilHealth}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={soilHealth}
                    onChange={(e) => setSoilHealth(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg bg-gray-200 dark:bg-[#272D20] accent-[#3D422E] dark:accent-[#EBF1B1] cursor-pointer"
                  />
                </div>

                <div className="space-y-1 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] p-3.5 border border-[#E5E7EB]/60 dark:border-[#2E3626]">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6B7280] dark:text-[#9EA793] font-medium">
                      Canopy Density
                    </span>
                    <span className="font-bold text-[#111827] dark:text-[#F3F5EC]">
                      {treeCoverage}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={treeCoverage}
                    onChange={(e) => setTreeCoverage(Number(e.target.value))}
                    className="w-full h-1.5 rounded-lg bg-gray-200 dark:bg-[#272D20] accent-[#3D422E] dark:accent-[#EBF1B1] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live Circular Gauge Display */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 rounded-[28px] bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-center relative overflow-hidden transition-colors">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9EA793] mb-2">
                Calculated Score
              </span>

              {/* Circular Gauge */}
              <div className="relative w-44 h-44 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="14"
                    fill="transparent"
                    className="text-[#E5E7EB] dark:text-[#2E3626]"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="14"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="text-[#3D422E] dark:text-[#EBF1B1] transition-all duration-300 ease-out"
                  />
                </svg>

                {/* Inner Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black tracking-tight text-[#3D422E] dark:text-[#EBF1B1]">
                    {healthIndex}
                  </span>
                  <span className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider">
                    Out of 100
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold mt-2 ${status.bg} ${status.color}`}
              >
                <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                <span>Status: {status.label}</span>
              </div>

              {/* Formula Badge */}
              <div className="mt-4 pt-4 border-t border-[#E5E7EB] dark:border-[#2E3626] w-full text-center">
                <p className="text-[11px] font-mono text-[#6B7280] dark:text-[#9EA793]">
                  Formula: (0.6 × {carbonScore}) + (0.4 × {biodiversityScore}) = {healthIndex}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
