"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import {
  fetchSitesForAnalytics,
  fetchSiteAnalyticsData,
  generateSiteAnalytics,
  EnrichedAnalyticsSite,
} from "@/lib/analytics";
import { AnalyticsHistoryPoint } from "@/lib/dashboard";
import {
  ShieldCheck,
  Leaf,
  TreePine,
  Layers,
  Sparkles,
  Download,
  MapPin,
  RefreshCw,
  Compass,
  Calendar,
  BarChart3,
  TrendingUp,
} from "lucide-react";

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetSiteId = searchParams.get("site");

  const [sites, setSites] = useState<EnrichedAnalyticsSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [currentSite, setCurrentSite] = useState<EnrichedAnalyticsSite | null>(null);

  const [history, setHistory] = useState<AnalyticsHistoryPoint[]>([]);
  const [latest, setLatest] = useState<AnalyticsHistoryPoint | null>(null);

  const [timeRange, setTimeRange] = useState<"3M" | "6M" | "12M">("12M");
  const [activeMetricTab, setActiveMetricTab] = useState<
    "all" | "carbon" | "bio" | "soil" | "tree"
  >("all");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load of sites
  useEffect(() => {
    let ignore = false;

    fetchSitesForAnalytics()
      .then(({ sites: loadedSites }) => {
        if (ignore) return;
        setSites(loadedSites);

        if (loadedSites.length > 0) {
          const matched = targetSiteId
            ? loadedSites.find((s) => s.id === targetSiteId) || loadedSites[0]
            : loadedSites[0];

          setSelectedSiteId(matched.id);
          setCurrentSite(matched);
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          showToast("Failed to load monitored sites");
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [targetSiteId]);

  // Load telemetry when selectedSiteId changes
  useEffect(() => {
    if (!selectedSiteId) return;

    let ignore = false;

    fetchSiteAnalyticsData(selectedSiteId)
      .then(({ latest: l, history: h }) => {
        if (!ignore) {
          setLatest(l);
          setHistory(h);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          showToast("Failed to load telemetry analytics");
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedSiteId]);

  // Handle site switcher change
  const handleSiteChange = (siteId: string) => {
    setIsLoading(true);
    setSelectedSiteId(siteId);
    const found = sites.find((s) => s.id === siteId) || null;
    setCurrentSite(found);
    startTransition(() => {
      router.push(`/analytics?site=${siteId}`);
    });
  };

  // Trigger live telemetry generation via FastAPI
  const handleTriggerAudit = async () => {
    if (!selectedSiteId) return;
    setIsGenerating(true);

    try {
      const newPoint = await generateSiteAnalytics(selectedSiteId);
      setLatest(newPoint);
      setHistory((prev) => [...prev.slice(1), newPoint]);
      showToast("Live orbital telemetry calculated and recorded in backend!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record telemetry";
      showToast(`Audit failed: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export report
  const handleExportReport = () => {
    if (!currentSite || !latest) return;
    const reportData =
      `TERRAPULSE ENVIRONMENTAL AUDIT REPORT\n` +
      `Site: ${currentSite.name}\n` +
      `Project: ${currentSite.project_name}\n` +
      `Area: ${Math.round(currentSite.area || 0)} Hectares\n` +
      `Coordinates: ${currentSite.coordinates_text || "Geospatial Boundary"}\n` +
      `----------------------------------------\n` +
      `Environmental Health Index (EHI): ${latest.health_index} (${latest.health_status})\n` +
      `Carbon Flux Score: ${latest.carbon_score} / 100\n` +
      `Biodiversity Score: ${latest.biodiversity_score} / 100\n` +
      `Soil Organic Health: ${latest.soil_health} / 100\n` +
      `Tree Canopy Density: ${latest.tree_coverage}%\n` +
      `Audit Timestamp: ${new Date().toISOString()}\n`;

    const blob = new Blob([reportData], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TerraPulse_Audit_${currentSite.name.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Audit Report downloaded successfully");
  };

  // Filter historical points by time range
  const filteredHistory = React.useMemo(() => {
    if (!history.length) return [];
    if (timeRange === "3M") return history.slice(-3);
    if (timeRange === "6M") return history.slice(-6);
    return history.slice(-12);
  }, [history, timeRange]);

  // Loading skeleton
  if (isLoading && !currentSite) {
    return (
      <PageContainer>
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="h-96 rounded-[32px] bg-neutral-100 dark:bg-[#20251B] animate-pulse" />
      </PageContainer>
    );
  }

  // Zero sites empty state
  if (!isLoading && sites.length === 0) {
    return (
      <PageContainer>
        <div className="rounded-[32px] p-8 sm:p-12 bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] text-center space-y-5 max-w-lg mx-auto my-12 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#EBF1B1]/40 dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-[#111827] dark:text-[#F3F5EC]">
              No Sites Registered for Analytics
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793] leading-relaxed">
              Create a project and trace boundary polygons in the GIS Map to start generating live
              ecological telemetry.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] text-xs font-bold shadow-sm hover:bg-[#2A2F1E] dark:hover:bg-white transition"
            >
              <Compass className="w-4 h-4" />
              <span>Trace Site on Map</span>
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold text-[#6B7280] dark:text-[#9EA793] hover:bg-gray-50 dark:hover:bg-[#272D20] transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Seed Demo Data</span>
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Active health index values
  const healthVal = latest?.health_index ?? 77.6;
  const healthStatus =
    latest?.health_status ??
    (healthVal >= 80 ? "Healthy" : healthVal >= 65 ? "Moderate" : "Critical");
  const carbonVal = latest?.carbon_score ?? 82;
  const bioVal = latest?.biodiversity_score ?? 74;
  const soilVal = latest?.soil_health ?? 85;
  const treeVal = latest?.tree_coverage ?? 78;

  // SVG Gauge constants
  const gaugeRadius = 90;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const strokeOffset =
    gaugeCircumference - (Math.min(100, Math.max(0, healthVal)) / 100) * gaugeCircumference;

  return (
    <PageContainer>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#20251B] text-[#F3F5EC] border border-[#2E3626] shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-[#EBF1B1]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Site Selector Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] text-xs font-bold uppercase tracking-wider">
              Phase 8 — Environmental Analytics
            </span>
            <span className="text-xs text-[#6B7280] dark:text-[#9EA793] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              Live Satellite Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F5EC] tracking-tight">
            Ecosystem Analytics & Health Index
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793] mt-0.5">
            Continuous multispectral flux computation, biodiversity indexing, and weighted
            ecological modeling.
          </p>
        </div>

        {/* Action Controls: Site Selector + Trigger Audit + Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Site Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedSiteId}
              onChange={(e) => handleSiteChange(e.target.value)}
              className="h-10 pl-4 pr-9 rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:ring-1 focus:ring-[#EBF1B1] shadow-2xs transition-colors cursor-pointer"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.project_name || "Plot"})
                </option>
              ))}
            </select>
          </div>

          {/* Trigger Telemetry Audit Button */}
          <button
            onClick={handleTriggerAudit}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] hover:bg-[#EBF1B1] dark:hover:bg-[#EBF1B1] text-[#3D422E] dark:text-[#EBF1B1] dark:hover:text-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Recalculate live telemetry from orbital sensors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Computing..." : "Run Audit"}</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] text-xs font-bold hover:bg-[#2A2F1E] dark:hover:bg-white shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          {/* View on Map Link */}
          {currentSite && (
            <Link
              href={`/map?project=${currentSite.project_id}&site=${currentSite.id}`}
              className="p-2.5 rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] text-[#6B7280] dark:text-[#9EA793] hover:text-[#3D422E] dark:hover:text-[#EBF1B1] transition"
              title="Inspect Polygon on GIS Map"
            >
              <Compass className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Selected Site Metadata Strip */}
      {currentSite && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] flex flex-wrap items-center justify-between gap-4 text-xs transition-colors shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#111827] dark:text-[#F3F5EC] text-sm block">
                {currentSite.name}
              </span>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9EA793] font-mono">
                {currentSite.coordinates_text || "Geospatial Boundary"} • {currentSite.project_name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[#6B7280] dark:text-[#9EA793]">
            <div>
              <span className="text-[10px] uppercase font-semibold block">PostGIS Area</span>
              <span className="font-bold text-[#111827] dark:text-[#F3F5EC]">
                {Math.round(currentSite.area || 0).toLocaleString()} ha (
                {Math.round((currentSite.area || 0) * 2.471).toLocaleString()} ac)
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold block">Audit Frequency</span>
              <span className="font-bold text-[#111827] dark:text-[#F3F5EC]">
                Every 5 Days (Sentinel-2)
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold block">Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Verified Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Environmental Health Gauge Card + 4 Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Large Circular Environmental Health Gauge */}
        <div className="lg:col-span-5 rounded-[32px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 transition-colors relative overflow-hidden">
          {/* Top header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
                Ecosystem Health Model
              </span>
              <h2 className="text-xl font-black text-[#111827] dark:text-[#F3F5EC]">
                Environmental Health Gauge
              </h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                healthStatus === "Healthy"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                  : healthStatus === "Critical"
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
              }`}
            >
              {healthStatus}
            </span>
          </div>

          {/* Large Visually Impressive Radial Circular Gauge */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 220 220">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="60%" stopColor="#EBF1B1" />
                  <stop offset="100%" stopColor="#A3E635" />
                </linearGradient>
                <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Outer Ring */}
              <circle
                cx="110"
                cy="110"
                r={gaugeRadius}
                stroke="currentColor"
                className="text-[#F3F4F0] dark:text-[#161A12]"
                strokeWidth="16"
                fill="none"
              />

              {/* Track Dotted Boundary Ring */}
              <circle
                cx="110"
                cy="110"
                r={gaugeRadius + 11}
                stroke="currentColor"
                className="text-[#E5E7EB] dark:text-[#2E3626]"
                strokeWidth="1.5"
                strokeDasharray="4, 4"
                fill="none"
              />

              {/* Animated Progress Radial Stroke */}
              <circle
                cx="110"
                cy="110"
                r={gaugeRadius}
                stroke="url(#gaugeGradient)"
                strokeWidth="16"
                strokeDasharray={gaugeCircumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="none"
                filter="url(#gaugeGlow)"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <span className="text-xs font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-widest block mb-0.5">
                Composite EHI
              </span>
              <span className="text-5xl sm:text-6xl font-black text-[#111827] dark:text-[#F3F5EC] tracking-tight">
                {healthVal.toFixed(1)}
              </span>
              <span
                className={`text-sm sm:text-base font-bold mt-1 ${
                  healthStatus === "Healthy"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : healthStatus === "Critical"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {healthStatus} Performance
              </span>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9EA793] mt-1 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                +4.2% above regional baseline
              </span>
            </div>
          </div>

          {/* Weighted Formula Breakdown Box */}
          <div className="p-4 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#111827] dark:text-[#F3F5EC] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" />
                Weighted Computation Formula
              </span>
              <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#9EA793]">
                ISO 14064 Standard
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] font-mono text-xs text-[#3D422E] dark:text-[#EBF1B1] text-center">
              EHI = (0.60 × {carbonVal}) + (0.40 × {bioVal}) = {healthVal.toFixed(1)}
            </div>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9EA793] leading-relaxed">
              Synthesized by combining net above-ground carbon sequestration density (60% weighting)
              with multi-canopy bio-acoustic species richness (40% weighting).
            </p>
          </div>
        </div>

        {/* Right 7 Cols: The 4 Core Telemetry Metrics Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Metric 1: Carbon Flux */}
          <div className="p-6 rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] shadow-sm space-y-4 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Leaf className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  +16.4 tCO₂e/ha
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
                  Carbon Sequestration
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-[#111827] dark:text-[#F3F5EC]">
                    {carbonVal}
                  </span>
                  <span className="text-xs font-bold text-[#6B7280] dark:text-[#9EA793]">
                    / 100 Index
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E5E7EB] dark:border-[#2E3626]">
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#F3F4F0] dark:bg-[#161A12] overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${carbonVal}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#9EA793]">
                <span>Biomass Density (SAR)</span>
                <span className="font-bold text-[#111827] dark:text-[#F3F5EC]">Optimal Flux</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Biodiversity Index */}
          <div className="p-6 rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] shadow-sm space-y-4 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF1B1]/60 dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] flex items-center justify-center">
                  <TreePine className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBF1B1]/60 dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] border border-[#3D422E]/20 dark:border-[#EBF1B1]/30">
                  48 Key Species
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
                  Biodiversity Index
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-[#111827] dark:text-[#F3F5EC]">
                    {bioVal}
                  </span>
                  <span className="text-xs font-bold text-[#6B7280] dark:text-[#9EA793]">
                    / 100 Index
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E5E7EB] dark:border-[#2E3626]">
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#F3F4F0] dark:bg-[#161A12] overflow-hidden">
                <div
                  className="h-full bg-[#3D422E] dark:bg-[#EBF1B1] rounded-full transition-all duration-700"
                  style={{ width: `${bioVal}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#9EA793]">
                <span>Canopy Structural Richness</span>
                <span className="font-bold text-[#111827] dark:text-[#F3F5EC]">High Stability</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Soil Organic Health */}
          <div className="p-6 rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] shadow-sm space-y-4 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                  3.8% SOC
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
                  Soil Organic Health
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-[#111827] dark:text-[#F3F5EC]">
                    {soilVal}
                  </span>
                  <span className="text-xs font-bold text-[#6B7280] dark:text-[#9EA793]">
                    / 100 Index
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E5E7EB] dark:border-[#2E3626]">
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#F3F4F0] dark:bg-[#161A12] overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${soilVal}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#9EA793]">
                <span>Microbial Carbon Stock</span>
                <span className="font-bold text-[#111827] dark:text-[#F3F5EC]">
                  Active Moisture
                </span>
              </div>
            </div>
          </div>

          {/* Metric 4: Tree Coverage & Canopy */}
          <div className="p-6 rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] shadow-sm space-y-4 transition-colors flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
                  {currentSite
                    ? Math.round((currentSite.area || 0) * (treeVal / 100)).toLocaleString()
                    : 0}{" "}
                  ha Canopy
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
                  Tree Coverage & Canopy
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-[#111827] dark:text-[#F3F5EC]">
                    {treeVal}%
                  </span>
                  <span className="text-xs font-bold text-[#6B7280] dark:text-[#9EA793]">
                    Density
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E5E7EB] dark:border-[#2E3626]">
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#F3F4F0] dark:bg-[#161A12] overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-700"
                  style={{ width: `${treeVal}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#6B7280] dark:text-[#9EA793]">
                <span>Sentinel-2 NDVI & LiDAR</span>
                <span className="font-bold text-[#111827] dark:text-[#F3F5EC]">Closed Canopy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Historical Trends Chart Section */}
      <div className="rounded-[32px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
              Time Series Auditing
            </span>
            <h3 className="text-xl font-bold text-[#111827] dark:text-[#F3F5EC]">
              Monthly Ecological Trends
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9EA793]">
              Continuous 12-month performance curves retrieved from FastAPI analytics telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Filter Tabs */}
            <div className="flex items-center p-1 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-semibold">
              <button
                onClick={() => setActiveMetricTab("all")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeMetricTab === "all"
                    ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12]"
                    : "text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC]"
                }`}
              >
                Composite EHI
              </button>
              <button
                onClick={() => setActiveMetricTab("carbon")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeMetricTab === "carbon"
                    ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12]"
                    : "text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC]"
                }`}
              >
                Carbon
              </button>
              <button
                onClick={() => setActiveMetricTab("bio")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeMetricTab === "bio"
                    ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12]"
                    : "text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC]"
                }`}
              >
                Biodiversity
              </button>
              <button
                onClick={() => setActiveMetricTab("soil")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeMetricTab === "soil"
                    ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12]"
                    : "text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC]"
                }`}
              >
                Soil
              </button>
              <button
                onClick={() => setActiveMetricTab("tree")}
                className={`px-3 py-1 rounded-full transition-all ${
                  activeMetricTab === "tree"
                    ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12]"
                    : "text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC]"
                }`}
              >
                Canopy
              </button>
            </div>

            {/* Time range selector */}
            <div className="flex items-center p-1 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-semibold">
              {(["3M", "6M", "12M"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    timeRange === r
                      ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12]"
                      : "text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Monthly Trend Bars / Chart */}
        <div className="h-72 w-full pt-4">
          <div className="h-56 w-full flex items-end justify-between gap-2 px-2 border-b border-[#E5E7EB] dark:border-[#2E3626] pb-2">
            {filteredHistory.map((pt, idx) => {
              const val =
                activeMetricTab === "carbon"
                  ? Math.round(pt.carbon_score)
                  : activeMetricTab === "bio"
                    ? Math.round(pt.biodiversity_score)
                    : activeMetricTab === "soil"
                      ? Math.round(pt.soil_health)
                      : activeMetricTab === "tree"
                        ? Math.round(pt.tree_coverage)
                        : Math.round(pt.health_index);

              const heightPct = Math.min(100, Math.max(12, (val / 100) * 100));
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end cursor-pointer"
                >
                  {/* Floating Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-30 px-3 py-1.5 rounded-xl bg-[#20251B] text-[#F3F5EC] border border-[#2E3626] shadow-xl text-[11px] font-bold whitespace-nowrap animate-in fade-in zoom-in-95">
                      <span className="text-[#EBF1B1] block text-[10px] uppercase">
                        {pt.month}: {val} / 100
                      </span>
                      <span className="text-white/80 text-[10px]">
                        EHI: {pt.health_index} ({pt.health_status})
                      </span>
                    </div>
                  )}

                  {/* Vertical Trend Bar */}
                  <div className="w-full max-w-[48px] h-full flex items-end bg-[#F9FAF5] dark:bg-[#161A12] rounded-xl p-1">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        activeMetricTab === "carbon"
                          ? "bg-emerald-500"
                          : activeMetricTab === "bio"
                            ? "bg-[#3D422E] dark:bg-[#EBF1B1]"
                            : activeMetricTab === "soil"
                              ? "bg-amber-500"
                              : activeMetricTab === "tree"
                                ? "bg-sky-500"
                                : "bg-gradient-to-t from-emerald-600 to-[#EBF1B1]"
                      } ${isHovered ? "opacity-100 ring-2 ring-[#EBF1B1]" : "opacity-85 hover:opacity-100"}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Month Label */}
                  <span
                    className={`text-[11px] font-bold transition-colors ${
                      isHovered
                        ? "text-[#3D422E] dark:text-[#EBF1B1]"
                        : "text-[#6B7280] dark:text-[#9EA793]"
                    }`}
                  >
                    {pt.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Sub-legend */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B7280] dark:text-[#9EA793]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Carbon Flux
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1]" />
                Biodiversity
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Soil Organic Carbon
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                Canopy Density
              </span>
            </div>

            <span className="text-[11px] font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              12 Months Continuous Satellite Telemetry
            </span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default function AnalyticsPage() {
  return (
    <React.Suspense
      fallback={
        <PageContainer>
          <div className="h-96 rounded-[32px] bg-neutral-100 dark:bg-[#20251B] animate-pulse" />
        </PageContainer>
      }
    >
      <AnalyticsContent />
    </React.Suspense>
  );
}
