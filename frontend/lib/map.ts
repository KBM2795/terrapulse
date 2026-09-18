import * as turf from "@turf/turf";
import { api } from "./api";
import { ApiResponse } from "./auth";
import { SiteItem, AnalyticsHistoryPoint } from "./dashboard";
import { ProjectData } from "./projects";

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface MapSite extends SiteItem {
  project_name?: string;
  centroid?: [number, number]; // [lng, lat]
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  perimeter_km?: number;
  coordinates_text?: string;
  carbon_score?: number;
  bio_score?: number;
  health_index?: number;
  health_status?: "Healthy" | "Moderate" | "Critical";
  soil_health?: number;
  tree_coverage?: number;
}

export interface MapData {
  sites: MapSite[];
  projects: ProjectData[];
}

export interface CreateSitePayload {
  project_id: string;
  name: string;
  geometry: GeoJSONPolygon;
}

/**
 * Compute geodesic area in hectares from GeoJSON polygon
 */
export function calculateTurfAreaHectares(geometry: GeoJSONPolygon): number {
  try {
    const polygon = turf.polygon(geometry.coordinates);
    const sqMeters = turf.area(polygon);
    return Number((sqMeters / 10000).toFixed(2));
  } catch {
    return 0;
  }
}

/**
 * Compute geodesic perimeter in kilometers from GeoJSON polygon
 */
export function calculateTurfPerimeterKm(geometry: GeoJSONPolygon): number {
  try {
    if (!geometry || !geometry.coordinates || !geometry.coordinates[0]) return 0;
    const line = turf.lineString(geometry.coordinates[0]);
    const km = turf.length(line, { units: "kilometers" });
    return Number(km.toFixed(2));
  } catch {
    return 0;
  }
}

/**
 * Compute bounding box [minLng, minLat, maxLng, maxLat] for map.fitBounds
 */
export function calculateTurfBBox(
  geometry: GeoJSONPolygon
): [number, number, number, number] | null {
  try {
    if (
      !geometry ||
      !geometry.coordinates ||
      !Array.isArray(geometry.coordinates) ||
      geometry.coordinates.length === 0
    ) {
      return null;
    }
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    for (const ring of geometry.coordinates) {
      if (!Array.isArray(ring)) continue;
      for (const pt of ring) {
        if (!Array.isArray(pt) || pt.length < 2) continue;
        const lng = Number(pt[0]);
        const lat = Number(pt[1]);
        if (isNaN(lng) || isNaN(lat)) continue;
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }
    }

    if (!isFinite(minLng) || !isFinite(minLat) || !isFinite(maxLng) || !isFinite(maxLat)) {
      return null;
    }

    return [minLng, minLat, maxLng, maxLat];
  } catch {
    return null;
  }
}

/**
 * Compute combined bounding box for multiple sites
 */
export function calculateSitesBBox(sites: MapSite[]): [number, number, number, number] | null {
  const validBboxes = sites.map((s) => s.bbox).filter(Boolean) as [
    number,
    number,
    number,
    number,
  ][];
  if (validBboxes.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const b of validBboxes) {
    if (b[0] < minLng) minLng = b[0];
    if (b[1] < minLat) minLat = b[1];
    if (b[2] > maxLng) maxLng = b[2];
    if (b[3] > maxLat) maxLat = b[3];
  }

  if (!isFinite(minLng) || !isFinite(minLat) || !isFinite(maxLng) || !isFinite(maxLat)) {
    return null;
  }

  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Compute centroid coordinates [lng, lat]
 */
export function calculateTurfCentroid(geometry: GeoJSONPolygon): [number, number] | null {
  try {
    if (
      !geometry ||
      !geometry.coordinates ||
      !Array.isArray(geometry.coordinates) ||
      geometry.coordinates.length === 0
    ) {
      return null;
    }
    const ring = geometry.coordinates[0];
    if (!Array.isArray(ring) || ring.length === 0) return null;

    let sumLng = 0;
    let sumLat = 0;
    let count = 0;

    for (const pt of ring) {
      if (!Array.isArray(pt) || pt.length < 2) continue;
      const lng = Number(pt[0]);
      const lat = Number(pt[1]);
      if (!isNaN(lng) && !isNaN(lat)) {
        sumLng += lng;
        sumLat += lat;
        count++;
      }
    }

    if (count === 0) return null;
    return [Number((sumLng / count).toFixed(5)), Number((sumLat / count).toFixed(5))];
  } catch {
    return null;
  }
}

/**
 * Format coordinates to human-readable GPS string
 */
export function formatGPSCoordinates(coords: [number, number]): string {
  const [lng, lat] = coords;
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Fetch all sites and projects for the GIS map viewport
 */
export async function fetchMapData(): Promise<MapData> {
  const [sitesRes, projectsRes] = await Promise.all([
    api
      .get<ApiResponse<SiteItem[]>>("/api/sites")
      .catch(() => ({ data: { data: [] as SiteItem[] } })),
    api
      .get<ApiResponse<ProjectData[]>>("/api/projects")
      .catch(() => ({ data: { data: [] as ProjectData[] } })),
  ]);

  const rawSites = sitesRes.data?.data || [];
  const projects = projectsRes.data?.data || [];

  const projectMap = new Map<string, string>();
  projects.forEach((p) => projectMap.set(p.id, p.name));

  // Enrich sites with project name, centroid, bbox, and latest telemetry
  const enrichedSites: MapSite[] = await Promise.all(
    rawSites.map(async (site) => {
      let centroid: [number, number] | undefined;
      let bbox: [number, number, number, number] | undefined;
      let perimeterKm = 0;
      let coordsText = "Coordinates Pending";

      let geom = site.geometry;
      if (typeof geom === "string") {
        try {
          geom = JSON.parse(geom);
          site.geometry = geom;
        } catch {
          // ignore
        }
      }

      if (geom && geom.coordinates) {
        const polyGeo: GeoJSONPolygon = {
          type: "Polygon",
          coordinates: geom.coordinates,
        };
        const c = calculateTurfCentroid(polyGeo);
        if (c) {
          centroid = c;
          coordsText = formatGPSCoordinates(c);
        }
        const b = calculateTurfBBox(polyGeo);
        if (b) {
          bbox = b;
        }
        perimeterKm = calculateTurfPerimeterKm(polyGeo);
      }

      // Default baseline telemetry
      let carbon = 82;
      let bio = 74;
      let ehi = 78.8;
      let soil = 80;
      let tree = 70;
      let status: "Healthy" | "Moderate" | "Critical" = "Moderate";

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
          soil = Math.round(latest.soil_health);
          tree = Math.round(latest.tree_coverage);
          status =
            latest.health_status || (ehi >= 80 ? "Healthy" : ehi >= 65 ? "Moderate" : "Critical");
        }
      } catch {
        // keep defaults
      }

      return {
        ...site,
        project_name: projectMap.get(site.project_id) || "Ecological Initiative",
        centroid,
        bbox,
        perimeter_km: perimeterKm,
        coordinates_text: coordsText,
        carbon_score: carbon,
        bio_score: bio,
        health_index: ehi,
        health_status: status,
        soil_health: soil,
        tree_coverage: tree,
      };
    })
  );

  return {
    sites: enrichedSites,
    projects,
  };
}

/**
 * Create a new site in the backend with polygon geometry
 */
export async function createSite(payload: CreateSitePayload): Promise<SiteItem> {
  const res = await api.post<ApiResponse<SiteItem>>("/api/sites", payload);
  return res.data.data;
}

/**
 * Delete a site from the backend
 */
export async function deleteSite(siteId: string): Promise<void> {
  await api.delete(`/api/sites/${siteId}`);
}

/**
 * Build GeoJSON FeatureCollection from MapSites for Mapbox GL sources
 */
export function buildSitesFeatureCollection(sites: MapSite[]) {
  return {
    type: "FeatureCollection" as const,
    features: sites
      .map((s) => {
        let geom = s.geometry;
        if (typeof geom === "string") {
          try {
            geom = JSON.parse(geom);
          } catch {
            return null;
          }
        }
        if (
          !geom ||
          !geom.coordinates ||
          !Array.isArray(geom.coordinates) ||
          geom.coordinates.length === 0
        ) {
          return null;
        }
        return {
          type: "Feature" as const,
          id: s.id,
          geometry: {
            type: "Polygon" as const,
            coordinates: geom.coordinates,
          },
          properties: {
            id: s.id,
            name: s.name,
            project_id: s.project_id,
            project_name: s.project_name || "Initiative",
            area: s.area || 0,
            carbon_score: s.carbon_score || 80,
            bio_score: s.bio_score || 75,
            health_index: s.health_index || 78,
            health_status: s.health_status || "Moderate",
          },
        };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null),
  };
}
