from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.guards.auth_guard import get_current_user
from app.schemas.auth_schema import (
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from database.session import get_db

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, session: Session = Depends(get_db)):
    svc = AuthService(session)
    return svc.register(
        email=body.email,
        password=body.password,
        first_name=body.first_name,
        last_name=body.last_name,
    )


@auth_router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, session: Session = Depends(get_db)):
    svc = AuthService(session)
    access_token, refresh_token = svc.login(email=body.email, password=body.password)
    return LoginResponse(access_token=access_token, refresh_token=refresh_token)


@auth_router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, session: Session = Depends(get_db)):
    svc = AuthService(session)
    access_token = svc.refresh(body.refresh_token)
    return TokenResponse(access_token=access_token)


@auth_router.get("/me", response_model=UserResponse)
def me(current_user: dict = Depends(get_current_user)):
    return current_user["user"]
