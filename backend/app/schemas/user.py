from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserResponse(BaseModel):
    """Public user profile returned in API responses."""

    id: UUID
    name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
