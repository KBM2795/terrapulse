from contextlib import asynccontextmanager

from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.base import Base
from app.database.connection import SessionLocal, engine, get_db
from app.models import ActivityLog, Analytics, Project, Site, User  # noqa: F401
from app.models.user import User as UserModel
from app.routes import analytics as analytics_routes
from app.routes import auth as auth_routes
from app.routes import projects as project_routes
from app.routes import sites as site_routes
from app.services.seed_service import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    # Ensure PostGIS extension is enabled
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        conn.commit()

    # Create all tables
    Base.metadata.create_all(bind=engine)

    yield


app = FastAPI(
    title="TerraPulse API",
    description="Environmental Intelligence Platform — Geospatial analytics for carbon sequestration, biodiversity performance, and ecosystem health.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://terrapulse-one.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_routes.router)
app.include_router(project_routes.router)
app.include_router(site_routes.router)
app.include_router(analytics_routes.router)


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    """Root endpoint."""
    return {
        "success": True,
        "message": "TerraPulse API is running",
        "version": "1.0.0",
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check with database connectivity — useful for Render deployment."""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return {
        "success": db_status == "connected",
        "status": "healthy" if db_status == "connected" else "unhealthy",
        "database": db_status,
    }


# ---------------------------------------------------------------------------
# Seed Endpoint
# ---------------------------------------------------------------------------
@app.post("/api/dev/seed", tags=["Dev Tools"])
def seed_database(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Seed the database with demo projects, sites, and 12 months of analytics.

    Requires authentication so the seeded data belongs to the logged-in user.
    Reviewers can call this once to populate the platform instantly.
    """
    result = seed_demo_data(db, owner_id=current_user.id)

    return {
        "success": True,
        "message": "Demo data seeded successfully",
        "data": result,
    }


@app.delete("/api/dev/reset", tags=["Dev Tools"])
def reset_database(
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reset all data for the current user — wipes projects, sites, analytics, and logs.

    The user account itself is preserved. Useful for re-seeding or starting fresh.
    """
    from app.models.activity_log import ActivityLog as AL
    from app.models.analytics import Analytics as AN
    from app.models.project import Project as PR
    from app.models.site import Site as SI

    # Get all project IDs owned by this user
    project_ids = [
        p.id for p in db.query(PR).filter(PR.owner_id == current_user.id).all()
    ]

    if project_ids:
        # Delete in correct order to respect foreign keys
        site_ids = [
            s.id for s in db.query(SI).filter(SI.project_id.in_(project_ids)).all()
        ]

        if site_ids:
            db.query(AN).filter(AN.site_id.in_(site_ids)).delete(
                synchronize_session=False
            )

        db.query(SI).filter(SI.project_id.in_(project_ids)).delete(
            synchronize_session=False
        )
        db.query(AL).filter(AL.project_id.in_(project_ids)).delete(
            synchronize_session=False
        )
        db.query(PR).filter(PR.owner_id == current_user.id).delete(
            synchronize_session=False
        )
        db.commit()

    return {
        "success": True,
        "message": "All data reset successfully. Your account is preserved.",
    }


# ---------------------------------------------------------------------------
# Activities
# ---------------------------------------------------------------------------
@app.get("/api/activities", tags=["Activities"])
def get_activities():
    """Get recent activity timeline across all projects."""
    db = SessionLocal()
    try:
        logs = (
            db.query(ActivityLog)
            .order_by(ActivityLog.created_at.desc())
            .limit(50)
            .all()
        )
        data = [
            {
                "id": str(log.id),
                "project_id": str(log.project_id),
                "event_type": log.event_type,
                "description": log.description,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ]
        return {"success": True, "message": "Activities retrieved", "data": data}
    finally:
        db.close()
