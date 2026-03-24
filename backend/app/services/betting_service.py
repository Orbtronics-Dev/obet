import uuid
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.dao.market_dao import MarketDAO
from app.dao.position_dao import PositionDAO
from app.dao.user_dao import UserDAO
from app.dao.wallet_dao import WalletDAO
from database.models.market import MarketStatus, MarketOutcome
from database.models.position import PositionSide, PositionStatus
from database.models.wallet_transaction import TransactionType, TransactionStatus


class BettingService:
    def __init__(self, session: Session):
        self.session = session
        self.market_dao = MarketDAO(session)
        self.position_dao = PositionDAO(session)
        self.user_dao = UserDAO(session)
        self.wallet_dao = WalletDAO(session)

    def place_bet(
        self,
        user_id: uuid.UUID,
        market_id: uuid.UUID,
        side: PositionSide,
        amount: float,
    ) -> dict:
        market = self.market_dao.get_by_id(market_id)
        if not market:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market not found")
        if market.status != MarketStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Market is not open"
            )

        # Atomic: debit wallet, update pool, create position
        self.user_dao.debit(user_id, amount)

        if side == PositionSide.YES:
            market.total_yes_amount = float(market.total_yes_amount) + amount
        else:
            market.total_no_amount = float(market.total_no_amount) + amount

        position = self.position_dao.create(
            user_id=user_id, market_id=market_id, side=side, amount=amount
        )

        self.wallet_dao.create_transaction(
            user_id=user_id,
            type=TransactionType.BET,
            amount=amount,
            status=TransactionStatus.COMPLETED,
            reference=str(position.id),
        )

        self.session.commit()
        return {
            "id": position.id,
            "market_id": position.market_id,
            "user_id": position.user_id,
            "side": position.side,
            "amount": float(position.amount),
            "status": position.status,
            "payout": position.payout,
            "created_at": position.created_at,
        }

    def resolve_market(self, market_id: uuid.UUID, outcome: MarketOutcome) -> dict:
        market = self.market_dao.get_by_id(market_id)
        if not market:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market not found")
        if market.status != MarketStatus.OPEN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Market is not open"
            )

        total_yes = float(market.total_yes_amount)
        total_no = float(market.total_no_amount)
        total_pool = total_yes + total_no
        fee_pct = market.platform_fee_pct / 100
        prize_pool = total_pool * (1 - fee_pct)

        winning_side = PositionSide.YES if outcome == MarketOutcome.YES else PositionSide.NO
        losing_side = PositionSide.NO if winning_side == PositionSide.YES else PositionSide.YES
        winning_total = total_yes if winning_side == PositionSide.YES else total_no

        winners = self.position_dao.list_open_by_market_and_side(market_id, winning_side)
        losers = self.position_dao.list_open_by_market_and_side(market_id, losing_side)

        for pos in losers:
            pos.status = PositionStatus.LOST

        for pos in winners:
            if winning_total > 0:
                payout = (float(pos.amount) / winning_total) * prize_pool
            else:
                payout = float(pos.amount)

            pos.payout = payout
            pos.status = PositionStatus.WON

            self.user_dao.credit(pos.user_id, payout)
            self.wallet_dao.create_transaction(
                user_id=pos.user_id,
                type=TransactionType.PAYOUT,
                amount=payout,
                status=TransactionStatus.COMPLETED,
                reference=str(pos.id),
            )

        market.status = MarketStatus.RESOLVED
        market.outcome = outcome
        market.closed_at = datetime.utcnow()

        self.session.commit()
        return {
            "market_id": str(market_id),
            "outcome": outcome,
            "prize_pool": prize_pool,
            "winners_paid": len(winners),
        }
