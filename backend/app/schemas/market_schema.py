from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from database.models.market import MarketCategory, MarketStatus, MarketOutcome


class MarketCreate(BaseModel):
    title: str
    description: str
    category: MarketCategory
    resolution_date: datetime


class MarketResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    category: MarketCategory
    status: MarketStatus
    resolution_date: datetime
    outcome: Optional[MarketOutcome]
    total_yes_amount: float
    total_no_amount: float
    yes_probability: float
    no_probability: float
    creator_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class MarketListResponse(BaseModel):
    items: list[MarketResponse]
    total: int
    page: int
    page_size: int
