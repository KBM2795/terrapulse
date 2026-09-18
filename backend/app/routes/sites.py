from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.activity_log import ActivityLog
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.site import SiteCreate, SiteUpdate
from app.utils.geo import (
    calculate_area_hectares,
    geojson_to_wkb_element,
    get_geometry_geojson,
)
from app.utils.response import error_response, success_response

router = APIRouter(prefix="/api/sites", tags=["Sites"])


def _log_activity(
    db: Session, project_id: UUID, event_type: str, description: str
) -> None:
    """Create an activity log entry."""
    log = ActivityLog(
        project_id=project_id,
        event_type=event_type,
        description=description,
    )
    db.add(log)


def _site_to_dict(db: Session, site: Site) -> dict:
    """Convert a Site ORM instance to a response dict with GeoJSON geometry."""
    return {
        "id": str(site.id),
        "project_id": str(site.project_id),
        "name": site.name,
        "geometry": get_geometry_geojson(db, site.id),
        "area": site.area,
        "created_at": site.created_at.isoformat() if site.created_at else None,
    }


@router.get("")
def list_sites(
    project_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all sites, optionally filtered by project_id."""
    query = (
        db.query(Site)
        .join(Project)
        .filter(Project.owner_id == current_user.id)
    )

    if project_id:
        query = query.filter(Site.project_id == project_id)

    sites = query.order_by(Site.created_at.desc()).all()

    return success_response(
        message="Sites retrieved",
        data=[_site_to_dict(db, s) for s in sites],
    )


@router.get("/{site_id}")
def get_site(
    site_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single site by ID."""
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.owner_id == current_user.id)
        .first()
    )
    if not site:
        return error_response("Site not found", status_code=404)

    return success_response(
        message="Site retrieved",
        data=_site_to_dict(db, site),
    )


@router.post("")
def create_site(
    body: SiteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new monitoring site with polygon geometry."""
    # Verify user owns the project
    project = (
        db.query(Project)
        .filter(Project.id == body.project_id, Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        return error_response("Project not found", status_code=404)

    # Convert GeoJSON to PostGIS geometry
    geojson_dict = body.geometry.model_dump()
    wkb_element = geojson_to_wkb_element(geojson_dict)

    site = Site(
        project_id=body.project_id,
        name=body.name,
        geometry=wkb_element,
    )
    db.add(site)
    db.flush()

    # Calculate area using PostGIS
    site.area = calculate_area_hectares(db, site.id)

    _log_activity(
        db,
        project.id,
        "SITE_ADDED",
        f"Site '{site.name}' was added to project '{project.name}'",
    )

    db.commit()
    db.refresh(site)

    return success_response(
        message="Site created successfully",
        data=_site_to_dict(db, site),
        status_code=201,
    )


@router.put("/{site_id}")
def update_site(
    site_id: UUID,
    body: SiteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a site's name or polygon geometry."""
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.owner_id == current_user.id)
        .first()
    )
    if not site:
        return error_response("Site not found", status_code=404)

    if body.name is not None:
        site.name = body.name

    if body.geometry is not None:
        geojson_dict = body.geometry.model_dump()
        site.geometry = geojson_to_wkb_element(geojson_dict)
        db.flush()
        site.area = calculate_area_hectares(db, site.id)

        _log_activity(
            db,
            site.project_id,
            "POLYGON_UPDATED",
            f"Polygon for site '{site.name}' was updated",
        )
    else:
        _log_activity(
            db,
            site.project_id,
            "SITE_UPDATED",
            f"Site '{site.name}' was updated",
        )

    db.commit()
    db.refresh(site)

    return success_response(
        message="Site updated successfully",
        data=_site_to_dict(db, site),
    )


@router.delete("/{site_id}")
def delete_site(
    site_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a monitoring site."""
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.owner_id == current_user.id)
        .first()
    )
    if not site:
        return error_response("Site not found", status_code=404)

    site_name = site.name
    project_id = site.project_id

    _log_activity(
        db,
        project_id,
        "SITE_DELETED",
        f"Site '{site_name}' was deleted",
    )

    db.delete(site)
    db.commit()

    return success_response(message=f"Site '{site_name}' deleted successfully")
