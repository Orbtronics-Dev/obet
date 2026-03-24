import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.guards.admin_guard import get_admin_user
from app.schemas.market_schema import MarketCreate, MarketResponse
from app.services.betting_service import BettingService
from app.services.market_service import MarketService
from database.models.market import MarketOutcome
from database.session import get_db

admin_router = APIRouter(prefix="/admin", tags=["Admin"])


class ResolveRequest(BaseModel):
    outcome: MarketOutcome


@admin_router.post("/markets", response_model=MarketResponse)
def create_market(
    body: MarketCreate,
    current_user: dict = Depends(get_admin_user),
    session: Session = Depends(get_db),
):
    svc = MarketService(session)
    return svc.create(
        title=body.title,
        description=body.description,
        category=body.category,
        resolution_date=body.resolution_date,
        creator_id=current_user["user_id"],
    )


@admin_router.post("/markets/{market_id}/resolve")
def resolve_market(
    market_id: uuid.UUID,
    body: ResolveRequest,
    current_user: dict = Depends(get_admin_user),
    session: Session = Depends(get_db),
):
    svc = BettingService(session)
    return svc.resolve_market(market_id=market_id, outcome=body.outcome)
