import random
import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.models.analytics import Analytics
from app.models.project import Project
from app.models.site import Site
from app.utils.geo import geojson_to_wkb_element, calculate_area_hectares


# Realistic demo data for hackathon reviewers
DEMO_PROJECTS = [
    {
        "name": "Amazon Rainforest Conservation",
        "description": "Carbon sequestration and biodiversity monitoring across protected zones in the Amazon basin.",
        "status": "Active",
        "sites": [
            {
                "name": "Amazon Plot Alpha",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-47.92, -15.78], [-47.88, -15.78],
                        [-47.88, -15.74], [-47.92, -15.74],
                        [-47.92, -15.78],
                    ]],
                },
            },
            {
                "name": "Amazon Plot Beta",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-47.85, -15.82], [-47.80, -15.82],
                        [-47.80, -15.77], [-47.85, -15.77],
                        [-47.85, -15.82],
                    ]],
                },
            },
        ],
    },
    {
        "name": "Sundarbans Mangrove Restoration",
        "description": "Mangrove ecosystem restoration and blue carbon monitoring in the Sundarbans delta.",
        "status": "Active",
        "sites": [
            {
                "name": "Sundarbans Zone 1",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [88.56, 21.94], [88.62, 21.94],
                        [88.62, 21.99], [88.56, 21.99],
                        [88.56, 21.94],
                    ]],
                },
            },
        ],
    },
    {
        "name": "Black Forest Reforestation",
        "description": "Native species reforestation and soil health recovery in Germany's Black Forest region.",
        "status": "Planning",
        "sites": [
            {
                "name": "Black Forest Site A",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [8.10, 48.00], [8.15, 48.00],
                        [8.15, 48.04], [8.10, 48.04],
                        [8.10, 48.00],
                    ]],
                },
            },
        ],
    },
]

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _generate_monthly_analytics(
    site_id: uuid.UUID,
    base_carbon: float,
    base_biodiversity: float,
    base_soil: float,
    base_tree: float,
) -> list[Analytics]:
    """Generate 12 months of realistic environmental analytics with upward trends."""
    records = []
    now = datetime.now(timezone.utc)

    for i in range(12):
        # Simulate gradual improvement with some variance
        month_offset = i
        trend = i * random.uniform(0.3, 1.2)
        noise = random.uniform(-3, 3)

        carbon = min(100, max(0, base_carbon + trend + noise))
        biodiversity = min(100, max(0, base_biodiversity + trend * 0.8 + random.uniform(-2, 2)))
        soil = min(100, max(0, base_soil + trend * 0.5 + random.uniform(-1.5, 1.5)))
        tree = min(100, max(0, base_tree + trend * 0.6 + random.uniform(-2, 3)))

        recorded_at = now - timedelta(days=(11 - i) * 30)

        records.append(Analytics(
            site_id=site_id,
            carbon_score=round(carbon, 1),
            biodiversity_score=round(biodiversity, 1),
            soil_health=round(soil, 1),
            tree_coverage=round(tree, 1),
            recorded_at=recorded_at,
        ))

    return records


def seed_demo_data(db: Session, owner_id: uuid.UUID) -> dict:
    """Seed the database with realistic demo projects, sites, and analytics.

    Returns a summary of what was created.
    """
    created_projects = 0
    created_sites = 0
    created_analytics = 0

    for project_data in DEMO_PROJECTS:
        # Create project
        project = Project(
            name=project_data["name"],
            description=project_data["description"],
            status=project_data["status"],
            owner_id=owner_id,
        )
        db.add(project)
        db.flush()
        created_projects += 1

        db.add(ActivityLog(
            project_id=project.id,
            event_type="PROJECT_CREATED",
            description=f"Project '{project.name}' was created (seed data)",
        ))

        # Create sites with polygons
        for site_data in project_data["sites"]:
            wkb = geojson_to_wkb_element(site_data["geometry"])
            site = Site(
                project_id=project.id,
                name=site_data["name"],
                geometry=wkb,
            )
            db.add(site)
            db.flush()

            # Calculate area via PostGIS
            site.area = calculate_area_hectares(db, site.id)
            created_sites += 1

            db.add(ActivityLog(
                project_id=project.id,
                event_type="SITE_ADDED",
                description=f"Site '{site.name}' was added (seed data)",
            ))

            # Generate 12 months of analytics
            base_carbon = random.uniform(55, 80)
            base_bio = random.uniform(50, 75)
            base_soil = random.uniform(60, 85)
            base_tree = random.uniform(40, 70)

            analytics_records = _generate_monthly_analytics(
                site.id, base_carbon, base_bio, base_soil, base_tree
            )
            db.add_all(analytics_records)
            created_analytics += len(analytics_records)

            db.add(ActivityLog(
                project_id=project.id,
                event_type="ANALYTICS_GENERATED",
                description=f"12 months of analytics seeded for site '{site.name}'",
            ))

    db.commit()

    return {
        "projects_created": created_projects,
        "sites_created": created_sites,
        "analytics_records_created": created_analytics,
    }
