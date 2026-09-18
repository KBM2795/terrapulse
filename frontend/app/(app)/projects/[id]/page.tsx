"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { fetchProjectDetails, deleteProject, ProjectDetailData } from "@/lib/projects";
import { formatTimeAgo } from "@/lib/dashboard";
import {
  ArrowLeft,
  MapPin,
  Plus,
  ArrowUpRight,
  Compass,
  ShieldCheck,
  Leaf,
  TreePine,
  Layers,
  Trash2,
  RefreshCw,
  AlertCircle,
  Calendar,
  Clock,
  Activity,
  FolderKanban,
  CheckCircle2,
} from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    let ignore = false;
    fetchProjectDetails(projectId)
      .then((data) => {
        if (!ignore) {
          if (!data) {
            setError("Project not found or you do not have permission to view it.");
          } else {
            setProject(data);
          }
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load project details";
          setError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [projectId, refreshIndex]);

  const handleDelete = async () => {
    if (!project) return;
    setIsDeleting(true);

    try {
      await deleteProject(project.id);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("projects-updated"));
      }
      router.push("/projects");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete project";
      setError(msg);
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recent";
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  const getActivityMeta = (eventType: string) => {
    switch (eventType) {
      case "PROJECT_CREATED":
        return {
          icon: FolderKanban,
          badge: "Project Created",
        };
      case "SITE_ADDED":
        return {
          icon: MapPin,
          badge: "Site Registered",
        };
      case "ANALYTICS_GENERATED":
        return {
          icon: ShieldCheck,
          badge: "Health Computed",
        };
      default:
        return {
          icon: Activity,
          badge: "Audit Event",
        };
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <PageContainer>
        <div className="h-6 w-36 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="rounded-[32px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-8 space-y-6 animate-pulse">
          <div className="h-8 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="h-24 bg-neutral-100 dark:bg-neutral-900 rounded-2xl" />
            <div className="h-24 bg-neutral-100 dark:bg-neutral-900 rounded-2xl" />
            <div className="h-24 bg-neutral-100 dark:bg-neutral-900 rounded-2xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  // Not Found / Error State
  if (error || !project) {
    return (
      <PageContainer>
        <div className="rounded-[32px] p-8 sm:p-12 bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] text-center space-y-5 max-w-xl mx-auto my-12 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#111827] dark:text-[#F3F5EC]">
              Project Not Found
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793] leading-relaxed">
              {error || "The requested ecological project could not be located in your account."}
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B7280] dark:text-[#9EA793] hover:text-[#3D422E] dark:hover:text-[#EBF1B1] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        <button
          onClick={() => setRefreshIndex((prev) => prev + 1)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#272D20] text-[#6B7280] dark:text-[#9EA793] transition"
          title="Refresh project details"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Project Info Card */}
      <div className="rounded-[32px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-10 shadow-sm space-y-6 transition-colors relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] border dark:border-[#EBF1B1]/30 text-xs font-bold uppercase tracking-wider">
                {project.status || "Active"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#6B7280] dark:text-[#9EA793] font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>Created {formatDate(project.created_at)}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F5EC] tracking-tight transition-colors">
              {project.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/map?project=${project.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] text-xs sm:text-sm font-bold hover:bg-[#2A2F1E] dark:hover:bg-white shadow-sm active:scale-95 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Map All Sites</span>
            </Link>

            <button
              onClick={() => setIsDeleteOpen(true)}
              className="p-2.5 rounded-full text-[#9CA3AF] hover:text-red-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-[#E5E7EB] dark:border-[#2E3626] transition-colors cursor-pointer"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793] leading-relaxed max-w-3xl">
          {project.description ||
            "Ecological conservation, native species protection, and continuous carbon flux auditing initiative."}
        </p>

        {/* 2 & 3. Site Count & Total Area KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Site Count */}
          <div className="p-4 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] space-y-1">
            <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9EA793]">
              <span className="font-semibold">Site Count</span>
              <MapPin className="w-4 h-4 text-[#3D422E] dark:text-[#EBF1B1]" />
            </div>
            <span className="text-2xl font-black text-[#111827] dark:text-[#F3F5EC]">
              {project.site_count} Plot{project.site_count !== 1 ? "s" : ""}
            </span>
            <span className="text-[11px] text-[#6B7280] dark:text-[#9EA793] block">
              PostGIS polygon boundaries
            </span>
          </div>

          {/* Total Area */}
          <div className="p-4 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] space-y-1">
            <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9EA793]">
              <span className="font-semibold">Total Area</span>
              <Layers className="w-4 h-4 text-[#3D422E] dark:text-[#EBF1B1]" />
            </div>
            <span className="text-2xl font-black text-[#111827] dark:text-[#F3F5EC]">
              {(project.total_area || 0).toLocaleString()} ha
            </span>
            <span className="text-[11px] text-[#6B7280] dark:text-[#9EA793] block">
              {Math.round((project.total_area || 0) * 2.471).toLocaleString()} Acres
            </span>
          </div>

          {/* Ecosystem Health */}
          <div className="p-4 rounded-2xl bg-[#EBF1B1]/60 dark:bg-[#272E20] border border-[#3D422E]/15 dark:border-[#EBF1B1]/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#3D422E] dark:text-[#EBF1B1]">
              <span className="font-bold">Ecosystem Health</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#3D422E] dark:text-[#EBF1B1]">
                {project.health_index || 77.6}
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {project.health_status || "Moderate"}
              </span>
            </div>
            <span className="text-[11px] text-[#52593F] dark:text-[#A8B29C] block font-mono">
              (0.6 × {project.carbon_score}) + (0.4 × {project.bio_score})
            </span>
          </div>
        </div>
      </div>

      {/* 4. Sites Table / List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC]">
              Monitored Geospatial Sites
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9EA793]">
              Sites Table with PostGIS boundaries, coordinates, and telemetry
            </p>
          </div>

          <Link
            href={`/map?project=${project.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] hover:bg-[#EBF1B1] dark:hover:bg-[#EBF1B1] text-[#3D422E] dark:text-[#EBF1B1] dark:hover:text-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Draw New Site</span>
          </Link>
        </div>

        {project.sites.length === 0 ? (
          <div className="p-8 rounded-[28px] bg-white dark:bg-[#20251B] border border-dashed border-[#E5E7EB] dark:border-[#2E3626] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EBF1B1]/40 dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#111827] dark:text-[#F3F5EC]">
                No Sites Associated With This Project
              </h4>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA793] max-w-sm mx-auto">
                Open the GIS Map to draw boundary polygons and bind them to this project.
              </p>
            </div>
            <Link
              href={`/map?project=${project.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] text-xs font-bold hover:bg-[#2A2F1E] dark:hover:bg-white shadow-sm transition"
            >
              <Compass className="w-4 h-4" />
              <span>Open GIS Map</span>
            </Link>
          </div>
        ) : (
          <div className="rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] overflow-hidden shadow-sm transition-colors">
            {/* Desktop Sites Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9FAF5] dark:bg-[#161A12] text-[#6B7280] dark:text-[#9EA793] uppercase font-bold text-[10px] tracking-wider border-b border-[#E5E7EB] dark:border-[#2E3626]">
                  <tr>
                    <th className="py-3.5 px-6">Site Name & Coordinates</th>
                    <th className="py-3.5 px-4">PostGIS Area</th>
                    <th className="py-3.5 px-4">Carbon Flux</th>
                    <th className="py-3.5 px-4">Biodiversity</th>
                    <th className="py-3.5 px-4">Health Index</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2E3626]">
                  {project.sites.map((site) => (
                    <tr
                      key={site.id}
                      className="hover:bg-[#F9FAF5] dark:hover:bg-[#161A12] transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <Link
                          href={`/map?project=${project.id}&site=${site.id}`}
                          className="space-y-0.5 block"
                        >
                          <span className="font-bold text-sm text-[#111827] dark:text-[#F3F5EC] block group-hover:text-[#3D422E] dark:group-hover:text-[#EBF1B1] transition-colors">
                            {site.name}
                          </span>
                          <span className="font-mono text-[11px] text-[#6B7280] dark:text-[#9EA793] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#3D422E] dark:text-[#EBF1B1]" />
                            {site.coordinates_text || "Geospatial Boundary"}
                          </span>
                        </Link>
                      </td>

                      <td className="py-4 px-4 font-bold text-sm text-[#111827] dark:text-[#F3F5EC]">
                        {Math.round(site.area || 0).toLocaleString()} ha
                        <span className="text-[10px] text-[#6B7280] dark:text-[#9EA793] block font-normal">
                          {Math.round((site.area || 0) * 2.471).toLocaleString()} Acres
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-[#111827] dark:text-[#F3F5EC]">
                          <Leaf className="w-3 h-3 text-emerald-500" />
                          {site.carbon_score || 82} / 100
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-[#111827] dark:text-[#F3F5EC]">
                          <TreePine className="w-3 h-3 text-[#3D422E] dark:text-[#EBF1B1]" />
                          {site.bio_score || 74} / 100
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#EBF1B1]/60 dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] font-extrabold text-xs">
                          {site.health_index || 78.8} EHI
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/map?project=${project.id}&site=${site.id}`}
                            className="p-2 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-[#3D422E] dark:text-[#EBF1B1] hover:bg-[#3D422E] dark:hover:bg-[#EBF1B1] hover:text-white dark:hover:text-[#161A12] transition"
                            title={`Focus ${site.name} on Map`}
                          >
                            <Compass className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/analytics?site=${site.id}`}
                            className="p-2 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-[#3D422E] dark:text-[#EBF1B1] hover:bg-[#3D422E] dark:hover:bg-[#EBF1B1] hover:text-white dark:hover:text-[#161A12] transition"
                            title={`Inspect ${site.name} Telemetry`}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 5. Activity Timeline Section */}
      <div className="rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-sm space-y-5 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
              Audit Trail
            </span>
            <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC]">
              Project Activity Timeline
            </h3>
          </div>
          <Clock className="w-4 h-4 text-[#6B7280] dark:text-[#9EA793]" />
        </div>

        <div className="space-y-3.5">
          {project.activities && project.activities.length > 0 ? (
            project.activities.map((act) => {
              const meta = getActivityMeta(act.event_type);
              const Icon = meta.icon;

              return (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB]/60 dark:border-[#2E3626] transition-colors"
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] text-[#4B5563] dark:text-[#9EA793] font-medium">
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
                No recent activity logged for this project yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-[32px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-2xl space-y-5 transition-colors">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC]">
                Delete Project?
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA793] leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <strong className="text-[#111827] dark:text-[#F3F5EC]">{project.name}</strong>? All
                associated PostGIS sites ({project.site_count} plots) and historical analytics
                records will be removed.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-full border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold text-[#6B7280] dark:text-[#9EA793] hover:bg-gray-50 dark:hover:bg-[#272D20] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Project</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
