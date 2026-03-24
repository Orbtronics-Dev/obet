import uuid
from typing import Optional

from sqlalchemy.orm import Session

from database.models.wallet_transaction import (
    WalletTransaction,
    TransactionType,
    TransactionStatus,
)


class WalletDAO:
    def __init__(self, session: Session):
        self.session = session

    def create_transaction(
        self,
        user_id: uuid.UUID,
        type: TransactionType,
        amount: float,
        currency: str = "USD",
        status: TransactionStatus = TransactionStatus.PENDING,
        reference: Optional[str] = None,
        opay_session_id: Optional[str] = None,
    ) -> WalletTransaction:
        tx = WalletTransaction(
            user_id=user_id,
            type=type,
            amount=amount,
            currency=currency,
            status=status,
            reference=reference,
            opay_session_id=opay_session_id,
        )
        self.session.add(tx)
        self.session.flush()
        return tx

    def get_by_opay_session(self, session_id: str) -> Optional[WalletTransaction]:
        return (
            self.session.query(WalletTransaction)
            .filter(WalletTransaction.opay_session_id == session_id)
            .first()
        )

    def list_by_user(self, user_id: uuid.UUID, limit: int = 50) -> list[WalletTransaction]:
        return (
            self.session.query(WalletTransaction)
            .filter(WalletTransaction.user_id == user_id)
            .order_by(WalletTransaction.created_at.desc())
            .limit(limit)
            .all()
        )
