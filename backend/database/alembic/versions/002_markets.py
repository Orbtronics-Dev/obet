"""create markets table

Revision ID: 002
Revises: 001
Create Date: 2026-03-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "markets",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column(
            "category",
            sa.Enum("POLITICS", "SPORTS", "CRYPTO", "LOCAL", "OTHER", name="marketcategory"),
            nullable=False,
        ),
        sa.Column("creator_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column(
            "status",
            sa.Enum("OPEN", "CLOSED", "RESOLVED", "CANCELLED", name="marketstatus"),
            server_default="OPEN",
            nullable=False,
        ),
        sa.Column("resolution_date", sa.DateTime(), nullable=False),
        sa.Column("closed_at", sa.DateTime(), nullable=True),
        sa.Column(
            "outcome",
            sa.Enum("YES", "NO", name="marketoutcome"),
            nullable=True,
        ),
        sa.Column(
            "total_yes_amount",
            sa.Numeric(precision=18, scale=8),
            server_default="0",
            nullable=False,
        ),
        sa.Column(
            "total_no_amount",
            sa.Numeric(precision=18, scale=8),
            server_default="0",
            nullable=False,
        ),
        sa.Column("platform_fee_pct", sa.Integer(), server_default="2", nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("markets")
    op.execute("DROP TYPE IF EXISTS marketcategory")
    op.execute("DROP TYPE IF EXISTS marketstatus")
    op.execute("DROP TYPE IF EXISTS marketoutcome")
