from typing import Optional
import uuid

from sqlalchemy.orm import Session

from database.models.market import Market, MarketCategory, MarketStatus


class MarketDAO:
    def __init__(self, session: Session):
        self.session = session

    def get_by_id(self, market_id: uuid.UUID) -> Optional[Market]:
        return self.session.get(Market, market_id)

    def list_open(
        self,
        category: Optional[MarketCategory] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Market], int]:
        q = self.session.query(Market).filter(Market.status == MarketStatus.OPEN)
        if category:
            q = q.filter(Market.category == category)
        total = q.count()
        items = (
            q.order_by(Market.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return items, total

    def create(
        self,
        title: str,
        description: str,
        category: MarketCategory,
        resolution_date,
        creator_id: uuid.UUID,
        platform_fee_pct: int = 2,
    ) -> Market:
        market = Market(
            title=title,
            description=description,
            category=category,
            resolution_date=resolution_date,
            creator_id=creator_id,
            platform_fee_pct=platform_fee_pct,
        )
        self.session.add(market)
        self.session.flush()
        return market
