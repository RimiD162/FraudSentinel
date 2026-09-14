"""Initial schema - create all 9 tables

Revision ID: 001_initial_schema
Revises: None
Create Date: 2026-09-14
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- roles ---
    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("description", sa.String(255), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_roles_name", "roles", ["name"], unique=True)

    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.Text(), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"]),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role_id", "users", ["role_id"])

    # --- customers ---
    op.create_table(
        "customers",
        sa.Column("id", sa.String(20), nullable=False),
        sa.Column("total_transactions", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_amount", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("fraud_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("risk_score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("first_seen", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_seen", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # --- transactions ---
    op.create_table(
        "transactions",
        sa.Column("id", sa.String(20), nullable=False),
        sa.Column("customer_id", sa.String(20), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("transaction_type", sa.String(50), nullable=False),
        sa.Column("transaction_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("location", sa.String(100), nullable=True),
        sa.Column("device_type", sa.String(50), nullable=True),
        sa.Column(
            "previous_transactions_count",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column("is_fraud", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"]),
    )
    op.create_index("ix_transactions_customer_id", "transactions", ["customer_id"])
    op.create_index("ix_transactions_transaction_time", "transactions", ["transaction_time"])
    op.create_index("ix_transactions_is_fraud", "transactions", ["is_fraud"])

    # --- fraud_alerts ---
    op.create_table(
        "fraud_alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("transaction_id", sa.String(20), nullable=False),
        sa.Column(
            "alert_type",
            sa.String(50),
            nullable=False,
            server_default="ml_detection",
        ),
        sa.Column(
            "severity", sa.String(20), nullable=False, server_default="medium"
        ),
        sa.Column(
            "status", sa.String(20), nullable=False, server_default="flagged"
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["transaction_id"], ["transactions.id"]),
    )
    op.create_index("ix_fraud_alerts_transaction_id", "fraud_alerts", ["transaction_id"])

    # --- model_predictions ---
    op.create_table(
        "model_predictions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("transaction_id", sa.String(20), nullable=False),
        sa.Column("model_name", sa.String(100), nullable=False),
        sa.Column("model_version", sa.String(50), nullable=True),
        sa.Column("fraud_probability", sa.Float(), nullable=False),
        sa.Column("predicted_label", sa.Boolean(), nullable=False),
        sa.Column(
            "threshold_used", sa.Float(), nullable=False, server_default="0.5"
        ),
        sa.Column("features_json", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["transaction_id"], ["transactions.id"]),
    )
    op.create_index(
        "ix_model_predictions_transaction_id", "model_predictions", ["transaction_id"]
    )

    # --- investigations ---
    op.create_table(
        "investigations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("alert_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("assigned_to", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "status", sa.String(20), nullable=False, server_default="open"
        ),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="3"),
        sa.Column(
            "opened_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["alert_id"], ["fraud_alerts.id"]),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"]),
    )
    op.create_index("ix_investigations_alert_id", "investigations", ["alert_id"])
    op.create_index("ix_investigations_assigned_to", "investigations", ["assigned_to"])

    # --- audit_logs ---
    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource_type", sa.String(100), nullable=True),
        sa.Column("resource_id", sa.String(100), nullable=True),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])

    # --- forecasts ---
    op.create_table(
        "forecasts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("forecast_type", sa.String(50), nullable=False),
        sa.Column("target_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("predicted_value", sa.Float(), nullable=False),
        sa.Column("confidence_lower", sa.Float(), nullable=True),
        sa.Column("confidence_upper", sa.Float(), nullable=True),
        sa.Column("model_used", sa.String(100), nullable=True),
        sa.Column("parameters", sa.Text(), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
    )
    op.create_index("ix_forecasts_target_date", "forecasts", ["target_date"])
    op.create_index("ix_forecasts_created_by", "forecasts", ["created_by"])


def downgrade() -> None:
    op.drop_table("forecasts")
    op.drop_table("audit_logs")
    op.drop_table("investigations")
    op.drop_table("model_predictions")
    op.drop_table("fraud_alerts")
    op.drop_table("transactions")
    op.drop_table("customers")
    op.drop_table("users")
    op.drop_table("roles")
