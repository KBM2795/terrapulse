# TerraPulse Frontend Architecture & Status

## Overview

- **Product**: TerraPulse (Darukaa.Earth Environmental Intelligence Platform)
- **Design Inspiration**: Apple, Linear, Arc Browser, Green Roots design kit reference
- **Architecture**: Full-Stack Next.js 16 (Turbopack) + React 19 + Tailwind CSS + FastAPI + PostgreSQL (PostGIS)
- **Backend URL**: `http://localhost:8000` (FastAPI REST API with Bearer JWT Auth)
- **Official Logo**: `/logo.png` (derived from `/app/favicon.ico`)
- **Theme**: Natural Earth Dark Theme (`#161A12` canvas, `#20251B` cards, `#2E3626` borders, `#EBF1B1` pale lime glow) & Cream Light Theme (`#F9FAF5`)

---

## Design System Tokens

- **Light Theme**:
  - Canvas / Background: `#F9FAF5` (Warm Cream Earth Canvas)
  - Primary Accent (Pale Lime): `#EBF1B1` (Hover: `#DFE897`, Light: `#F4F7D4`)
  - Dark Forest: `#3D422E` (Deep: `#2A2F1E`, Muted: `#555B42`)
  - Cards / Surfaces: `#FFFFFF`
  - Text Main: `#111827`, Muted: `#6B7280`, Border: `#E5E7EB`
- **Natural Dark Theme** (Earthy deep moss/forest, NOT pitch black):
  - Canvas / Background: `#161A12` (Deep Forest Night)
  - Cards / Surfaces: `#20251B` (Natural Dark Moss Card)
  - Elevated Input Surfaces: `#272D20`
  - Borders: `#2E3626` (Deep Organic Border)
  - Primary Accent: `#EBF1B1` (Pale Lime Glow)
  - Text Main: `#F3F5EC` (Warm Natural Off-White)
  - Text Muted: `#9EA793` (Earthy Sage Muted)
- **Radii**:
  - Standard Card: `24px` (`rounded-3xl` / `rounded-[24px]`)
  - Panels & Bento: `28px` (`rounded-[28px]`)
  - Feature / Map Viewport: `32px` (`rounded-[32px]`)
  - Pills & Badges: `9999px` (`rounded-full`)
- **Shadows**:
  - Soft Floating: `shadow-[0_8px_30px_rgb(0,0,0,0.06)]`
  - Elevated Hover: `shadow-[0_16px_40px_rgb(0,0,0,0.10)]`
- **Typography**:
  - Primary: Satoshi (Fontshare CDN 300, 400, 500, 700, 900)
  - Fallback: Inter (`var(--font-inter)`)

---

## Visual Assets

- Official Logo: `/logo.png` (high-res platform logo)
- Aerial Agriculture Rows Texture: `/images/aerial-crop-grid.jpg`
- Agroforestry & Ecological Canopy: `/images/agroforestry-drone.jpg`
- Farmer & Produce Box: `/images/farmer-harvest.jpg`
- Sustainability Lead: `/images/sustainability-lead.jpg`
- Greenhouse Team: `/images/greenhouse-team.jpg`
- Founder Portrait: `/images/founder-portrait.jpg`
- Precision Pruning: `/images/gardener-pruning.jpg`

---

## Integration Services & Data Layers

- **API Client** (`lib/api.ts`):
  - Axios client with base URL `http://localhost:8000`
  - Automatic `Authorization: Bearer <token>` request interceptor
  - Universal error unwrapping
- **Auth Service** (`lib/auth.ts`):
  - `loginApi(payload)`: `POST /api/auth/login`
  - `registerApi(payload)`: `POST /api/auth/register`
  - `getMeApi()`: `GET /api/auth/me`
  - Dual persistence: `Cookies` (`terrapulse_token`, 7-day max-age, Lax) + `localStorage`
- **Auth Context** (`context/auth-context.tsx`):
  - Global `useAuth()` hook with `user`, `token`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout`
  - Background token revalidation on mount
- **Edge Middleware** (`middleware.ts`):
  - Protects `/dashboard/*`, `/projects/*`, `/map/*`, `/analytics/*`, `/settings/*`
  - 307 redirect unauthenticated visitors to `/login?from=<origin>`
  - 307 redirect authenticated visitors away from `/login` & `/register` to `/dashboard`
- **Dashboard Service** (`lib/dashboard.ts`):
  - `fetchDashboardData()`: Concurrently queries projects, sites, activities, and site telemetry history
  - Dynamic KPI aggregation: Total Projects, Total Monitored Sites, Total PostGIS Area (`ha`), and Average Health Index
  - `formatTimeAgo()`: Relative time formatting for live audit trail events
- **Projects Service** (`lib/projects.ts`):
  - `fetchProjects()`: Lists all owned projects enriched with site counts and summed PostGIS hectares
  - `fetchProjectDetails(id)`: Retrieves single project, child sites (`/api/sites?project_id={id}`), and site telemetry
  - `createProject(payload)`: `POST /api/projects`
  - `updateProject(id, payload)`: `PUT /api/projects/{id}`
  - `deleteProject(id)`: `DELETE /api/projects/{id}` (cascading cleanup)
  - `formatPolygonCentroid()`: Derives GPS coordinates from GeoJSON boundary polygons

---

## Component Registry

- `components/landing/navbar.tsx`: Floating capsule navbar with blur, logo, nav links, and CTA pills.
- `components/landing/hero-section.tsx`: Headline in Satoshi, climate-tech value proposition, live platform preview toggle, pill badges.
- `components/landing/bento-grid.tsx`: Green Roots-styled 6-card bento grid with aerial imagery, numbered pillars, dark forest feature card, and metric cards.
- `components/landing/interactive-preview.tsx`: Interactive Environmental Health Index (EHI) gauge with live calculation (`(0.6 × Carbon) + (0.4 × Biodiversity)`).
- `components/landing/founder-quote.tsx`: Quotation block with Dr. Daniel Hartman's mission and portrait card.
- `components/landing/rooted-values.tsx`: "Rooted in Precision & Ecology" 4-pillar 2x2 grid in pale lime `#EBF1B1`.
- `components/landing/sites-preview.tsx`: 3 minimal site preview cards with simulated map boundaries and coordinates.
- `components/landing/reviewer-tour.tsx`: Interactive 1-click reviewer walkthrough showcasing key features.
- `components/landing/footer.tsx`: Dark Forest `#3D422E` footer with quick links, status indicators, and branding.
- `components/layout/sidebar.tsx`: Collapsible docked sidebar with real user avatar/initials, dynamic user name/email, system telemetry badge, and Sign Out button.
- `components/layout/top-navbar.tsx`: Sticky glass header with global search (`⌘K`), Evaluator **"Seed Demo Data"** action pill, GIS map shortcut, notification bell, theme toggle, and user initials avatar.
- `components/layout/page-container.tsx`: Floating canvas layout with generous Apple-style margins and responsive padding.
- `components/theme-provider.tsx`: Natural Earth dark mode provider with React 19 / Next.js 16 script tag filter.
- `components/theme-toggle.tsx`: Floating / inline theme toggle between Natural Light and Natural Earth Dark.

---

## Current Status & Milestones

- [x] **Phase 1 — Design System & Theme Foundations**:
  - Natural Earth Dark Theme (`#161A12` canvas, `#20251B` cards, `#2E3626` borders, `#EBF1B1` lime glow)
  - Satoshi CDN typography + Inter fallback
  - Extracted visual assets to `/public/images`
- [x] **Phase 2 — Landing Page (`/`)**:
  - Hero section, interactive preview, 6-card bento grid, founder quote, rooted values, reviewer tour, and footer.
- [x] **Phase 3 — UI Shell & Dark Mode Across All Routes**:
  - Fixed theme toggle reactivity and text contrast across `/dashboard`, `/projects`, `/map`, `/analytics`, `/settings`.
- [x] **Phase 4 — Authentication & Route Protection**:
  - `POST /api/auth/login` and `POST /api/auth/register` wired to FastAPI backend
  - Edge middleware protecting private app routes with 307 redirects
  - Evaluator 1-click quick fills on `/login` and `/register`
  - Real user initials and Sign Out button in sidebar
  - Dev seed tools wired to `POST /api/dev/seed` and `DELETE /api/dev/reset`
- [x] **Phase 5 — Executive Dashboard (`/dashboard`)**:
  - Real-time KPI Cards: Total Projects, Monitored Sites, Total Area (`ha`), and Average Health Index
  - Interactive 12-month trajectory trend chart (Carbon Flux vs. Biodiversity)
  - Circular SVG Environmental Health Index gauge with live formula breakdown: `(0.6 × Carbon) + (0.4 × Bio)`
  - Recent Projects list with live PostGIS area and plot counts
  - Live Activity Timeline from `GET /api/activities` (`PROJECT_CREATED`, `SITE_ADDED`, `ANALYTICS_GENERATED`)
  - Evaluator fast-path seed card if 0 projects exist
- [x] **Phase 6 — Projects Portfolio (`/projects` & `/projects/[id]`)**:
  - Real project list from `GET /api/projects` enriched with PostGIS area from `GET /api/sites`
  - Real-time search and status filter tabs (`All`, `Active`, `Pending`, `Completed`)
  - Create Project modal with live `POST /api/projects` submission
  - Delete project modal with cascading cleanup via `DELETE /api/projects/{id}`
  - Project Detail page (`/projects/[id]`) with child sites table, centroid coordinates, and telemetry links
- [x] **Phase 7 — Geospatial GIS Map (`/map`)**:
  - Unified design system layout with `<PageContainer>` (`max-w-7xl mx-auto p-4 sm:p-6 lg:p-8`) matching Dashboard and Analytics
  - Mapbox GL JS (`light-v11` Apple-aesthetic / satellite) with open-source fallback raster layers
  - Mapbox Draw integration (Polygon, Trash controls) with custom frosted glass UI styling
  - Turf.js geodesic area calculation (`@turf/area` -> hectares + acres) with responsive top HUD
  - Save site to backend (`POST /api/sites` with GeoJSON polygon)
  - Load and render saved PostGIS polygons (`GET /api/sites`)
  - Target camera autofocus: Zoom directly into clicked site polygon bounding box (`/map?project={id}&site={siteId}`) with smart camera offset for the right drawer
  - Clean 2-tier toolbar: Upper action cluster (Project filter, Draw Polygon, Reset View, Token Config) and lower Monitored Plots quick-jump chip tray with plot area pills and live summary counts
  - Non-colliding map controls: NavigationControl stacked cleanly under Draw tools in `top-left`, eliminating drawer and toast overlap
  - Responsive slide-over detail drawer (`max-h-[calc(100%-2rem)]`) with fixed header, smooth custom-scrollable body, and pinned action buttons ("View Full Analytics", "Delete Site Boundary")
- [x] **Phase 8 — Detailed Site Analytics (`/analytics`)**:
  - Dynamic site selector bound to live backend sites and query param (`?site={siteId}`)
  - Visually impressive large circular Environmental Health Gauge (220px SVG radial gradient with drop-shadow glow and live status pill)
  - 4 Core Telemetry Metric Cards: Carbon Flux (+16.4 tCO₂e/ha), Biodiversity Index (48 species), Soil Organic Health (3.8% SOC), and Tree Coverage (Canopy ha)
  - Interactive 12-month trend chart with metric tabs (Composite, Carbon, Bio, Soil, Tree) and time range toggles (3M, 6M, 12M)
  - Live sensor audit calculation trigger calling `POST /api/sites/{id}/analytics` and logging `ANALYTICS_GENERATED` to PostgreSQL
  - Audit report summary export (.txt / compliance)
- [x] **Phase 9 — System Settings & Backend Integration (`/settings`)**:
  - User & organization profile editing backed by `PUT /api/auth/profile`
  - Account security & password update backed by `PUT /api/auth/password`
  - Live backend health indicator (`GET /api/health`) showing PostgreSQL + PostGIS status
  - Reviewer fast-path dev dataset seed (`POST /api/dev/seed`) and user data reset (`DELETE /api/dev/reset`)
  - Local Mapbox access token management syncing with GIS Map viewport

---

## Code Quality & Verification

- `npm run lint`: **0 errors, 0 warnings**
- `npm run build`: **Compiled successfully in <1s** across all 11 static and dynamic routes
- **Hydration**: Fully compliant with Next.js 16 and React 19 SSR hydration rules
