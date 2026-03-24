import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.services.wallet_service import WalletService
from app.dao.wallet_dao import WalletDAO
from database.models.wallet_transaction import TransactionStatus
from database.session import get_db

logger = logging.getLogger(__name__)
webhooks_router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@webhooks_router.post("/opay")
async def handle_opay_webhook(request: Request, session: Session = Depends(get_db)):
    payload = await request.json()
    event = payload.get("event", "unknown")
    data = payload.get("data", {})

    logger.info(f"OPay webhook received: {event}")

    if event == "payment.succeeded":
        session_id = data.get("session_id") or data.get("payment_id")

        wallet_dao = WalletDAO(session)
        tx = wallet_dao.get_by_opay_session(session_id)

        if tx and tx.status == TransactionStatus.PENDING:
            svc = WalletService(session)
            svc.credit(
                user_id=tx.user_id,
                amount=float(tx.amount),
                opay_session_id=session_id,
            )
            logger.info(f"Credited {tx.amount} USD to user {tx.user_id} for session {session_id}")
        else:
            logger.warning(f"No pending transaction for session {session_id}")

    elif event == "webhook.test":
        logger.info("OPay webhook test ping received")

    return {"status": "ok"}
