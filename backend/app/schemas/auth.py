from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    """Request body for user registration."""

    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=72)


class LoginRequest(BaseModel):
    """Request body for user login."""

    email: str
    password: str


class TokenResponse(BaseModel):
    """JWT token returned after successful auth."""

    access_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    """Full auth response with token and user profile."""

    success: bool = True
    message: str
    data: dict
