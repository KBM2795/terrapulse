from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.activity_log import ActivityLog
from app.models.analytics import Analytics
from app.models.project import Project
from app.models.site import Site
from app.models.user import User
from app.schemas.analytics import AnalyticsCreate, AnalyticsResponse
from app.utils.response import error_response, success_response

router = APIRouter(prefix="/api/sites", tags=["Analytics"])


def _analytics_to_dict(record: Analytics) -> dict:
    """Convert an Analytics ORM instance to a response dict."""
    data = AnalyticsResponse(
        id=record.id,
        site_id=record.site_id,
        carbon_score=record.carbon_score,
        biodiversity_score=record.biodiversity_score,
        soil_health=record.soil_health,
        tree_coverage=record.tree_coverage,
        health_index=record.health_index,
        health_status=record.health_status,
        recorded_at=record.recorded_at,
    )
    return data.model_dump(mode="json")


@router.get("/{site_id}/analytics")
def get_site_analytics(
    site_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all analytics records for a site, ordered by date."""
    # Verify ownership
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.owner_id == current_user.id)
        .first()
    )
    if not site:
        return error_response("Site not found", status_code=404)

    records = (
        db.query(Analytics)
        .filter(Analytics.site_id == site_id)
        .order_by(Analytics.recorded_at.asc())
        .all()
    )

    return success_response(
        message="Analytics retrieved",
        data=[_analytics_to_dict(r) for r in records],
    )


@router.post("/{site_id}/analytics")
def create_site_analytics(
    site_id: UUID,
    body: AnalyticsCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new analytics record for a site."""
    # Verify ownership
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.owner_id == current_user.id)
        .first()
    )
    if not site:
        return error_response("Site not found", status_code=404)

    record = Analytics(
        site_id=site_id,
        carbon_score=body.carbon_score,
        biodiversity_score=body.biodiversity_score,
        soil_health=body.soil_health,
        tree_coverage=body.tree_coverage,
    )
    db.add(record)

    # Log activity
    activity = ActivityLog(
        project_id=site.project_id,
        event_type="ANALYTICS_GENERATED",
        description=f"Analytics recorded for site '{site.name}'",
    )
    db.add(activity)

    db.commit()
    db.refresh(record)

    return success_response(
        message="Analytics recorded successfully",
        data=_analytics_to_dict(record),
        status_code=201,
    )


MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@router.get("/{site_id}/analytics/history")
def get_analytics_history(
    site_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get analytics history formatted for chart rendering.

    Returns monthly data points with month labels — ready for Chart.js / Highcharts.
    """
    # Verify ownership
    site = (
        db.query(Site)
        .join(Project)
        .filter(Site.id == site_id, Project.owner_id == current_user.id)
        .first()
    )
    if not site:
        return error_response("Site not found", status_code=404)

    records = (
        db.query(Analytics)
        .filter(Analytics.site_id == site_id)
        .order_by(Analytics.recorded_at.asc())
        .all()
    )

    history = []
    for record in records:
        month_index = record.recorded_at.month - 1  # 0-based
        history.append({
            "month": MONTH_LABELS[month_index],
            "carbon_score": record.carbon_score,
            "biodiversity_score": record.biodiversity_score,
            "soil_health": record.soil_health,
            "tree_coverage": record.tree_coverage,
            "health_index": record.health_index,
            "health_status": record.health_status,
            "recorded_at": record.recorded_at.isoformat(),
        })

    return success_response(
        message="Analytics history retrieved",
        data=history,
    )

