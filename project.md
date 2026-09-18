# TerraPulse

### Environmental Intelligence Platform

A premium geospatial analytics platform for monitoring carbon sequestration, biodiversity performance, and ecosystem health through interactive mapping and environmental intelligence dashboards.

---

# Vision

TerraPulse transforms complex environmental and geospatial data into actionable insights.

Built for organizations managing carbon and biodiversity projects, the platform provides a centralized workspace to visualize project locations, analyze environmental performance, and track ecosystem health over time.

---

# Problem Statement

Organizations managing environmental projects often struggle with:

- Scattered geographic data
- Manual site monitoring
- Limited visibility into project performance
- Lack of centralized reporting
- Difficulty measuring environmental impact

TerraPulse addresses these challenges by combining GIS visualization, environmental analytics, and project management into a single platform.

---

# Core Features

## Authentication & Access

Secure JWT-based authentication.

### Capabilities

- User Registration
- User Login
- Protected Routes
- Session Management

---

## Project Management

Create and manage environmental projects.

### Project Fields

- Project Name
- Description
- Status
- Created Date

### Capabilities

- Create Project
- View Projects
- Edit Project
- Delete Project
- Project Overview Dashboard

---

## Geospatial Site Management

Each project can contain multiple monitoring sites.

### Site Fields

- Site Name
- Polygon Geometry
- Geographic Coordinates
- Site Area
- Creation Date

### Capabilities

- Create Site
- Edit Site
- Delete Site
- View Site Details

---

## Interactive GIS Mapping

Built using Mapbox GL JS.

### Capabilities

- Draw Polygon Boundaries
- Edit Polygon Boundaries
- Delete Polygon Boundaries
- Highlight Selected Sites
- Fly-To Site Navigation
- Interactive Site Popups
- Layer Controls

---

## Polygon Analytics

Automatically generated geographic insights.

### Metrics

- Total Area
- Perimeter
- Center Coordinates
- Site Boundary Information

### Technology

- Turf.js
- PostGIS

---

## Environmental Analytics

Each monitoring site contains environmental performance metrics.

### Metrics

- Carbon Score
- Biodiversity Score
- Soil Health Index
- Tree Coverage

### Visualizations

- Trend Charts
- Score Cards
- Historical Performance Graphs
- Comparative Analytics

---

## Environmental Health Index

### Custom TerraPulse Feature

A simplified environmental performance indicator.

Formula:

Environmental Health Index

= (0.6 × Carbon Score)

+ (0.4 × Biodiversity Score)

### Status Levels

| Score | Status |
|---------|---------|
| 80-100 | Healthy |
| 60-79 | Moderate |
| 0-59 | Critical |

### Display Components

- Circular Gauge
- Progress Indicator
- Health Status Badge

---

## Activity Timeline

Track important platform events.

### Events

- Project Created
- Site Added
- Polygon Updated
- Site Modified
- Analytics Generated

Purpose:

Provide auditability and project history visibility.

---

# User Journey

### Step 1

Register and log into the platform.

### Step 2

Create a new environmental project.

### Step 3

Open the interactive map.

### Step 4

Draw a polygon representing a monitoring site.

### Step 5

Save the site to the selected project.

### Step 6

View automatically calculated geographic information.

### Step 7

Explore environmental metrics and trends.

### Step 8

Monitor Environmental Health Index performance.

---

# Technical Stack

## Frontend

- Next.js 15
- TypeScript
- TailwindCSS
- Shadcn UI
- Mapbox GL JS
- Turf.js
- Chart.js
- Framer Motion
- Lucide React

---

## Backend

- FastAPI
- SQLAlchemy
- GeoAlchemy2
- JWT Authentication
- Pydantic

---

## Database

### PostgreSQL + PostGIS

Used for:

- User Management
- Project Data
- Geospatial Polygon Storage
- Environmental Analytics
- Activity Logs

---

## DevOps

- GitHub Actions
- Husky
- lint-staged
- ESLint
- Prettier

---

# Database Schema

## Users

```sql
id
name
email
password_hash
created_at
```

## Projects

```sql
id
name
description
status
created_by
created_at
```

## Sites

```sql
id
project_id
name
geometry
area
created_at
```

## Analytics

```sql
id
site_id
carbon_score
biodiversity_score
soil_health
tree_coverage
recorded_at
```

## Activity Logs

```sql
id
project_id
event_type
description
created_at
```

---

# System Architecture

```text
User
 │
 ▼
Next.js Frontend
 │
 ▼
FastAPI REST API
 │
 ▼
PostgreSQL + PostGIS
```

---

# Design Philosophy

Inspired by:

- Apple
- Linear
- Arc Browser
- Modern Climate-Tech Products

### Design Principles

- Premium User Experience
- Large Rounded Components
- Spacious Layouts
- Minimal Visual Noise
- High Readability
- GIS-First Workflow

### Brand Theme

- Forest Green
- Pale Lime
- Soft Cream
- White Surfaces

### Typography

- Satoshi

---

# Unique Selling Points

- Environmental Health Index
- Premium Apple-Inspired Design
- Interactive GIS Mapping
- Polygon Analytics
- Environmental Intelligence Dashboard
- Activity Tracking System
- Production-Ready Architecture

---

# Future Scope

- Satellite Imagery Integration
- NDVI Vegetation Analysis
- Carbon Forecasting
- Biodiversity Prediction
- AI-Based Environmental Insights
- Multi-Organization Workspaces
- Team Collaboration
- Automated Reporting
- PDF & CSV Exports

---

# Success Criteria

A reviewer should be able to:

✅ Register and Login

✅ Create a Project

✅ Draw and Save a Polygon Site

✅ View Geospatial Information

✅ Explore Environmental Metrics

✅ Analyze Performance Trends

✅ Understand Environmental Health Score

✅ Experience a polished production-ready GIS platform

---

# TerraPulse

### Measure. Monitor. Protect.