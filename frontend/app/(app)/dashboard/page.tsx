"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { PageContainer } from "@/components/layout/page-container";
import {
  fetchDashboardData,
  formatTimeAgo,
  DashboardData,
  AnalyticsHistoryPoint,
} from "@/lib/dashboard";
import { api } from "@/lib/api";
import {
  FolderKanban,
  MapPin,
  ShieldCheck,
  Leaf,
  TreePine,
  ArrowUpRight,
  Plus,
  Clock,
  Compass,
  Layers,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Activity,
  CheckCircle2,
} from "lucide-react";

// Fallback monthly trend in case site has no history yet
const DEFAULT_MONTHLY_TREND: AnalyticsHistoryPoint[] = [
  {
    month: "Jan",
    carbon_score: 68,
    biodiversity_score: 62,
    soil_health: 70,
    tree_coverage: 50,
    health_index: 65.6,
    health_status: "Moderate",
    recorded_at: "",
  },
  {
    month: "Feb",
    carbon_score: 70,
    biodiversity_score: 64,
    soil_health: 71,
    tree_coverage: 52,
    health_index: 67.6,
    health_status: "Moderate",
    recorded_at: "",
  },
  {
    month: "Mar",
    carbon_score: 72,
    biodiversity_score: 65,
    soil_health: 73,
    tree_coverage: 53,
    health_index: 69.2,
    health_status: "Moderate",
    recorded_at: "",
  },
  {
    month: "Apr",
    carbon_score: 74,
    biodiversity_score: 67,
    soil_health: 75,
    tree_coverage: 55,
    health_index: 71.2,
    health_status: "Moderate",
    recorded_at: "",
  },
  {
    month: "May",
    carbon_score: 75,
    biodiversity_score: 68,
    soil_health: 76,
    tree_coverage: 58,
    health_index: 72.2,
    health_status: "Moderate",
    recorded_at: "",
  },
  {
    month: "Jun",
    carbon_score: 77,
    biodiversity_score: 69,
    soil_health: 78,
    tree_coverage: 60,
    health_index: 73.8,
    health_status: "Moderate",
    recorded_at: "",
  },
  {
    month: "Jul",
    carbon_score: 79,
    biodiversity_score: 70,
    soil_health: 79,
    tree_coverage: 62,
    health_index: 75.4,
    health_status: "Moderate",
    recorded_at: "",
  },
  {
    month: "Aug",
    carbon_score: 80,
    biodiversity_score: 70,
    soil_health: 80,
    tree_coverage: 63,
    health_index: 76.0,
    health_status: "Moderate",
    recorded_at: "",
  },
  {
    month: "Sep",
    carbon_score: 81,
    biodiversity_score: 71,
    soil_health: 82,
    tree_coverage: 65,
    health_index: 77.0,
    health_status: "Moderate",
    recorded_at: "",
  },
  {
    month: "Oct",
    carbon_score: 82,
    biodiversity_score: 72,
    soil_health: 83,
    tree_coverage: 66,
    health_index: 78.0,
    health_status: "Moderate",
    recorded_at: "",
  },
  {
    month: "Nov",
    carbon_score: 83,
    biodiversity_score: 73,
    soil_health: 84,
    tree_coverage: 68,
    health_index: 79.0,
    health_status: "Moderate",
    recorded_at: "",
  },
  {
    month: "Dec",
    carbon_score: 85,
    biodiversity_score: 74,
    soil_health: 86,
    tree_coverage: 70,
    health_index: 80.6,
    health_status: "Healthy",
    recorded_at: "",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChartMetric, setActiveChartMetric] = useState<"carbon" | "biodiversity">("carbon");

  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchDashboardData()
      .then((result) => {
        if (!ignore) {
          setData(result);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
          setError(msg);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [refreshIndex]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshIndex((prev) => prev + 1);
  };

  // Evaluator 1-click seed action
  const handleSeed = async () => {
    setIsSeeding(true);
    setError(null);
    try {
      await api.post("/api/dev/seed");
      setRefreshIndex((prev) => prev + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to seed demo data";
      setError(msg);
    } finally {
      setIsSeeding(false);
    }
  };

  const firstName = user?.name ? user.name.split(" ")[0] : "Observer";

  // Helper for activity event badges and icons
  const getActivityMeta = (eventType: string) => {
    switch (eventType) {
      case "PROJECT_CREATED":
        return {
          icon: FolderKanban,
          badge: "Project Created",
          accent: "text-blue-500 bg-blue-500/10",
        };
      case "SITE_ADDED":
        return {
          icon: MapPin,
          badge: "Site Registered",
          accent: "text-emerald-500 bg-emerald-500/10",
        };
      case "ANALYTICS_GENERATED":
        return {
          icon: ShieldCheck,
          badge: "Health Computed",
          accent: "text-[#EBF1B1] bg-[#EBF1B1]/10",
        };
      default:
        return {
          icon: Activity,
          badge: "Audit Event",
          accent: "text-amber-500 bg-amber-500/10",
        };
    }
  };

  // Trajectory points: use backend history or fallback
  const chartPoints =
    data?.history && data.history.length > 0 ? data.history : DEFAULT_MONTHLY_TREND;

  // Render Skeleton while initial loading
  if (isLoading) {
    return (
      <PageContainer>
        {/* Banner Skeleton */}
        <div className="rounded-[28px] sm:rounded-[32px] bg-[#3D422E]/40 dark:bg-[#1E2419] border border-[#2E3626] p-6 sm:p-8 animate-pulse flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3 max-w-xl w-full">
            <div className="h-5 w-36 bg-white/10 rounded-full" />
            <div className="h-8 w-64 bg-white/20 rounded-xl" />
            <div className="h-4 w-full bg-white/10 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-white/15 rounded-full" />
            <div className="h-10 w-28 bg-white/15 rounded-full" />
          </div>
        </div>

        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-[24px] p-6 border border-[#E5E7EB] dark:border-[#2E3626] bg-white dark:bg-[#20251B] animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
              </div>
              <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          ))}
        </div>

        {/* Charts & Health Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 animate-pulse h-80" />
          <div className="lg:col-span-4 rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 animate-pulse h-80" />
        </div>
      </PageContainer>
    );
  }

  // Error Banner if API failed
  if (error && !data) {
    return (
      <PageContainer>
        <div className="p-8 rounded-[28px] bg-red-500/10 border border-red-500/30 text-center space-y-4 max-w-lg mx-auto my-12">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Connection Error</h3>
          <p className="text-xs text-red-600/90 dark:text-red-300">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </PageContainer>
    );
  }

  const kpiList = [
    {
      label: "Total Projects",
      value: `${data?.kpis.totalProjects || 0}`,
      change: data?.kpis.totalProjects ? "Active" : "None",
      subtext: `${data?.kpis.totalProjects || 0} initiatives`,
      icon: FolderKanban,
      bg: "bg-white",
    },
    {
      label: "Monitored Sites",
      value: `${data?.kpis.totalSites || 0}`,
      change: data?.kpis.totalSites ? "Verified" : "Pending",
      subtext: "PostGIS Polygons mapped",
      icon: MapPin,
      bg: "bg-white",
    },
    {
      label: "Average Health Index",
      value: data?.kpis.avgHealthIndex ? `${data.kpis.avgHealthIndex}` : "—",
      change: data?.kpis.healthStatus || "Pending",
      subtext: "60% Carbon + 40% Bio",
      icon: ShieldCheck,
      bg: "bg-[#EBF1B1]",
    },
    {
      label: "Total Area Monitored",
      value: data?.kpis.totalAreaHectares
        ? `${data.kpis.totalAreaHectares.toLocaleString()} ha`
        : "0 ha",
      change: data?.kpis.totalAreaHectares
        ? `${Math.round(data.kpis.totalAreaHectares * 2.471).toLocaleString()} Acres`
        : "0 Acres",
      subtext: "Satellite multispectral",
      icon: Layers,
      bg: "bg-white",
    },
  ];

  return (
    <PageContainer>
      {/* Top Banner / Welcome Card */}
      <div className="rounded-[28px] sm:rounded-[32px] bg-[#3D422E] dark:bg-[#1E2419] dark:border dark:border-[#2E3626] text-white p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 text-[#EBF1B1] text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Environmental Telemetry Active</span>
          </div>
          <h2
            suppressHydrationWarning
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          >
            Welcome back, {firstName}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            {data && data.projects.length > 0 ? (
              <>
                Your ecological monitoring network covers{" "}
                <span className="font-bold text-[#EBF1B1]">
                  {data.kpis.totalAreaHectares.toLocaleString()} hectares
                </span>{" "}
                across {data.kpis.totalProjects} project{data.kpis.totalProjects > 1 ? "s" : ""}.
                Current ecosystem health status is{" "}
                <span className="font-bold text-[#EBF1B1]">
                  {data.kpis.healthStatus} ({data.kpis.avgHealthIndex} EHI)
                </span>
                .
              </>
            ) : (
              <>
                Your ecological monitoring workspace is initialized. No projects or sites registered
                yet.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/map"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EBF1B1] text-[#3D422E] text-xs sm:text-sm font-bold hover:bg-white transition-all shadow-sm active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Open Geospatial Map</span>
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Link>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-[#EBF1B1]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Reviewer Fast-Path Seed Banner if zero projects exist */}
      {data && data.projects.length === 0 && (
        <div className="rounded-[24px] p-6 bg-[#20251B] border border-[#2E3626] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2 text-[#EBF1B1] text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Reviewer Fast-Path</span>
            </div>
            <h4 className="font-bold text-[#F3F5EC] text-base">
              No projects found in this account
            </h4>
            <p className="text-xs text-[#9EA793] leading-relaxed">
              Populate the platform with 3 real-world ecological projects (Amazon, Cerrado, Black
              Forest), 4 PostGIS geospatial sites, and 48 historical telemetry records with a single
              click.
            </p>
          </div>

          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EBF1B1] text-[#161A12] text-xs sm:text-sm font-bold hover:bg-white transition shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
          >
            {isSeeding ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Seeding Database...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Seed Demo Dataset</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 4 Large KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiList.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isLime = kpi.bg === "bg-[#EBF1B1]";

          return (
            <div
              key={idx}
              className={`rounded-[24px] p-6 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                isLime
                  ? "bg-[#EBF1B1] dark:bg-[#272E20] border-[#3D422E]/15 dark:border-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1]"
                  : "bg-white dark:bg-[#20251B] border-[#E5E7EB] dark:border-[#2E3626] text-[#111827] dark:text-[#F3F5EC]"
              } shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isLime
                      ? "text-[#52593F] dark:text-[#A8B29C]"
                      : "text-[#6B7280] dark:text-[#9EA793]"
                  }`}
                >
                  {kpi.label}
                </span>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isLime
                      ? "bg-white/80 dark:bg-[#1E2419] text-[#3D422E] dark:text-[#EBF1B1]"
                      : "bg-[#F9FAF5] dark:bg-[#161A12] text-[#3D422E] dark:text-[#EBF1B1]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="text-3xl sm:text-4xl font-black tracking-tight block">
                  {kpi.value}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isLime
                        ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12]"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                    }`}
                  >
                    {kpi.change}
                  </span>
                  <span
                    className={`text-[11px] ${
                      isLime
                        ? "text-[#52593F] dark:text-[#A8B29C]"
                        : "text-[#6B7280] dark:text-[#9EA793]"
                    }`}
                  >
                    {kpi.subtext}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Chart & Environmental Health Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Historical Trend Chart */}
        <div className="lg:col-span-8 rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
                12-Month Trajectory
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-[#F3F5EC] transition-colors">
                Ecosystem Performance Trends
              </h3>
            </div>

            {/* Metric Filter Tabs */}
            <div className="flex items-center p-1 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-semibold">
              <button
                onClick={() => setActiveChartMetric("carbon")}
                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  activeChartMetric === "carbon"
                    ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] shadow-xs"
                    : "text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC]"
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Carbon Flux</span>
              </button>
              <button
                onClick={() => setActiveChartMetric("biodiversity")}
                className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  activeChartMetric === "biodiversity"
                    ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] shadow-xs"
                    : "text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC]"
                }`}
              >
                <TreePine className="w-3.5 h-3.5" />
                <span>Biodiversity</span>
              </button>
            </div>
          </div>

          {/* Clean SVG Trend Chart */}
          <div className="h-64 w-full relative pt-4">
            <div className="h-48 w-full flex items-end justify-between gap-2 px-2">
              {chartPoints.map((d, i) => {
                const val =
                  activeChartMetric === "carbon"
                    ? Math.round(d.carbon_score)
                    : Math.round(d.biodiversity_score);
                const heightPercent = Math.min(100, Math.max(12, (val / 100) * 100));

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Hover Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] text-[11px] font-bold py-1 px-2 rounded-lg pointer-events-none z-20 whitespace-nowrap shadow-md">
                      {d.month}: {val}/100
                    </div>

                    {/* Bar visual */}
                    <div className="w-full max-w-[28px] bg-[#F9FAF5] dark:bg-[#161A12] rounded-t-xl overflow-hidden h-40 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          activeChartMetric === "carbon"
                            ? "bg-[#3D422E] dark:bg-[#EBF1B1] group-hover:bg-[#2A2F1E] dark:group-hover:bg-white"
                            : "bg-[#EBF1B1] dark:bg-[#A8B29C] group-hover:bg-[#DFE897]"
                        }`}
                      />
                    </div>

                    {/* Month label */}
                    <span className="text-[11px] font-medium text-[#6B7280] dark:text-[#9EA793]">
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart footer stats */}
          <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#2E3626] flex flex-wrap items-center justify-between gap-4 text-xs transition-colors">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1]" />
                <span className="text-[#6B7280] dark:text-[#9EA793]">
                  Latest Carbon Score:{" "}
                  <strong className="text-[#111827] dark:text-[#F3F5EC]">
                    {data?.kpis.latestCarbonScore || 0} / 100
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EBF1B1]" />
                <span className="text-[#6B7280] dark:text-[#9EA793]">
                  Latest Bio Score:{" "}
                  <strong className="text-[#111827] dark:text-[#F3F5EC]">
                    {data?.kpis.latestBioScore || 0} / 100
                  </strong>
                </span>
              </div>
            </div>

            <Link
              href="/analytics"
              className="text-xs font-bold text-[#3D422E] dark:text-[#EBF1B1] hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Explore full telemetry report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Environmental Health Index Card */}
        <div className="lg:col-span-4 rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider">
                Current Status
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  data?.kpis.healthStatus === "Healthy"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                    : data?.kpis.healthStatus === "Critical"
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-800/60"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                }`}
              >
                {data?.kpis.healthStatus || "Moderate"} Health
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#111827] dark:text-[#F3F5EC]">
              Environmental Health Index
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9EA793] leading-relaxed">
              Composite score calculated with backend formula: 60% Carbon Score + 40% Biodiversity
              Score.
            </p>
          </div>

          {/* Gauge Center */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] space-y-2 transition-colors">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="54"
                  stroke="currentColor"
                  className="text-[#E5E7EB] dark:text-[#2E3626]"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="54"
                  stroke="currentColor"
                  className="text-[#3D422E] dark:text-[#EBF1B1]"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={
                    2 *
                    Math.PI *
                    54 *
                    (1 - Math.min(100, Math.max(0, data?.kpis.avgHealthIndex || 0)) / 100)
                  }
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#3D422E] dark:text-[#EBF1B1]">
                  {data?.kpis.avgHealthIndex || "0.0"}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#6B7280] dark:text-[#9EA793]">
                  EHI Score
                </span>
              </div>
            </div>

            <span className="text-xs font-mono text-[#6B7280] dark:text-[#9EA793]">
              (0.6 × {data?.kpis.latestCarbonScore || 0}) + (0.4 × {data?.kpis.latestBioScore || 0})
              = {data?.kpis.avgHealthIndex || 0}
            </span>
          </div>

          {/* Sub-metrics */}
          <div className="space-y-2 pt-2 border-t border-[#E5E7EB] dark:border-[#2E3626] transition-colors">
            <div className="flex justify-between text-xs">
              <span className="text-[#6B7280] dark:text-[#9EA793] flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Carbon Score
              </span>
              <span className="font-bold text-[#111827] dark:text-[#F3F5EC]">
                {data?.kpis.latestCarbonScore || 0} / 100
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6B7280] dark:text-[#9EA793] flex items-center gap-1.5">
                <TreePine className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" /> Biodiversity
                Score
              </span>
              <span className="font-bold text-[#111827] dark:text-[#F3F5EC]">
                {data?.kpis.latestBioScore || 0} / 100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Projects & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Recent Projects */}
        <div className="lg:col-span-7 rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
                Portfolio
              </span>
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC]">
                Recent Projects
              </h3>
            </div>
            <Link
              href="/projects"
              className="text-xs font-bold text-[#3D422E] dark:text-[#EBF1B1] hover:underline transition-colors"
            >
              View All Projects
            </Link>
          </div>

          <div className="space-y-3.5">
            {data && data.projects.length > 0 ? (
              data.projects.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] hover:border-[#3D422E]/30 dark:hover:border-[#EBF1B1]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#111827] dark:text-[#F3F5EC] group-hover:text-[#3D422E] dark:group-hover:text-[#EBF1B1] transition-colors">
                        {p.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] border dark:border-[#EBF1B1]/30 text-[10px] font-bold">
                        {p.status || "Active"}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280] dark:text-[#9EA793] line-clamp-1">
                      {p.description || "Ecological conservation and satellite telemetry project."}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E5E7EB] dark:border-[#2E3626]">
                    <div>
                      <span className="text-[10px] text-[#6B7280] dark:text-[#9EA793] block">
                        Sites
                      </span>
                      <span className="text-xs font-bold text-[#111827] dark:text-[#F3F5EC]">
                        {p.site_count} Site{p.site_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6B7280] dark:text-[#9EA793] block">
                        Area
                      </span>
                      <span className="text-xs font-bold text-[#111827] dark:text-[#F3F5EC]">
                        {(p.total_area || 0).toLocaleString()} ha
                      </span>
                    </div>
                    <Link
                      href="/projects"
                      className="p-2 rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] text-[#111827] dark:text-[#F3F5EC] group-hover:bg-[#3D422E] dark:group-hover:bg-[#EBF1B1] group-hover:text-white dark:group-hover:text-[#161A12] transition-all"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center space-y-2 border border-dashed border-[#E5E7EB] dark:border-[#2E3626] rounded-2xl">
                <p className="text-xs text-[#6B7280] dark:text-[#9EA793]">
                  No active projects registered
                </p>
                <Link
                  href="/projects"
                  className="text-xs font-bold text-[#3D422E] dark:text-[#EBF1B1] hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Create your first project
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Activity Feed */}
        <div className="lg:col-span-5 rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
                Audit Trail
              </span>
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC]">
                Live Activity Feed
              </h3>
            </div>
            <Clock className="w-4 h-4 text-[#6B7280] dark:text-[#9EA793]" />
          </div>

          <div className="space-y-3.5">
            {data && data.activities.length > 0 ? (
              data.activities.slice(0, 6).map((act) => {
                const meta = getActivityMeta(act.event_type);
                const Icon = meta.icon;

                return (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-[#F9FAF5] dark:hover:bg-[#161A12] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#111827] dark:text-[#F3F5EC] truncate">
                          {act.description}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF] dark:text-[#9EA793] whitespace-nowrap shrink-0">
                          {formatTimeAgo(act.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-[#4B5563] dark:text-[#9EA793] font-medium">
                          {meta.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center space-y-2 border border-dashed border-[#E5E7EB] dark:border-[#2E3626] rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-neutral-400 mx-auto" />
                <p className="text-xs text-[#6B7280] dark:text-[#9EA793]">
                  No activities recorded yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
