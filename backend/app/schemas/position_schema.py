from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
import uuid
from database.models.position import PositionSide, PositionStatus


class PlaceBetRequest(BaseModel):
    side: PositionSide
    amount: float

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v


class PositionResponse(BaseModel):
    id: uuid.UUID
    market_id: uuid.UUID
    user_id: uuid.UUID
    side: PositionSide
    amount: float
    status: PositionStatus
    payout: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True
