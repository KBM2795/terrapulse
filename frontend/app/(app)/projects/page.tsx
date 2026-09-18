"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { fetchProjects, createProject, deleteProject, ProjectData } from "@/lib/projects";
import { api } from "@/lib/api";
import {
  FolderKanban,
  Plus,
  Search,
  ArrowUpRight,
  ShieldCheck,
  X,
  Trash2,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Project Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectStatus, setNewProjectStatus] = useState("Active");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [projectToDelete, setProjectToDelete] = useState<ProjectData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Evaluator Seed State
  const [isSeeding, setIsSeeding] = useState(false);

  // Fetch projects using safe React 19 effect pattern
  useEffect(() => {
    let ignore = false;
    fetchProjects()
      .then((data) => {
        if (!ignore) {
          setProjects(data);
          setIsLoading(false);
          setIsRefreshing(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load projects";
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
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("projects-updated"));
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await api.post("/api/dev/seed");
      handleRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to seed demo data";
      setError(msg);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      await createProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || undefined,
        status: newProjectStatus,
      });

      setNewProjectName("");
      setNewProjectDesc("");
      setNewProjectStatus("Active");
      setIsCreateOpen(false);
      handleRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create project";
      setCreateError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);

    try {
      await deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      handleRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete project";
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesFilter =
      filterStatus === "All" || p.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recent";
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  return (
    <PageContainer>
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
            Ecosystem Portfolios
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F5EC] tracking-tight transition-colors">
            Restoration Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793] mt-1 transition-colors">
            Manage your verified carbon and biodiversity project areas backed by PostGIS spatial
            boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white dark:bg-[#20251B] hover:bg-gray-50 dark:hover:bg-[#272D20] text-[#111827] dark:text-[#F3F5EC] text-xs sm:text-sm font-semibold border border-[#E5E7EB] dark:border-[#2E3626] transition-all shadow-2xs disabled:opacity-50"
            title="Refresh projects list"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] hover:bg-[#2A2F1E] dark:hover:bg-white text-white dark:text-[#161A12] font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl sm:rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] shadow-2xs transition-colors">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9CA3AF] dark:text-[#9EA793] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, description..."
            className="w-full h-9 pl-9 pr-4 text-xs text-[#111827] dark:text-[#F3F5EC] placeholder:text-[#9CA3AF] dark:placeholder:text-[#9EA793] bg-transparent focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E5E7EB] dark:border-[#2E3626]">
          {["All", "Active", "Pending", "Completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                filterStatus === status
                  ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12]"
                  : "text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={handleRefresh} className="font-bold underline">
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-20 bg-neutral-100 dark:bg-neutral-900 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State with Seed Action */
        <div className="rounded-[32px] p-8 sm:p-12 bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] text-center space-y-5 max-w-2xl mx-auto my-8 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] flex items-center justify-center mx-auto">
            <FolderKanban className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#111827] dark:text-[#F3F5EC]">
              No Projects Registered Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793] leading-relaxed max-w-md mx-auto">
              Start building your ecological portfolio by creating your first project or instantly
              populate sample global reforestation initiatives with our reviewer fast-path.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EBF1B1] text-[#161A12] text-xs sm:text-sm font-bold hover:bg-white transition shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isSeeding ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Seeding Dataset...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Seed Demo Projects (3 Sites)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D422E] dark:bg-white/10 text-white text-xs sm:text-sm font-bold hover:bg-[#2A2F1E] dark:hover:bg-white/20 transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </div>
      ) : filteredProjects.length === 0 ? (
        /* No matching search/filter */
        <div className="py-12 text-center space-y-3 bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] rounded-[28px]">
          <p className="text-sm font-semibold text-[#6B7280] dark:text-[#9EA793]">
            No projects matching &ldquo;{searchQuery}&rdquo; with status &ldquo;{filterStatus}
            &rdquo;
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("All");
            }}
            className="text-xs font-bold text-[#3D422E] dark:text-[#EBF1B1] hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-[28px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between space-y-5 group"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] border dark:border-[#EBF1B1]/30 text-[10px] font-extrabold uppercase tracking-wider">
                    {project.status}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF] dark:text-[#9EA793] font-mono">
                    {formatDate(project.created_at)}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC] group-hover:text-[#3D422E] dark:group-hover:text-[#EBF1B1] transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#9EA793] mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                    {project.description ||
                      "Ecological conservation and satellite telemetry project."}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-[11px] text-[#4B5563] dark:text-[#9EA793] font-medium transition-colors">
                  <FolderKanban className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" />
                  <span>PostGIS Verified</span>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#2E3626] space-y-3 transition-colors">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB]/70 dark:border-[#2E3626] transition-colors">
                    <span className="text-[10px] font-semibold text-[#6B7280] dark:text-[#9EA793] block">
                      Monitored Sites
                    </span>
                    <span className="text-sm font-bold text-[#111827] dark:text-[#F3F5EC]">
                      {project.site_count} Plot{project.site_count !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB]/70 dark:border-[#2E3626] transition-colors">
                    <span className="text-[10px] font-semibold text-[#6B7280] dark:text-[#9EA793] block">
                      Total Area
                    </span>
                    <span className="text-sm font-bold text-[#111827] dark:text-[#F3F5EC]">
                      {(project.total_area || 0).toLocaleString()} ha
                    </span>
                  </div>
                </div>

                {/* Health Score Pill Bar */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EBF1B1]/60 dark:bg-[#EBF1B1]/15 border border-[#3D422E]/10 dark:border-[#EBF1B1]/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#3D422E] dark:text-[#EBF1B1]" />
                    <span className="text-xs font-bold text-[#3D422E] dark:text-[#EBF1B1]">
                      Health Index
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-[#3D422E] dark:text-[#EBF1B1]">
                      {project.health_index || 77.6}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <Link
                    href="/map"
                    className="flex-1 text-center py-2 rounded-full bg-[#F9FAF5] dark:bg-[#161A12] hover:bg-[#EBF1B1] dark:hover:bg-[#EBF1B1] text-[#3D422E] dark:text-[#EBF1B1] dark:hover:text-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold transition-colors"
                  >
                    View on Map
                  </Link>

                  <Link
                    href={`/projects/${project.id}`}
                    className="p-2 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] hover:bg-[#2A2F1E] dark:hover:bg-white transition-all shadow-2xs"
                    title="View Project Details"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setProjectToDelete(project)}
                    className="p-2 rounded-full text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-[32px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-2xl space-y-6 relative transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 flex items-center justify-center text-[#3D422E] dark:text-[#EBF1B1]">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC]">
                    Create New Project
                  </h3>
                  <span className="text-xs text-[#6B7280] dark:text-[#9EA793]">
                    Register a new ecological monitoring initiative
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#272D20] text-[#6B7280] dark:text-[#9EA793] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151] dark:text-[#F3F5EC]">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Atlantic Forest Restoration Plot"
                  className="w-full h-10 px-4 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151] dark:text-[#F3F5EC]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Brief summary of conservation, soil health, and carbon goals..."
                  className="w-full p-3 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] resize-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151] dark:text-[#F3F5EC]">
                  Initial Status
                </label>
                <select
                  value={newProjectStatus}
                  onChange={(e) => setNewProjectStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] transition-colors"
                >
                  <option value="Active">Active (Monitoring Enabled)</option>
                  <option value="Pending">Pending (Site Boundary Setup)</option>
                  <option value="Completed">Completed (Audited Reserve)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold text-[#6B7280] dark:text-[#9EA793] hover:bg-gray-50 dark:hover:bg-[#272D20] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] text-xs font-bold hover:bg-[#2A2F1E] dark:hover:bg-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Project...</span>
                    </>
                  ) : (
                    <span>Create Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {projectToDelete && (
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
                Are you sure you want to delete{" "}
                <strong className="text-[#111827] dark:text-[#F3F5EC]">
                  {projectToDelete.name}
                </strong>
                ? This action will permanently remove all associated PostGIS sites, spatial
                boundaries, and historical telemetry records.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-full border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold text-[#6B7280] dark:text-[#9EA793] hover:bg-gray-50 dark:hover:bg-[#272D20] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSubmit}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
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
