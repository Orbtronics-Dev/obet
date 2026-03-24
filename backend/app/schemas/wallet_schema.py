from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from database.models.wallet_transaction import TransactionType, TransactionStatus


class WalletResponse(BaseModel):
    balance: float
    currency: str = "USD"


class DepositRequest(BaseModel):
    amount_usd: float
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class DepositResponse(BaseModel):
    checkout_url: str
    session_id: str


class TransactionResponse(BaseModel):
    id: uuid.UUID
    type: TransactionType
    amount: float
    currency: str
    status: TransactionStatus
    reference: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class WalletDetailResponse(BaseModel):
    balance: float
    currency: str
    recent_transactions: list[TransactionResponse]
