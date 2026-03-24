import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID

from database.base import Base


class PositionSide(str, enum.Enum):
    YES = "YES"
    NO = "NO"


class PositionStatus(str, enum.Enum):
    OPEN = "OPEN"
    WON = "WON"
    LOST = "LOST"
    CANCELLED = "CANCELLED"


class Position(Base):
    __tablename__ = "positions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    market_id = Column(UUID(as_uuid=True), ForeignKey("markets.id"), nullable=False, index=True)
    side = Column(Enum(PositionSide), nullable=False)
    amount = Column(Numeric(precision=18, scale=8), nullable=False)
    status = Column(Enum(PositionStatus), default=PositionStatus.OPEN, nullable=False)
    payout = Column(Numeric(precision=18, scale=8), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
