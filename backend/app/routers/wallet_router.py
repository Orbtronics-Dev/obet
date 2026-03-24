from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.guards.auth_guard import get_current_user
from app.schemas.wallet_schema import (
    DepositRequest,
    DepositResponse,
    TransactionResponse,
    WalletDetailResponse,
)
from app.services.opay_service import create_checkout_session
from app.services.wallet_service import WalletService
from app.dao.wallet_dao import WalletDAO
from database.models.wallet_transaction import TransactionType, TransactionStatus
from database.session import get_db
from app.settings import get_settings

wallet_router = APIRouter(prefix="/wallet", tags=["Wallet"])


@wallet_router.get("", response_model=WalletDetailResponse)
def get_wallet(
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    svc = WalletService(session)
    return svc.get_wallet(current_user["user_id"])


@wallet_router.post("/deposit", response_model=DepositResponse)
async def create_deposit(
    body: DepositRequest,
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    settings = get_settings()
    user = current_user["user"]

    success_url = body.success_url or f"{settings.FRONTEND_URL}/wallet/success"
    cancel_url = body.cancel_url or f"{settings.FRONTEND_URL}/wallet/cancel"

    try:
        result = await create_checkout_session(
            user_email=user.email,
            user_name=f"{user.first_name} {user.last_name}",
            amount_usd=body.amount_usd,
            success_url=success_url,
            cancel_url=cancel_url,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Payment gateway error: {e}",
        )

    wallet_dao = WalletDAO(session)
    wallet_dao.create_transaction(
        user_id=current_user["user_id"],
        type=TransactionType.DEPOSIT,
        amount=body.amount_usd,
        status=TransactionStatus.PENDING,
        opay_session_id=result["session_id"],
    )
    session.commit()

    return DepositResponse(checkout_url=result["checkout_url"], session_id=result["session_id"])


@wallet_router.get("/transactions", response_model=list[TransactionResponse])
def get_transactions(
    current_user: dict = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    svc = WalletService(session)
    return svc.get_transactions(current_user["user_id"])
