from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AnalyticsCreate(BaseModel):
    """Request body for creating site analytics."""

    carbon_score: float = Field(..., ge=0, le=100)
    biodiversity_score: float = Field(..., ge=0, le=100)
    soil_health: float = Field(..., ge=0, le=100)
    tree_coverage: float = Field(..., ge=0, le=100)


class AnalyticsResponse(BaseModel):
    """Single analytics record in API responses."""

    id: UUID
    site_id: UUID
    carbon_score: float
    biodiversity_score: float
    soil_health: float
    tree_coverage: float
    health_index: float
    health_status: str
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)
