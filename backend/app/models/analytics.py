import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.base import Base


class Analytics(Base):
    __tablename__ = "site_analytics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(
        UUID(as_uuid=True),
        ForeignKey("sites.id", ondelete="CASCADE"),
        nullable=False,
    )
    carbon_score = Column(Float, nullable=False)
    biodiversity_score = Column(Float, nullable=False)
    soil_health = Column(Float, nullable=False)
    tree_coverage = Column(Float, nullable=False)
    recorded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    site = relationship("Site", back_populates="analytics")

    @property
    def health_index(self) -> float:
        """Environmental Health Index = (0.6 × Carbon) + (0.4 × Biodiversity)."""
        return round(0.6 * self.carbon_score + 0.4 * self.biodiversity_score, 2)

    @property
    def health_status(self) -> str:
        """Health status based on the Environmental Health Index."""
        index = self.health_index
        if index >= 80:
            return "Healthy"
        elif index >= 60:
            return "Moderate"
        return "Critical"

    def __repr__(self) -> str:
        return f"<Analytics site={self.site_id} health={self.health_index}>"
