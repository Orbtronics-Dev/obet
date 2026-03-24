import json
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings

# When running locally from backend/ the root .env is one level up.
# In Docker, env vars are injected by compose so neither file needs to exist.
_ROOT_ENV = Path(__file__).resolve().parent.parent.parent / ".env"
_LOCAL_ENV = Path(__file__).resolve().parent.parent / ".env"
_ENV_FILES = tuple(
    str(p) for p in [_ROOT_ENV, _LOCAL_ENV] if True  # pydantic silently ignores missing files
)


class Settings(BaseSettings):
    APP_ENV: str = "production"
    APP_NAME: str = "OBet"
    DEBUG: bool = False

    DATABASE_URL: str

    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    OPAY_SECRET_KEY: str = ""
    OPAY_BASE_URL: str = "https://opay.orbtronics.co"

    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    PLATFORM_FEE_PCT: int = 2

    class Config:
        env_file = _ENV_FILES
        case_sensitive = True
        extra = "allow"

    def get_cors_origins(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            try:
                return json.loads(self.CORS_ORIGINS)
            except Exception:
                return [o.strip() for o in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS


@lru_cache()
def get_settings() -> Settings:
    return Settings()
