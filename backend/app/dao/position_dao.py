from typing import Optional
import uuid

from sqlalchemy.orm import Session

from database.models.position import Position, PositionSide, PositionStatus


class PositionDAO:
    def __init__(self, session: Session):
        self.session = session

    def create(
        self,
        user_id: uuid.UUID,
        market_id: uuid.UUID,
        side: PositionSide,
        amount: float,
    ) -> Position:
        pos = Position(user_id=user_id, market_id=market_id, side=side, amount=amount)
        self.session.add(pos)
        self.session.flush()
        return pos

    def list_by_user(self, user_id: uuid.UUID) -> list[Position]:
        return (
            self.session.query(Position)
            .filter(Position.user_id == user_id)
            .order_by(Position.created_at.desc())
            .all()
        )

    def list_open_by_market_and_side(
        self, market_id: uuid.UUID, side: PositionSide
    ) -> list[Position]:
        return (
            self.session.query(Position)
            .filter(
                Position.market_id == market_id,
                Position.side == side,
                Position.status == PositionStatus.OPEN,
            )
            .all()
        )
