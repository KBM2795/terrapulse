# Import all models so SQLAlchemy discovers them for table creation
from app.models.activity_log import ActivityLog  # noqa: F401
from app.models.analytics import Analytics  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.site import Site  # noqa: F401
from app.models.user import User  # noqa: F401

__all__ = ["User", "Project", "Site", "Analytics", "ActivityLog"]
