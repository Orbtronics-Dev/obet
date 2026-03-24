from typing import Optional
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.schemas.market_schema import MarketListResponse, MarketResponse
from app.services.market_service import MarketService
from database.models.market import MarketCategory
from database.session import get_db

markets_router = APIRouter(prefix="/markets", tags=["Markets"])


@markets_router.get("", response_model=MarketListResponse)
def list_markets(
    category: Optional[MarketCategory] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_db),
):
    svc = MarketService(session)
    return svc.list_open(category=category, page=page, page_size=page_size)


@markets_router.get("/{market_id}", response_model=MarketResponse)
def get_market(market_id: uuid.UUID, session: Session = Depends(get_db)):
    svc = MarketService(session)
    return svc.get(market_id)
