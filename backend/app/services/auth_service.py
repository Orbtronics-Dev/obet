from datetime import datetime, timedelta
from typing import Optional
import uuid

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.dao.user_dao import UserDAO
from app.settings import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(data: dict, secret: str, algorithm: str, expires_delta: timedelta) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + expires_delta
    return jwt.encode(payload, secret, algorithm=algorithm)


class AuthService:
    def __init__(self, session: Session):
        self.session = session
        self.settings = get_settings()
        self.user_dao = UserDAO(session)

    def register(self, email: str, password: str, first_name: str, last_name: str):
        existing = self.user_dao.get_by_email(email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        password_hash = hash_password(password)
        user = self.user_dao.create(
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
        )
        self.session.commit()
        return user

    def login(self, email: str, password: str) -> tuple[str, str]:
        user = self.user_dao.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account inactive",
            )

        access_token = create_token(
            {"sub": str(user.id), "email": user.email, "type": "access"},
            self.settings.JWT_SECRET,
            self.settings.JWT_ALGORITHM,
            timedelta(minutes=self.settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        refresh_token = create_token(
            {"sub": str(user.id), "type": "refresh"},
            self.settings.JWT_SECRET,
            self.settings.JWT_ALGORITHM,
            timedelta(days=self.settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )
        return access_token, refresh_token

    def refresh(self, refresh_token: str) -> str:
        try:
            payload = jwt.decode(
                refresh_token,
                self.settings.JWT_SECRET,
                algorithms=[self.settings.JWT_ALGORITHM],
            )
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )

        user_id = uuid.UUID(payload["sub"])
        user = self.user_dao.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )

        return create_token(
            {"sub": str(user.id), "email": user.email, "type": "access"},
            self.settings.JWT_SECRET,
            self.settings.JWT_ALGORITHM,
            timedelta(minutes=self.settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
