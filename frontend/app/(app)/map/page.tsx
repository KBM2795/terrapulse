"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  fetchMapData,
  createSite,
  deleteSite,
  calculateTurfAreaHectares,
  calculateSitesBBox,
  buildSitesFeatureCollection,
  MapSite,
  GeoJSONPolygon,
} from "@/lib/map";
import { ProjectData } from "@/lib/projects";
import { PageContainer } from "@/components/layout/page-container";
import {
  MapPin,
  Pencil,
  Trash2,
  X,
  Compass,
  ArrowUpRight,
  Leaf,
  TreePine,
  Layers,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Plus,
  Crosshair,
  Key,
} from "lucide-react";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

// Open-source fallback style matching light-v11 Apple aesthetic when token is not configured
const OPEN_LIGHT_STYLE = {
  version: 8,
  sources: {
    "carto-light": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    },
  },
  layers: [
    {
      id: "carto-light-tiles",
      type: "raster",
      source: "carto-light",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

const OPEN_SATELLITE_STYLE = {
  version: 8,
  sources: {
    "esri-sat": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "&copy; Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [
    {
      id: "esri-sat-tiles",
      type: "raster",
      source: "esri-sat",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

function MapViewport() {
  const searchParams = useSearchParams();
  const targetProjectId = searchParams.get("project");
  const targetSiteId = searchParams.get("site");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drawRef = useRef<any>(null);

  const [sites, setSites] = useState<MapSite[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [filterProjectId, setFilterProjectId] = useState<string | null>(null);
  const selectedProjectId = filterProjectId ?? (targetProjectId || "all");
  const [selectedSite, setSelectedSite] = useState<MapSite | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<"light" | "satellite">("light");
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Polygon Drawing & Area State
  const [drawnFeature, setDrawnFeature] = useState<GeoJSONPolygon | null>(null);
  const [drawnHectares, setDrawnHectares] = useState<number>(0);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteProjectId, setNewSiteProjectId] = useState(targetProjectId || "");
  const [isSavingSite, setIsSavingSite] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Deletion state
  const [siteToDelete, setSiteToDelete] = useState<MapSite | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mapbox Access Token state initialized lazily
  const [customToken, setCustomToken] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("terrapulse_mapbox_token") ||
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
        ""
      );
    }
    return "";
  });
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Focus map camera according to targeted site, project, or collective portfolio
  const focusCamera = useCallback(
    (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapInstance: any,
      sitesList: MapSite[],
      projId?: string | null,
      siteId?: string | null
    ) => {
      if (!mapInstance || sitesList.length === 0) return;

      // 1. If an explicit site ID is targeted
      if (siteId) {
        const foundSite = sitesList.find((s) => s.id === siteId);
        if (foundSite) {
          setSelectedSite(foundSite);
          setIsDrawerOpen(true);

          if (foundSite.bbox) {
            const isWide = typeof window !== "undefined" && window.innerWidth >= 1024;
            mapInstance.fitBounds(
              [
                [foundSite.bbox[0], foundSite.bbox[1]],
                [foundSite.bbox[2], foundSite.bbox[3]],
              ],
              {
                padding: { top: 60, bottom: 60, left: 60, right: isWide ? 400 : 60 },
                duration: 1800,
                maxZoom: 16,
              }
            );
          } else if (foundSite.centroid) {
            mapInstance.flyTo({
              center: foundSite.centroid,
              zoom: 14,
              duration: 1800,
            });
          }
          return;
        }
      }

      // 2. If an explicit project ID is targeted
      if (projId && projId !== "all") {
        const projectSites = sitesList.filter((s) => s.project_id === projId);
        if (projectSites.length > 0) {
          setSelectedSite(projectSites[0]);
          setIsDrawerOpen(true);

          const projectBbox = calculateSitesBBox(projectSites);
          if (projectBbox) {
            mapInstance.fitBounds(
              [
                [projectBbox[0], projectBbox[1]],
                [projectBbox[2], projectBbox[3]],
              ],
              { padding: 100, duration: 1800, maxZoom: 15 }
            );
          } else if (projectSites[0].centroid) {
            mapInstance.flyTo({
              center: projectSites[0].centroid,
              zoom: 12,
              duration: 1800,
            });
          }
          return;
        }
      }

      // 3. Default: Fit bounds of all sites
      const allBbox = calculateSitesBBox(sitesList);
      if (allBbox) {
        mapInstance.fitBounds(
          [
            [allBbox[0], allBbox[1]],
            [allBbox[2], allBbox[3]],
          ],
          { padding: 80, duration: 1500, maxZoom: 12 }
        );
      } else if (sitesList[0]?.centroid) {
        mapInstance.flyTo({
          center: sitesList[0].centroid,
          zoom: 10,
          duration: 1500,
        });
      }
    },
    []
  );

  // Render or update the saved sites GeoJSON source & layers (pure rendering without camera override)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderSavedSitesLayer = useCallback((mapInstance: any, sitesList: MapSite[]) => {
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    const sourceId = "saved-sites-source";
    const fillLayerId = "saved-sites-fill";
    const lineLayerId = "saved-sites-line";

    const featureCollection = buildSitesFeatureCollection(sitesList);

    if (mapInstance.getSource(sourceId)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapInstance.getSource(sourceId) as any).setData(featureCollection);
    } else {
      mapInstance.addSource(sourceId, {
        type: "geojson",
        data: featureCollection,
      });

      // Green filled polygon for saved sites
      mapInstance.addLayer({
        id: fillLayerId,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": "#10B981",
          "fill-opacity": 0.35,
        },
      });

      // Outline border
      mapInstance.addLayer({
        id: lineLayerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": "#047857",
          "line-width": 2.5,
        },
      });

      // Polygon click event -> Open Site Detail Drawer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapInstance.on("click", fillLayerId, (e: any) => {
        const feature = e.features?.[0];
        if (feature && feature.properties) {
          const clickedId = feature.properties.id;
          const foundSite = sitesList.find((s) => s.id === clickedId);
          if (foundSite) {
            setSelectedSite(foundSite);
            setIsDrawerOpen(true);
          }
        }
      });

      // Cursor styling
      mapInstance.on("mouseenter", fillLayerId, () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });
      mapInstance.on("mouseleave", fillLayerId, () => {
        mapInstance.getCanvas().style.cursor = "";
      });
    }
  }, []);

  // Fetch sites and projects using safe React 19 pattern
  useEffect(() => {
    let ignore = false;
    fetchMapData()
      .then((data) => {
        if (!ignore) {
          setSites(data.sites);
          setProjects(data.projects);

          if (data.projects.length > 0) {
            setNewSiteProjectId(
              (prev) => prev || (targetProjectId ? targetProjectId : data.projects[0].id)
            );
          }

          if (targetSiteId) {
            const matchSite = data.sites.find((s) => s.id === targetSiteId);
            if (matchSite) {
              setSelectedSite(matchSite);
              setIsDrawerOpen(true);
            }
          } else if (targetProjectId) {
            const matchSite = data.sites.find((s) => s.project_id === targetProjectId);
            if (matchSite) {
              setSelectedSite(matchSite);
              setIsDrawerOpen(true);
            }
          } else if (data.sites.length > 0) {
            setSelectedSite((prev) => prev || data.sites[0]);
          }
        }
      })
      .catch(() => {
        showToast("Failed to load geospatial data");
      });

    return () => {
      ignore = true;
    };
  }, [targetProjectId, targetSiteId, refreshIndex]);

  // Initialize Mapbox GL and MapboxDraw
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isCancelled = false;

    const initMap = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        const MapboxDraw = (await import("@mapbox/mapbox-gl-draw")).default;

        if (isCancelled || !mapContainerRef.current) return;

        const effectiveToken = customToken || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
        if (effectiveToken) {
          mapboxgl.accessToken = effectiveToken;
        }

        // Determine style: Mapbox vector light-v11 or CartoDB Light fallback
        const styleToUse = effectiveToken
          ? activeLayer === "satellite"
            ? "mapbox://styles/mapbox/satellite-streets-v12"
            : "mapbox://styles/mapbox/light-v11"
          : activeLayer === "satellite"
            ? OPEN_SATELLITE_STYLE
            : OPEN_LIGHT_STYLE;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          style: styleToUse as any,
          center: [78.9629, 20.5937],
          zoom: 4,
          attributionControl: true,
        });

        // Add Mapbox Draw (polygon & trash controls only)
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true,
          },
          styles: [
            // Active drawing fill
            {
              id: "gl-draw-polygon-fill-active",
              type: "fill",
              filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
              paint: {
                "fill-color": "#EBF1B1",
                "fill-opacity": 0.3,
              },
            },
            // Active drawing stroke
            {
              id: "gl-draw-polygon-stroke-active",
              type: "line",
              filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
              paint: {
                "line-color": "#3D422E",
                "line-width": 2.5,
                "line-dasharray": [2, 2],
              },
            },
            // Static polygon fill
            {
              id: "gl-draw-polygon-fill-static",
              type: "fill",
              filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
              paint: {
                "fill-color": "#10B981",
                "fill-opacity": 0.25,
              },
            },
            // Static polygon stroke
            {
              id: "gl-draw-polygon-stroke-static",
              type: "line",
              filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
              paint: {
                "line-color": "#10B981",
                "line-width": 2,
              },
            },
            // Vertex points
            {
              id: "gl-draw-polygon-and-line-vertex-active",
              type: "circle",
              filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
              paint: {
                "circle-radius": 6,
                "circle-color": "#EBF1B1",
                "circle-stroke-width": 2,
                "circle-stroke-color": "#3D422E",
              },
            },
          ],
        });

        map.addControl(draw, "top-left");
        map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-left");
        mapRef.current = map;
        drawRef.current = draw;

        // Listen for polygon creation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handlePolygonCapture = (e: any) => {
          const feature = e.features?.[0];
          if (feature && feature.geometry && feature.geometry.type === "Polygon") {
            const polyGeometry: GeoJSONPolygon = {
              type: "Polygon",
              coordinates: feature.geometry.coordinates,
            };
            const ha = calculateTurfAreaHectares(polyGeometry);
            setDrawnFeature(polyGeometry);
            setDrawnHectares(ha);
            setIsSaveModalOpen(true);
          }
        };

        map.on("draw.create", handlePolygonCapture);
        map.on("draw.update", handlePolygonCapture);
        map.on("draw.delete", () => {
          setDrawnFeature(null);
          setDrawnHectares(0);
        });

        // When style loads, add saved sites layer and focus camera
        map.on("load", () => {
          renderSavedSitesLayer(map, sites);
          if (sites.length > 0) {
            focusCamera(map, sites, targetProjectId, targetSiteId);
          }
        });
      } catch (err) {
        console.error("Mapbox initialization error:", err);
      }
    };

    initMap();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customToken, activeLayer]);

  // Update map source and camera whenever sites or target search params change
  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      renderSavedSitesLayer(mapRef.current, sites);
      if (sites.length > 0) {
        focusCamera(mapRef.current, sites, targetProjectId, targetSiteId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites, targetProjectId, targetSiteId]);

  // Fly to a specific site
  const flyToSite = (site: MapSite) => {
    setSelectedSite(site);
    setIsDrawerOpen(true);

    if (!mapRef.current) return;

    if (site.bbox) {
      const isWide = typeof window !== "undefined" && window.innerWidth >= 1024;
      mapRef.current.fitBounds(
        [
          [site.bbox[0], site.bbox[1]],
          [site.bbox[2], site.bbox[3]],
        ],
        {
          padding: { top: 60, bottom: 60, left: 60, right: isWide ? 400 : 60 },
          duration: 1800,
          maxZoom: 16,
        }
      );
    } else if (site.centroid) {
      mapRef.current.flyTo({
        center: site.centroid,
        zoom: 14,
        duration: 1800,
      });
    }
  };

  // Handle project dropdown change
  const handleProjectFilterChange = (projId: string) => {
    setFilterProjectId(projId);
    if (projId !== "all") {
      setNewSiteProjectId(projId);
    }
    if (mapRef.current && sites.length > 0) {
      focusCamera(mapRef.current, sites, projId, null);
    }
  };

  // Trigger draw polygon mode
  const startDrawingPolygon = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      drawRef.current.changeMode("draw_polygon");
      showToast("Click on the map to begin drawing boundary vertices. Double-click to close.");
    }
  };

  // Handle saving the newly drawn polygon to backend
  const handleSaveSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawnFeature || !newSiteName.trim() || !newSiteProjectId) return;

    setIsSavingSite(true);
    setSaveError(null);

    try {
      await createSite({
        project_id: newSiteProjectId,
        name: newSiteName.trim(),
        geometry: drawnFeature,
      });

      showToast(`Site '${newSiteName}' successfully saved to PostGIS!`);
      setNewSiteName("");
      setIsSaveModalOpen(false);

      if (drawRef.current) {
        drawRef.current.deleteAll();
      }
      setDrawnFeature(null);
      setDrawnHectares(0);

      // Reload sites
      setRefreshIndex((prev) => prev + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save site";
      setSaveError(msg);
    } finally {
      setIsSavingSite(false);
    }
  };

  // Handle site deletion
  const handleDeleteSiteSubmit = async () => {
    if (!siteToDelete) return;
    setIsDeleting(true);

    try {
      await deleteSite(siteToDelete.id);
      showToast(`Site '${siteToDelete.name}' deleted`);
      setSiteToDelete(null);
      if (selectedSite?.id === siteToDelete.id) {
        setSelectedSite(null);
        setIsDrawerOpen(false);
      }
      setRefreshIndex((prev) => prev + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete site";
      showToast(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Save custom Mapbox token
  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("terrapulse_mapbox_token", customToken.trim());
      showToast("Mapbox access token updated!");
      setIsTokenModalOpen(false);
    }
  };

  // Dynamic plot calculations for active view
  const visibleSites =
    selectedProjectId === "all" ? sites : sites.filter((s) => s.project_id === selectedProjectId);

  const totalVisibleHectares = visibleSites.reduce((acc, s) => acc + (s.area || 0), 0);

  return (
    <PageContainer className="space-y-5">
      {/* Toast Notification (Fixed in window, never collides with canvas controls) */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#20251B] text-[#F3F5EC] border border-[#2E3626] shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-[#EBF1B1]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Map Control Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] text-xs font-bold uppercase tracking-wider">
              PostGIS Spatial Viewport
            </span>
            <span className="text-xs text-[#6B7280] dark:text-[#9EA793] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Mapbox GL JS + Turf.js
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F5EC] tracking-tight">
            Geospatial Intelligence Map
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9EA793]">
            Interactive polygon boundary mapping, precision GPS area calculation, and multispectral
            telemetry.
          </p>
        </div>

        {/* Primary Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
          {/* Project Selector / Filter */}
          {projects.length > 0 && (
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectFilterChange(e.target.value)}
                className="h-10 pl-4 pr-9 rounded-full bg-white dark:bg-[#20251B] text-[#111827] dark:text-[#F3F5EC] border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#EBF1B1] shadow-xs cursor-pointer appearance-none"
                title="Filter View by Project"
              >
                <option value="all">All Projects ({sites.length} Plots)</option>
                {projects.map((p) => {
                  const count = sites.filter((s) => s.project_id === p.id).length;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({count} plot{count !== 1 ? "s" : ""})
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9EA793]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Draw Polygon Trigger Button */}
          <button
            onClick={startDrawingPolygon}
            className="h-10 px-4 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] hover:bg-[#2A2F1E] dark:hover:bg-white text-white dark:text-[#161A12] text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Draw Polygon</span>
          </button>

          {/* Fit All Plots / Reset Camera */}
          <button
            onClick={() => {
              if (mapRef.current && sites.length > 0) {
                focusCamera(mapRef.current, sites, selectedProjectId, null);
                showToast("Centered viewport on monitored plots");
              }
            }}
            className="h-10 w-10 rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC] hover:border-[#3D422E] dark:hover:border-[#EBF1B1] shadow-xs flex items-center justify-center transition cursor-pointer shrink-0"
            title="Reset Camera to Fit Monitored Plots"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Token config button */}
          <button
            onClick={() => setIsTokenModalOpen(true)}
            className="h-10 w-10 rounded-full bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC] hover:border-[#3D422E] dark:hover:border-[#EBF1B1] shadow-xs flex items-center justify-center transition cursor-pointer shrink-0"
            title="Mapbox Token Configuration"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick-Jump Plots Bar & Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-0.5 custom-scrollbar">
          <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
            <MapPin className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" />
            Plots:
          </span>

          {visibleSites.length === 0 ? (
            <span className="text-xs text-[#9CA3AF] dark:text-[#7A8370] italic">
              No plots found in this view. Click &quot;Draw Polygon&quot; to trace a site boundary.
            </span>
          ) : (
            visibleSites.map((site) => {
              const isSelected = selectedSite?.id === site.id && isDrawerOpen;
              return (
                <button
                  key={site.id}
                  onClick={() => flyToSite(site)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 border ${
                    isSelected
                      ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] border-transparent shadow-xs"
                      : "bg-[#F9FAF5] dark:bg-[#161A12] hover:bg-[#EBF1B1]/40 dark:hover:bg-[#272D20] text-[#3D422E] dark:text-[#EBF1B1] border-[#E5E7EB] dark:border-[#2E3626]"
                  }`}
                  title={`Center and inspect ${site.name}`}
                >
                  <span>{site.name}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 dark:bg-black/20 text-white dark:text-[#161A12]"
                        : "bg-white dark:bg-[#20251B] text-[#6B7280] dark:text-[#9EA793]"
                    }`}
                  >
                    {Math.round(site.area || 0).toLocaleString()} ha
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Right stats count */}
        <div className="text-[11px] font-medium text-[#6B7280] dark:text-[#9EA793] shrink-0 hidden md:flex items-center gap-3">
          <span>
            <strong className="text-[#111827] dark:text-[#F3F5EC]">{visibleSites.length}</strong>{" "}
            plot{visibleSites.length !== 1 ? "s" : ""}
          </span>
          <span className="w-1 h-1 rounded-full bg-[#E5E7EB] dark:bg-[#2E3626]" />
          <span>
            <strong className="text-[#111827] dark:text-[#F3F5EC]">
              {Math.round(totalVisibleHectares).toLocaleString()}
            </strong>{" "}
            ha monitored
          </span>
        </div>
      </div>

      {/* Main Map Canvas Viewport */}
      <div className="relative w-full h-[620px] sm:h-[660px] lg:h-[700px] rounded-[32px] overflow-hidden border border-[#E5E7EB] dark:border-[#2E3626] shadow-sm bg-neutral-100 dark:bg-[#161A12]">
        {/* Mapbox GL Map Container */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Layer Switcher & Tool Capsule (Bottom Left) */}
        <div className="absolute bottom-6 left-6 z-10 flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 dark:bg-[#20251B]/95 backdrop-blur-md border border-[#E5E7EB] dark:border-[#2E3626] shadow-lg">
          <button
            onClick={() => setActiveLayer("light")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeLayer === "light"
                ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] shadow-xs"
                : "text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC]"
            }`}
          >
            Light (Apple)
          </button>
          <button
            onClick={() => setActiveLayer("satellite")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeLayer === "satellite"
                ? "bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] shadow-xs"
                : "text-[#6B7280] dark:text-[#9EA793] hover:text-[#111827] dark:hover:text-[#F3F5EC]"
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Floating Polygon HUD when a polygon is drawn */}
        {drawnFeature && (
          <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/95 dark:bg-[#20251B]/95 backdrop-blur-md border border-[#3D422E]/20 dark:border-[#EBF1B1]/30 shadow-2xl animate-in fade-in slide-in-from-top-4 max-w-[calc(100%-2rem)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-[#111827] dark:text-[#F3F5EC]">
                Turf.js Calculated:
              </span>
              <span className="text-xs font-black text-[#3D422E] dark:text-[#EBF1B1]">
                {drawnHectares.toLocaleString()} ha
              </span>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9EA793] hidden sm:inline">
                ({Math.round(drawnHectares * 2.471).toLocaleString()} Acres)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EBF1B1] text-[#161A12] text-xs font-bold hover:bg-white transition active:scale-95 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Site</span>
              </button>

              <button
                onClick={() => {
                  if (drawRef.current) drawRef.current.deleteAll();
                  setDrawnFeature(null);
                  setDrawnHectares(0);
                }}
                className="p-1 rounded-full text-neutral-400 hover:text-red-500 transition cursor-pointer"
                title="Discard drawing"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Site Detail Slide-Over Drawer (Right Side) */}
        {isDrawerOpen && selectedSite && (
          <div className="absolute top-3 right-3 bottom-3 sm:top-4 sm:right-4 sm:bottom-4 w-[calc(100%-1.5rem)] sm:w-96 max-h-[calc(100%-1.5rem)] sm:max-h-[calc(100%-2rem)] z-20 rounded-[28px] bg-white/95 dark:bg-[#20251B]/95 backdrop-blur-md border border-[#E5E7EB] dark:border-[#2E3626] p-5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right-4 transition-all">
            {/* Drawer Header (Fixed at top) */}
            <div className="shrink-0 pb-3 border-b border-[#E5E7EB] dark:border-[#2E3626]">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 text-[#3D422E] dark:text-[#EBF1B1] border border-[#3D422E]/10 dark:border-[#EBF1B1]/30 text-[10px] font-extrabold uppercase tracking-wider">
                  {selectedSite.health_status || "Active Plot"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => flyToSite(selectedSite)}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#272D20] text-[#6B7280] dark:text-[#9EA793] transition cursor-pointer"
                    title="Center on Site"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#272D20] text-[#6B7280] dark:text-[#9EA793] transition cursor-pointer"
                    title="Close Details"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC] truncate">
                {selectedSite.name}
              </h3>
              <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#9EA793] mt-0.5">
                <span className="truncate">
                  Project:{" "}
                  <strong className="text-[#111827] dark:text-[#F3F5EC]">
                    {selectedSite.project_name}
                  </strong>
                </span>
              </div>
              <span className="text-[11px] text-[#9CA3AF] dark:text-[#9EA793] font-mono flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3 h-3 text-[#3D422E] dark:text-[#EBF1B1] shrink-0" />
                <span className="truncate">
                  {selectedSite.coordinates_text || "Geospatial Boundary"}
                </span>
              </span>
            </div>

            {/* Drawer Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar pr-1">
              {/* Area, Perimeter & Health Badges */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626]">
                  <span className="text-[9px] text-[#6B7280] dark:text-[#9EA793] uppercase font-semibold block">
                    Area
                  </span>
                  <span className="text-sm font-black text-[#111827] dark:text-[#F3F5EC] block truncate">
                    {Math.round(selectedSite.area || 0).toLocaleString()} ha
                  </span>
                  <span className="text-[9px] text-[#6B7280] dark:text-[#9EA793] block truncate">
                    {Math.round((selectedSite.area || 0) * 2.471).toLocaleString()} ac
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626]">
                  <span className="text-[9px] text-[#6B7280] dark:text-[#9EA793] uppercase font-semibold block">
                    Perimeter
                  </span>
                  <span className="text-sm font-black text-[#111827] dark:text-[#F3F5EC] block truncate">
                    {selectedSite.perimeter_km || 0} km
                  </span>
                  <span className="text-[9px] text-[#6B7280] dark:text-[#9EA793] block truncate">
                    {Math.round((selectedSite.perimeter_km || 0) * 1000).toLocaleString()} m
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#EBF1B1]/60 dark:bg-[#272E20] border border-[#3D422E]/15 dark:border-[#EBF1B1]/20">
                  <span className="text-[9px] text-[#3D422E] dark:text-[#EBF1B1] uppercase font-bold block">
                    Health
                  </span>
                  <span className="text-sm font-black text-[#3D422E] dark:text-[#EBF1B1] block">
                    {selectedSite.health_index || 78.8}
                  </span>
                  <span className="text-[9px] text-[#52593F] dark:text-[#A8B29C] block font-mono truncate">
                    60%C+40%B
                  </span>
                </div>
              </div>

              {/* Center Coordinates Box */}
              <div className="px-3 py-2.5 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] flex items-center justify-between text-[11px]">
                <span className="text-[#6B7280] dark:text-[#9EA793] font-medium flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#3D422E] dark:text-[#EBF1B1]" /> Center Point
                </span>
                <span className="font-mono font-bold text-[#111827] dark:text-[#F3F5EC]">
                  {selectedSite.coordinates_text || "Geospatial Boundary"}
                </span>
              </div>

              {/* Telemetry Multispectral Scores */}
              <div className="p-3.5 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] space-y-2.5">
                <span className="text-[11px] font-bold text-[#6B7280] dark:text-[#9EA793] uppercase tracking-wider block">
                  Multispectral Telemetry Scores
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280] dark:text-[#9EA793] flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-500" /> Carbon Flux
                    </span>
                    <strong className="text-[#111827] dark:text-[#F3F5EC]">
                      {selectedSite.carbon_score || 82} / 100
                    </strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280] dark:text-[#9EA793] flex items-center gap-1.5">
                      <TreePine className="w-3.5 h-3.5 text-[#3D422E] dark:text-[#EBF1B1]" />{" "}
                      Biodiversity
                    </span>
                    <strong className="text-[#111827] dark:text-[#F3F5EC]">
                      {selectedSite.bio_score || 74} / 100
                    </strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280] dark:text-[#9EA793] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-500" /> Soil Health
                    </span>
                    <strong className="text-[#111827] dark:text-[#F3F5EC]">
                      {selectedSite.soil_health || 80} / 100
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions (Pinned at bottom) */}
            <div className="shrink-0 pt-3 space-y-2 border-t border-[#E5E7EB] dark:border-[#2E3626]">
              <Link
                href={`/analytics?site=${selectedSite.id}`}
                className="w-full text-center py-2.5 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] hover:bg-[#2A2F1E] dark:hover:bg-white text-white dark:text-[#161A12] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View Full Analytics</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => setSiteToDelete(selectedSite)}
                className="w-full text-center py-2 rounded-full text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Site Boundary</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Site Floating Modal */}
      {isSaveModalOpen && drawnFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-[32px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-2xl space-y-5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 flex items-center justify-center text-[#3D422E] dark:text-[#EBF1B1]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC]">
                    Save Monitored Site
                  </h3>
                  <span className="text-xs text-[#6B7280] dark:text-[#9EA793]">
                    Save boundary polygon to PostGIS
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#272D20] text-[#6B7280] dark:text-[#9EA793] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Calculated Turf Area Preview */}
            <div className="p-3.5 rounded-2xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] flex items-center justify-between">
              <span className="text-xs text-[#6B7280] dark:text-[#9EA793]">
                Turf.js Calculated Area:
              </span>
              <span className="text-sm font-black text-[#3D422E] dark:text-[#EBF1B1]">
                {drawnHectares.toLocaleString()} ha
              </span>
            </div>

            <form onSubmit={handleSaveSiteSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151] dark:text-[#F3F5EC]">
                  Site Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="e.g. Amazon Plot A3 (North Basin)"
                  className="w-full h-10 px-4 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151] dark:text-[#F3F5EC]">
                  Assign to Project <span className="text-rose-500">*</span>
                </label>
                {projects.length > 0 ? (
                  <select
                    value={newSiteProjectId}
                    onChange={(e) => setNewSiteProjectId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] transition"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-rose-500">
                    No projects found. Please create a project first.
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold text-[#6B7280] dark:text-[#9EA793] hover:bg-gray-50 dark:hover:bg-[#272D20] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSite || projects.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] text-xs font-bold hover:bg-[#2A2F1E] dark:hover:bg-white shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isSavingSite ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to PostGIS...</span>
                    </>
                  ) : (
                    <span>Save Site</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Site Confirmation Modal */}
      {siteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-[32px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-2xl space-y-5 transition-colors">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC]">
                Delete Site Boundary?
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9EA793] leading-relaxed">
                Are you sure you want to delete{" "}
                <strong className="text-[#111827] dark:text-[#F3F5EC]">{siteToDelete.name}</strong>?
                This will permanently remove its PostGIS polygon boundary and associated telemetry
                records.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSiteToDelete(null)}
                className="px-4 py-2 rounded-full border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold text-[#6B7280] dark:text-[#9EA793] hover:bg-gray-50 dark:hover:bg-[#272D20] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSiteSubmit}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Site</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mapbox Token Configuration Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-[32px] bg-white dark:bg-[#20251B] border border-[#E5E7EB] dark:border-[#2E3626] p-6 sm:p-8 shadow-2xl space-y-5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#EBF1B1] dark:bg-[#EBF1B1]/20 flex items-center justify-center text-[#3D422E] dark:text-[#EBF1B1]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827] dark:text-[#F3F5EC]">
                    Mapbox Access Token
                  </h3>
                  <span className="text-xs text-[#6B7280] dark:text-[#9EA793]">
                    Configure Mapbox GL vector tiles
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsTokenModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#272D20] text-[#6B7280] dark:text-[#9EA793] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6B7280] dark:text-[#9EA793] leading-relaxed">
              If you have a personal Mapbox public token (
              <code className="font-mono text-[11px] text-[#3D422E] dark:text-[#EBF1B1]">
                pk.eyJ...
              </code>
              ), enter it below to render official Mapbox{" "}
              <code className="font-mono text-[11px]">light-v11</code> styles. Otherwise, our
              built-in high-definition CartoDB & Esri GIS tiles are active.
            </p>

            <form onSubmit={handleSaveToken} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151] dark:text-[#F3F5EC]">
                  Public Access Token
                </label>
                <input
                  type="text"
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  placeholder="pk.eyJ1Ijo..."
                  className="w-full h-10 px-4 rounded-xl bg-[#F9FAF5] dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] text-sm text-[#111827] dark:text-[#F3F5EC] focus:outline-none focus:border-[#3D422E] dark:focus:border-[#EBF1B1] font-mono transition"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTokenModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E5E7EB] dark:border-[#2E3626] text-xs font-bold text-[#6B7280] dark:text-[#9EA793] hover:bg-gray-50 dark:hover:bg-[#272D20] transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#3D422E] dark:bg-[#EBF1B1] text-white dark:text-[#161A12] text-xs font-bold hover:bg-[#2A2F1E] dark:hover:bg-white shadow-sm transition cursor-pointer"
                >
                  Save & Reload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

export default function MapPage() {
  return (
    <React.Suspense
      fallback={
        <PageContainer>
          <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-[640px] w-full rounded-[32px] bg-neutral-100 dark:bg-[#161A12] border border-[#E5E7EB] dark:border-[#2E3626] animate-pulse flex items-center justify-center text-xs text-[#6B7280]">
            Loading Geospatial GIS Map...
          </div>
        </PageContainer>
      }
    >
      <MapViewport />
    </React.Suspense>
  );
}
