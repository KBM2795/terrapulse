from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.activity_log import ActivityLog
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.utils.response import error_response, success_response

router = APIRouter(prefix="/api/projects", tags=["Projects"])


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


def _project_to_dict(project: Project) -> dict:
    """Convert a Project ORM instance to a response dict with site_count."""
    data = ProjectResponse.model_validate(project).model_dump(mode="json")
    data["site_count"] = len(project.sites) if project.sites else 0
    return data


@router.get("")
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all projects owned by the current user."""
    projects = (
        db.query(Project)
        .filter(Project.owner_id == current_user.id)
        .order_by(Project.created_at.desc())
        .all()
    )
    return success_response(
        message="Projects retrieved",
        data=[_project_to_dict(p) for p in projects],
    )


@router.get("/{project_id}")
def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single project by ID."""
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        return error_response("Project not found", status_code=404)

    return success_response(
        message="Project retrieved",
        data=_project_to_dict(project),
    )


@router.post("")
def create_project(
    body: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new environmental project."""
    project = Project(
        name=body.name,
        description=body.description,
        status=body.status,
        owner_id=current_user.id,
    )
    db.add(project)
    db.flush()

    _log_activity(
        db,
        project.id,
        "PROJECT_CREATED",
        f"Project '{project.name}' was created",
    )

    db.commit()
    db.refresh(project)

    return success_response(
        message="Project created successfully",
        data=_project_to_dict(project),
        status_code=201,
    )


@router.put("/{project_id}")
def update_project(
    project_id: UUID,
    body: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing project."""
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        return error_response("Project not found", status_code=404)

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)

    project.updated_at = datetime.now(timezone.utc)

    _log_activity(
        db,
        project.id,
        "PROJECT_UPDATED",
        f"Project '{project.name}' was updated",
    )

    db.commit()
    db.refresh(project)

    return success_response(
        message="Project updated successfully",
        data=_project_to_dict(project),
    )


@router.delete("/{project_id}")
def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a project and all associated sites, analytics, and logs."""
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.owner_id == current_user.id)
        .first()
    )
    if not project:
        return error_response("Project not found", status_code=404)

    project_name = project.name
    db.delete(project)
    db.commit()

    return success_response(message=f"Project '{project_name}' deleted successfully")
