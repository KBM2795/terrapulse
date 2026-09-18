# TerraPulse Backend — Geospatial REST API & Spatial Analytics Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.141.1-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12%20%7C%203.14-blue?logo=python)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?logo=postgresql)](https://postgis.net/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red)](https://www.sqlalchemy.org/)
[![CI Status](https://img.shields.io/badge/CI-Passing-brightgreen?logo=github-actions)](.github/workflows/ci.yml)

> The **TerraPulse Backend** is an asynchronous geospatial REST API and ecological intelligence engine. Built with FastAPI, PostgreSQL/PostGIS, and SQLAlchemy 2.0, it handles millimetric polygon boundary ingestion, geodesic area calculation, multispectral sensor telemetry generation, and cryptographic audit logs.

---

## 📸 Platform Views

| Executive Dashboard | Geospatial GIS Viewport | Ecosystem Health Index |
| :---: | :---: | :---: |
| ![Dashboard](docs/screenshots/dashboard.png) | ![GIS Map](docs/screenshots/map.png) | ![Analytics](docs/screenshots/analytics.png) |

---

## ⚡ Key Hackathon Differentiators

1. **Native PostGIS Spatial Engine** ⭐
   - Stores polygon boundaries as true spatial types: `geometry(Polygon, 4326)`.
   - Computes geodesic surface areas natively via PostGIS: `ST_Area(geom::geography) / 10000` (in hectares).
   - Calculates polygon centroids, bounding boxes (`ST_Envelope`), and perimeters directly in SQL queries.

2. **Environmental Health Index (EHI) Algorithm** ⭐
   - Implements composite ecological health scoring based on ISO 14064 principles:
     $$\text{EHI} = (0.60 \times \text{Carbon Score}) + (0.40 \times \text{Biodiversity Score})$$
   - Generates status tiers: `Healthy` (≥ 80), `Moderate` (65–79.9), and `Critical` (< 65).

3. **Immutable Activity Audit Trail** ⭐
   - Automatically records every lifecycle event (`PROJECT_CREATED`, `SITE_ADDED`, `ANALYTICS_GENERATED`, `SITE_DELETED`).
   - Powers the project detail activity timeline for compliance and verification.

4. **One-Click Evaluator Seed Endpoint** ⭐
   - `POST /api/dev/seed` provisions verified sample projects, PostGIS polygon sites across global biomes (Amazon, Mumbai Mangroves, Black Forest, Sundarbans), and 12-month historical telemetry trends.

---

## 🏗️ Architecture & Component Flow

```mermaid
graph TD
    Client["Frontend Client (Next.js 16)"] -->|"Bearer JWT + GeoJSON"| API["FastAPI REST Router"]

    subgraph Backend Core
        API --> Auth["Auth & Security (JWT, Bcrypt)"]
        API --> Projects["Projects Service"]
        API --> GIS["Geospatial GIS Service"]
        API --> Analytics["Telemetry & EHI Engine"]
        API --> Audit["Activity Audit Logger"]
    end

    subgraph Database Layer
        GIS -->|"ST_GeomFromGeoJSON / ST_Area"| PostGIS[("PostgreSQL + PostGIS")]
        Projects --> PostGIS
        Analytics --> PostGIS
        Audit --> PostGIS
    end

    classDef core fill:#20251B,stroke:#EBF1B1,stroke-width:2px,color:#F3F5EC;
    class API,Auth,Projects,GIS,Analytics,Audit,PostGIS core;
```

---

## 🗄️ Database Schema & Entity Relationships

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : owns
    PROJECTS ||--o{ SITES : contains
    PROJECTS ||--o{ ACTIVITY_LOGS : records
    SITES ||--o{ SITE_ANALYTICS : produces

    USERS {
        uuid id PK
        string email UK
        string full_name
        string organization
        string hashed_password
        datetime created_at
    }

    PROJECTS {
        uuid id PK
        uuid user_id FK
        string name
        string description
        string status
        datetime created_at
    }

    SITES {
        uuid id PK
        uuid project_id FK
        string name
        geometry boundary_geom "Polygon 4326"
        float area_hectares
        float perimeter_km
        jsonb centroid_coordinates
        datetime created_at
    }

    SITE_ANALYTICS {
        uuid id PK
        uuid site_id FK
        float carbon_score
        float biodiversity_score
        float soil_health
        float tree_coverage
        float health_index
        string health_status
        datetime recorded_at
    }

    ACTIVITY_LOGS {
        uuid id PK
        uuid project_id FK
        string action_type
        string description
        datetime created_at
    }
```

---

## 🎯 Reviewer Demo Journey

1. **Sign In**: `POST /api/auth/login` returns a secure Bearer JWT.
2. **Seed Dataset**: Trigger `POST /api/dev/seed` to instantly inject verified projects, sites, and analytics.
3. **Inspect Dashboard**: `GET /api/dashboard` delivers aggregated portfolio metrics, average EHI, and performance charts.
4. **Inspect GIS Polygons**: `GET /api/sites` returns PostGIS polygons formatted as clean GeoJSON with millimetric coordinates.
5. **Trace Boundary**: `POST /api/sites` saves a newly drawn polygon and returns PostGIS-computed surface area.
6. **Generate Telemetry**: `POST /api/sites/{id}/analytics` computes latest multispectral telemetry scores and appends an audit event.

---

## 📡 Complete API Reference

### Authentication & Profile
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | `{ email, password, full_name, organization }` |
| `POST` | `/api/auth/login` | Authenticate & retrieve Bearer token | Form data (`username`, `password`) |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | *Bearer Token Required* |
| `PUT` | `/api/auth/profile` | Update user name & organization | `{ full_name, organization }` |
| `PUT` | `/api/auth/password` | Change account password | `{ current_password, new_password }` |

### Dashboard & Analytics
| Method | Endpoint | Description | Query / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Aggregated metrics, total area, EHI, 12M trend | None |
| `GET` | `/api/sites/{id}/analytics` | 12-month historical telemetry & latest scores | `site_id` path param |
| `POST` | `/api/sites/{id}/analytics` | Run live audit & compute sensor scores | `site_id` path param |

### Project Management
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | List all user projects | Optional `?status=active` |
| `POST` | `/api/projects` | Create a new project | `{ name, description, status }` |
| `GET` | `/api/projects/{id}` | Project detail with child sites & audit log | `id` path param |
| `DELETE` | `/api/projects/{id}` | Cascade delete project and associated sites | `id` path param |

### Geospatial Sites (GIS & PostGIS)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sites` | List sites as GeoJSON FeatureCollection | Optional `?project_id={id}` |
| `POST` | `/api/sites` | Ingest and compute polygon boundary in PostGIS | `{ project_id, name, geometry }` |
| `GET` | `/api/sites/{id}` | Retrieve specific site details with centroid GPS | `id` path param |
| `DELETE` | `/api/sites/{id}` | Delete site boundary and telemetry | `id` path param |

### System & Developer Seed
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health check (PostgreSQL + PostGIS connection status) |
| `POST` | `/api/dev/seed` | Seed demo portfolio (Projects, PostGIS sites, 12M historical records) |
| `DELETE` | `/api/dev/reset` | Clear all user projects, sites, and telemetry records |

---

## 🚀 Setup & Local Execution

### Prerequisites
- **Python**: 3.11+ or 3.12+
- **PostgreSQL**: 14+ with **PostGIS** extension (`CREATE EXTENSION postgis;`)

### 1. Environment Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Environment Variables
Create `.env` in `backend/`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/terrapulse
JWT_SECRET=super-secret-terrapulse-jwt-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 3. Run Migrations & Start Server
```bash
# Start FastAPI application with live hot-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Swagger API documentation is immediately available at:
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**
👉 **[http://localhost:8000/redoc](http://localhost:8000/redoc)**

---

## 🧪 Code Quality & CI

```bash
# Run syntax and lint checks
flake8 app --count --select=E9,F63,F7,F82 --show-source --statistics

# Verify FastAPI application startup
python -c "from app.main import app; print('✓ App loaded successfully')"
```

---

## 🔮 Future Scope
- **STAC API Ingestion Engine**: SpatioTemporal Asset Catalog metadata processing for automated satellite tile download.
- **Asynchronous Celery / Redis Workers**: Offload heavy Sentinel-2 NDVI spectral raster analysis to background task queues.
- **WKT / Shapefile Exporter**: Export site boundaries to ESRI Shapefile (.shp) and GeoPackage (.gpkg) formats.
