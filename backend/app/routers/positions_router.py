import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dao.position_dao import PositionDAO
from app.guards.auth_guard import get_current_user
from app.schemas.position_schema import PlaceBetRequest, PositionResponse
from app.services.betting_service import BettingService
from database.session import get_db

positions_router = APIRouter(tags=["Positions"])


@positions_router.post("/markets/{market_id}/positions", response_model=PositionResponse)
def place_bet(
    market_id: uuid.UUID,
    body: PlaceBetRequest,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    svc = BettingService(session)
    return svc.place_bet(
        user_id=current_user["user_id"],
        market_id=market_id,
        side=body.side,
        amount=body.amount,
    )


@positions_router.get("/positions", response_model=list[PositionResponse])
def list_positions(
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    dao = PositionDAO(session)
    positions = dao.list_by_user(current_user["user_id"])
    return [
        {
            "id": p.id,
            "market_id": p.market_id,
            "user_id": p.user_id,
            "side": p.side,
            "amount": float(p.amount),
            "status": p.status,
            "payout": float(p.payout) if p.payout is not None else None,
            "created_at": p.created_at,
        }
        for p in positions
    ]
