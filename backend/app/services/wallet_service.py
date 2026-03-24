import uuid

from sqlalchemy.orm import Session

from app.dao.user_dao import UserDAO
from app.dao.wallet_dao import WalletDAO
from database.models.wallet_transaction import TransactionType, TransactionStatus


class WalletService:
    def __init__(self, session: Session):
        self.session = session
        self.user_dao = UserDAO(session)
        self.wallet_dao = WalletDAO(session)

    def get_wallet(self, user_id: uuid.UUID) -> dict:
        balance = self.user_dao.get_balance(user_id)
        recent = self.wallet_dao.list_by_user(user_id, limit=10)
        return {
            "balance": balance,
            "currency": "USD",
            "recent_transactions": [
                {
                    "id": tx.id,
                    "type": tx.type,
                    "amount": float(tx.amount),
                    "currency": tx.currency,
                    "status": tx.status,
                    "reference": tx.reference,
                    "created_at": tx.created_at,
                }
                for tx in recent
            ],
        }

    def get_transactions(self, user_id: uuid.UUID) -> list:
        txs = self.wallet_dao.list_by_user(user_id, limit=100)
        return [
            {
                "id": tx.id,
                "type": tx.type,
                "amount": float(tx.amount),
                "currency": tx.currency,
                "status": tx.status,
                "reference": tx.reference,
                "created_at": tx.created_at,
            }
            for tx in txs
        ]

    def credit(self, user_id: uuid.UUID, amount: float, opay_session_id: str) -> None:
        existing = self.wallet_dao.get_by_opay_session(opay_session_id)
        if existing and existing.status == TransactionStatus.COMPLETED:
            return  # idempotent

        self.user_dao.credit(user_id, amount)

        if existing:
            existing.status = TransactionStatus.COMPLETED
        else:
            self.wallet_dao.create_transaction(
                user_id=user_id,
                type=TransactionType.DEPOSIT,
                amount=amount,
                status=TransactionStatus.COMPLETED,
                opay_session_id=opay_session_id,
            )

        self.session.commit()
