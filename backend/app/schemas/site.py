from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class GeoJSONPolygon(BaseModel):
    """GeoJSON Polygon geometry accepted from the frontend map."""

    type: str = "Polygon"
    coordinates: list[list[list[float]]]


class SiteCreate(BaseModel):
    """Request body for creating a monitoring site."""

    project_id: UUID
    name: str = Field(..., min_length=1, max_length=200)
    geometry: GeoJSONPolygon


class SiteUpdate(BaseModel):
    """Request body for updating a site. All fields optional."""

    name: Optional[str] = Field(default=None, max_length=200)
    geometry: Optional[GeoJSONPolygon] = None


class SiteResponse(BaseModel):
    """Single site in API responses."""

    id: UUID
    project_id: UUID
    name: str
    geometry: Optional[dict[str, Any]] = None
    area: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
