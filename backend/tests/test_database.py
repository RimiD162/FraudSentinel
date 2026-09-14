"""
Tests for database session management and connection utilities.
"""

from sqlalchemy.orm import Session

from app.core.database import Base, get_db


class TestDatabaseSession:
    def test_db_session_is_valid(self, db_session: Session):
        """Test that the test fixture provides a valid session."""
        assert db_session is not None
        assert isinstance(db_session, Session)
        assert db_session.is_active

    def test_db_session_can_execute_raw_sql(self, db_session: Session):
        """Test that the session can execute raw SQL queries."""
        from sqlalchemy import text

        result = db_session.execute(text("SELECT 1")).scalar()
        assert result == 1

    def test_db_session_rollback(self, db_session: Session):
        """Test that session rollback works correctly."""
        from app.models.role import Role

        role = Role(name="temp_role", description="Temporary")
        db_session.add(role)
        db_session.flush()

        # Verify it's in the session
        assert db_session.query(Role).filter_by(name="temp_role").first() is not None

        # Rollback
        db_session.rollback()

        # Verify it's gone
        assert db_session.query(Role).filter_by(name="temp_role").first() is None

    def test_tables_created(self, db_session: Session):
        """Verify all 9 tables exist in the test database."""
        from sqlalchemy import inspect

        inspector = inspect(db_session.bind)
        table_names = inspector.get_table_names()

        expected_tables = [
            "roles",
            "users",
            "customers",
            "transactions",
            "fraud_alerts",
            "model_predictions",
            "investigations",
            "audit_logs",
            "forecasts",
        ]

        for table in expected_tables:
            assert table in table_names, f"Table '{table}' not found in database"

    def test_get_db_generator(self):
        """Test that get_db is a generator function."""
        import inspect

        assert inspect.isgeneratorfunction(get_db)
