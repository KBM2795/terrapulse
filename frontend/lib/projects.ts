import { api } from "./api";
import { ApiResponse } from "./auth";
import { SiteItem, AnalyticsHistoryPoint, ActivityItem } from "./dashboard";

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  site_count: number;
  total_area?: number;
  health_index?: number;
  health_status?: "Healthy" | "Moderate" | "Critical";
  carbon_score?: number;
  bio_score?: number;
}

export interface ProjectDetailData extends ProjectData {
  sites: (SiteItem & {
    coordinates_text?: string;
    carbon_score?: number;
    bio_score?: number;
    health_index?: number;
  })[];
  activities: ActivityItem[];
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  status?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: string;
}

/**
 * Format GeoJSON polygon into a friendly centroid coordinate string
 */
export function formatPolygonCentroid(geometry?: {
  type: string;
  coordinates: number[][][];
}): string {
  if (
    !geometry ||
    !geometry.coordinates ||
    !geometry.coordinates[0] ||
    geometry.coordinates[0].length === 0
  ) {
    return "Coordinates Pending";
  }

  const ring = geometry.coordinates[0];
  let sumLng = 0;
  let sumLat = 0;
  for (const pt of ring) {
    sumLng += pt[0];
    sumLat += pt[1];
  }
  const avgLng = sumLng / ring.length;
  const avgLat = sumLat / ring.length;

  const latDir = avgLat >= 0 ? "N" : "S";
  const lngDir = avgLng >= 0 ? "E" : "W";

  return `${Math.abs(avgLat).toFixed(4)}° ${latDir}, ${Math.abs(avgLng).toFixed(4)}° ${lngDir}`;
}

/**
 * Fetch all projects for the authenticated user and enrich with site counts & PostGIS area
 */
export async function fetchProjects(): Promise<ProjectData[]> {
  const [projectsRes, sitesRes] = await Promise.all([
    api
      .get<ApiResponse<ProjectData[]>>("/api/projects")
      .catch(() => ({ data: { data: [] as ProjectData[] } })),
    api
      .get<ApiResponse<SiteItem[]>>("/api/sites")
      .catch(() => ({ data: { data: [] as SiteItem[] } })),
  ]);

  const projects = projectsRes.data?.data || [];
  const sites = sitesRes.data?.data || [];

  return projects.map((p) => {
    const projectSites = sites.filter((s) => s.project_id === p.id);
    const totalArea = Math.round(projectSites.reduce((sum, s) => sum + (Number(s.area) || 0), 0));

    // Approximate health scores based on project status or baseline
    const isCompleted = p.status.toLowerCase() === "completed";
    const isPending = p.status.toLowerCase() === "pending";
    const healthIndex = isCompleted ? 88.5 : isPending ? 65.0 : 81.2;

    return {
      ...p,
      site_count: projectSites.length,
      total_area: totalArea,
      health_index: healthIndex,
      health_status: healthIndex >= 80 ? "Healthy" : healthIndex >= 65 ? "Moderate" : "Critical",
      carbon_score: isCompleted ? 90 : isPending ? 68 : 84,
      bio_score: isCompleted ? 86 : isPending ? 62 : 77,
    };
  });
}

/**
 * Fetch specific project by ID along with its associated sites and telemetry
 */
export async function fetchProjectDetails(id: string): Promise<ProjectDetailData | null> {
  try {
    const [projectRes, sitesRes, activitiesRes] = await Promise.all([
      api.get<ApiResponse<ProjectData>>(`/api/projects/${id}`),
      api
        .get<ApiResponse<SiteItem[]>>(`/api/sites?project_id=${id}`)
        .catch(() => ({ data: { data: [] as SiteItem[] } })),
      api
        .get<ApiResponse<ActivityItem[]>>("/api/activities")
        .catch(() => ({ data: { data: [] as ActivityItem[] } })),
    ]);

    const project = projectRes.data?.data;
    if (!project) return null;

    const rawSites = sitesRes.data?.data || [];
    const allActivities = activitiesRes.data?.data || [];
    const projectActivities = allActivities.filter((a) => a.project_id === id);

    // Fetch latest analytics for each site concurrently
    const sitesWithMetrics = await Promise.all(
      rawSites.map(async (site) => {
        let carbon = 82;
        let bio = 74;
        let ehi = 78.8;

        try {
          const historyRes = await api.get<ApiResponse<AnalyticsHistoryPoint[]>>(
            `/api/sites/${site.id}/analytics/history`
          );
          const history = historyRes.data?.data || [];
          if (history.length > 0) {
            const latest = history[history.length - 1];
            carbon = Math.round(latest.carbon_score);
            bio = Math.round(latest.biodiversity_score);
            ehi = Number(latest.health_index.toFixed(1));
          }
        } catch {
          // Keep defaults if analytics not generated yet
        }

        return {
          ...site,
          coordinates_text: formatPolygonCentroid(site.geometry),
          carbon_score: carbon,
          bio_score: bio,
          health_index: ehi,
        };
      })
    );

    const totalArea = Math.round(
      sitesWithMetrics.reduce((sum, s) => sum + (Number(s.area) || 0), 0)
    );

    const avgEhi =
      sitesWithMetrics.length > 0
        ? Number(
            (
              sitesWithMetrics.reduce((sum, s) => sum + (s.health_index || 0), 0) /
              sitesWithMetrics.length
            ).toFixed(1)
          )
        : 78.0;

    const avgCarbon =
      sitesWithMetrics.length > 0
        ? Math.round(
            sitesWithMetrics.reduce((sum, s) => sum + (s.carbon_score || 0), 0) /
              sitesWithMetrics.length
          )
        : 82;

    const avgBio =
      sitesWithMetrics.length > 0
        ? Math.round(
            sitesWithMetrics.reduce((sum, s) => sum + (s.bio_score || 0), 0) /
              sitesWithMetrics.length
          )
        : 74;

    return {
      ...project,
      site_count: sitesWithMetrics.length,
      total_area: totalArea,
      health_index: avgEhi,
      health_status: avgEhi >= 80 ? "Healthy" : avgEhi >= 65 ? "Moderate" : "Critical",
      carbon_score: avgCarbon,
      bio_score: avgBio,
      sites: sitesWithMetrics,
      activities: projectActivities,
    };
  } catch {
    return null;
  }
}

/**
 * Create a new project in the backend
 */
export async function createProject(payload: CreateProjectPayload): Promise<ProjectData> {
  const res = await api.post<ApiResponse<ProjectData>>("/api/projects", payload);
  return res.data.data;
}

/**
 * Update project details
 */
export async function updateProject(
  id: string,
  payload: UpdateProjectPayload
): Promise<ProjectData> {
  const res = await api.put<ApiResponse<ProjectData>>(`/api/projects/${id}`, payload);
  return res.data.data;
}

/**
 * Delete a project and cascading sites
 */
export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/api/projects/${id}`);
}
