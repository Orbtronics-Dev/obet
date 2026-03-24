import enum
import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID

from database.base import Base


class MarketCategory(str, enum.Enum):
    POLITICS = "POLITICS"
    SPORTS = "SPORTS"
    CRYPTO = "CRYPTO"
    LOCAL = "LOCAL"
    OTHER = "OTHER"


class MarketStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    RESOLVED = "RESOLVED"
    CANCELLED = "CANCELLED"


class MarketOutcome(str, enum.Enum):
    YES = "YES"
    NO = "NO"


class Market(Base):
    __tablename__ = "markets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(MarketCategory), nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(MarketStatus), default=MarketStatus.OPEN, nullable=False)
    resolution_date = Column(DateTime, nullable=False)
    closed_at = Column(DateTime, nullable=True)
    outcome = Column(Enum(MarketOutcome), nullable=True)
    total_yes_amount = Column(Numeric(precision=18, scale=8), default=0, nullable=False)
    total_no_amount = Column(Numeric(precision=18, scale=8), default=0, nullable=False)
    platform_fee_pct = Column(Integer, default=2, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
