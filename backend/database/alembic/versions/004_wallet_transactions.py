"""create wallet_transactions table

Revision ID: 004
Revises: 003
Create Date: 2026-03-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "wallet_transactions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "type",
            sa.Enum(
                "DEPOSIT", "WITHDRAWAL", "BET", "PAYOUT", "REFUND",
                name="transactiontype",
            ),
            nullable=False,
        ),
        sa.Column("amount", sa.Numeric(precision=18, scale=8), nullable=False),
        sa.Column("currency", sa.String(10), server_default="USD", nullable=False),
        sa.Column(
            "status",
            sa.Enum("PENDING", "COMPLETED", "FAILED", name="transactionstatus"),
            server_default="PENDING",
            nullable=False,
        ),
        sa.Column("reference", sa.String(255), nullable=True),
        sa.Column("opay_session_id", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_wallet_transactions_user_id", "wallet_transactions", ["user_id"])
    op.create_index(
        "ix_wallet_transactions_opay_session_id",
        "wallet_transactions",
        ["opay_session_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_wallet_transactions_opay_session_id", table_name="wallet_transactions"
    )
    op.drop_index("ix_wallet_transactions_user_id", table_name="wallet_transactions")
    op.drop_table("wallet_transactions")
    op.execute("DROP TYPE IF EXISTS transactiontype")
    op.execute("DROP TYPE IF EXISTS transactionstatus")
