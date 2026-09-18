from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    """Request body for creating a project."""

    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: str = Field(default="Active", max_length=50)


class ProjectUpdate(BaseModel):
    """Request body for updating a project. All fields optional."""

    name: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = None
    status: Optional[str] = Field(default=None, max_length=50)


class ProjectResponse(BaseModel):
    """Single project in API responses."""

    id: UUID
    name: str
    description: Optional[str] = None
    status: str
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    site_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    """Wrapper for project list responses."""

    success: bool = True
    message: str
    data: list[ProjectResponse]
