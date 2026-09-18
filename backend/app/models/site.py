import uuid
from datetime import datetime, timezone

from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.base import Base


class Site(Base):
    __tablename__ = "sites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(200), nullable=False)
    geometry = Column(
        Geometry(geometry_type="POLYGON", srid=4326, from_text="ST_GeomFromEWKT"),
        nullable=True,
    )
    area = Column(Float, nullable=True)  # Area in hectares
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    project = relationship("Project", back_populates="sites")
    analytics = relationship(
        "Analytics", back_populates="site", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Site {self.name}>"
