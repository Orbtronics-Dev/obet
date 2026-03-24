from typing import Optional
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from database.models.user import User


class UserDAO:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        return self.session.get(User, user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.session.query(User).filter(User.email == email).first()

    def create(self, email: str, password_hash: str, first_name: str, last_name: str) -> User:
        user = User(
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
        )
        self.session.add(user)
        self.session.flush()
        return user

    def get_balance(self, user_id: uuid.UUID) -> float:
        user = self.get_by_id(user_id)
        return float(user.balance) if user else 0.0

    def credit(self, user_id: uuid.UUID, amount: float) -> User:
        user = self.get_by_id(user_id)
        user.balance = float(user.balance) + amount
        return user

    def debit(self, user_id: uuid.UUID, amount: float) -> User:
        user = self.get_by_id(user_id)
        if float(user.balance) < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient balance",
            )
        user.balance = float(user.balance) - amount
        return user
