from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

from app.settings import get_settings
from database.session import db_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    db_manager.initialize(settings.DATABASE_URL, echo=settings.DEBUG)
    logger.info("Database initialized")
    yield
    db_manager.dispose()
    logger.info("Database disposed")


settings = get_settings()

app = FastAPI(
    title="OBet API",
    description="Prediction market platform for Saint Lucian citizens",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

from app.routers.auth_router import auth_router
from app.routers.markets_router import markets_router
from app.routers.positions_router import positions_router
from app.routers.wallet_router import wallet_router
from app.routers.admin_router import admin_router
from app.routers.webhooks_router import webhooks_router

app.include_router(auth_router)
app.include_router(markets_router)
app.include_router(positions_router)
app.include_router(wallet_router)
app.include_router(admin_router)
app.include_router(webhooks_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "OBet API"}
