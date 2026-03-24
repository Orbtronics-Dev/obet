from contextlib import contextmanager
from typing import Any, Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker


class DatabaseManager:
    _instance = None
    _engine = None
    _session_factory = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def initialize(self, database_url: str, echo: bool = False):
        self._engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            echo=echo,
        )
        self._session_factory = sessionmaker(
            autocommit=False, autoflush=False, bind=self._engine
        )

    def dispose(self):
        if self._engine:
            self._engine.dispose()
            self._engine = None
            self._session_factory = None

    @property
    def engine(self):
        if not self._engine:
            raise RuntimeError("Database not initialized")
        return self._engine

    @contextmanager
    def session_scope(self):
        session = self._session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()


db_manager = DatabaseManager()


def get_db() -> Generator[Session, Any, None]:
    if not db_manager._session_factory:
        raise RuntimeError("Database not initialized. Call db_manager.initialize() first.")
    session = db_manager._session_factory()
    try:
        yield session
    finally:
        session.close()
