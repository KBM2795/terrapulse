from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.database.connection import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.user import ChangePasswordRequest, UserResponse, UserUpdateRequest
from app.utils.response import error_response, success_response

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        return error_response("Email already registered", status_code=409)

    # Create user
    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    token = create_access_token({"sub": str(user.id)})

    return success_response(
        message="Registration successful",
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user).model_dump(mode="json"),
        },
        status_code=201,
    )


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not verify_password(body.password, user.password_hash):
        return error_response("Invalid email or password", status_code=401)

    token = create_access_token({"sub": str(user.id)})

    return success_response(
        message="Login successful",
        data={
            "access_token": token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user).model_dump(mode="json"),
        },
    )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return success_response(
        message="User profile retrieved",
        data=UserResponse.model_validate(current_user).model_dump(mode="json"),
    )


@router.put("/profile")
def update_profile(
    body: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update authenticated user profile information."""
    if body.email and body.email != current_user.email:
        existing = (
            db.query(User)
            .filter(User.email == body.email, User.id != current_user.id)
            .first()
        )
        if existing:
            return error_response("Email address is already in use", status_code=409)
        current_user.email = body.email

    if body.name is not None and body.name.strip():
        current_user.name = body.name.strip()

    db.commit()
    db.refresh(current_user)

    return success_response(
        message="Profile updated successfully",
        data=UserResponse.model_validate(current_user).model_dump(mode="json"),
    )


@router.put("/password")
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update authenticated user account password."""
    if not verify_password(body.current_password, current_user.password_hash):
        return error_response("Current password is incorrect", status_code=400)

    if len(body.new_password) < 6:
        return error_response(
            "New password must be at least 6 characters", status_code=400
        )

    current_user.password_hash = hash_password(body.new_password)
    db.commit()

    return success_response(message="Password changed successfully")

