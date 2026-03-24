"""create positions table

Revision ID: 003
Revises: 002
Create Date: 2026-03-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "positions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column(
            "market_id",
            UUID(as_uuid=True),
            sa.ForeignKey("markets.id"),
            nullable=False,
        ),
        sa.Column(
            "side",
            sa.Enum("YES", "NO", name="positionside"),
            nullable=False,
        ),
        sa.Column("amount", sa.Numeric(precision=18, scale=8), nullable=False),
        sa.Column(
            "status",
            sa.Enum("OPEN", "WON", "LOST", "CANCELLED", name="positionstatus"),
            server_default="OPEN",
            nullable=False,
        ),
        sa.Column("payout", sa.Numeric(precision=18, scale=8), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_positions_user_id", "positions", ["user_id"])
    op.create_index("ix_positions_market_id", "positions", ["market_id"])


def downgrade() -> None:
    op.drop_index("ix_positions_market_id", table_name="positions")
    op.drop_index("ix_positions_user_id", table_name="positions")
    op.drop_table("positions")
    op.execute("DROP TYPE IF EXISTS positionside")
    op.execute("DROP TYPE IF EXISTS positionstatus")
