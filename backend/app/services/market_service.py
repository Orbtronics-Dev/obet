from typing import Optional
import uuid
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.dao.market_dao import MarketDAO
from database.models.market import Market, MarketCategory


def compute_probability(total_yes: float, total_no: float) -> tuple[float, float]:
    total = total_yes + total_no
    if total == 0:
        return 0.5, 0.5
    yes_prob = total_yes / total
    return round(yes_prob, 4), round(1 - yes_prob, 4)


def market_to_response(market: Market) -> dict:
    yes_prob, no_prob = compute_probability(
        float(market.total_yes_amount), float(market.total_no_amount)
    )
    return {
        "id": market.id,
        "title": market.title,
        "description": market.description,
        "category": market.category,
        "status": market.status,
        "resolution_date": market.resolution_date,
        "outcome": market.outcome,
        "total_yes_amount": float(market.total_yes_amount),
        "total_no_amount": float(market.total_no_amount),
        "yes_probability": yes_prob,
        "no_probability": no_prob,
        "creator_id": market.creator_id,
        "created_at": market.created_at,
    }


class MarketService:
    def __init__(self, session: Session):
        self.session = session
        self.market_dao = MarketDAO(session)

    def create(
        self,
        title: str,
        description: str,
        category: MarketCategory,
        resolution_date: datetime,
        creator_id: uuid.UUID,
    ) -> dict:
        from app.settings import get_settings
        settings = get_settings()
        market = self.market_dao.create(
            title=title,
            description=description,
            category=category,
            resolution_date=resolution_date,
            creator_id=creator_id,
            platform_fee_pct=settings.PLATFORM_FEE_PCT,
        )
        self.session.commit()
        return market_to_response(market)

    def get(self, market_id: uuid.UUID) -> dict:
        market = self.market_dao.get_by_id(market_id)
        if not market:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market not found")
        return market_to_response(market)

    def list_open(
        self,
        category: Optional[MarketCategory] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        items, total = self.market_dao.list_open(category=category, page=page, page_size=page_size)
        return {
            "items": [market_to_response(m) for m in items],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
