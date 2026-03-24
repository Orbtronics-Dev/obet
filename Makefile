.PHONY: up up-build down down-v build logs ps \
        migrate rollback makemigration db-shell \
        backend-dev backend-shell backend-logs \
        frontend-dev typecheck lint frontend-shell frontend-logs \
        init bootstrap help

# ── Infrastructure ────────────────────────────────────────────────────────────

up:
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

down-v:
	docker compose down -v

build:
	docker compose build

logs:
	docker compose logs -f

ps:
	docker compose ps

# ── Database ──────────────────────────────────────────────────────────────────

migrate:
	docker compose exec backend uv run alembic upgrade head

rollback:
	docker compose exec backend uv run alembic downgrade -1

# Usage: make makemigration NAME="add_something"
makemigration:
	docker compose exec backend uv run alembic revision --autogenerate -m "$(NAME)"

db-shell:
	docker compose exec db psql -U obet -d obet

# ── Backend ───────────────────────────────────────────────────────────────────

backend-dev:
	cd backend && uv run uvicorn app.api:app --host 0.0.0.0 --port 8000 --reload

backend-shell:
	docker compose exec backend bash

backend-logs:
	docker compose logs -f backend

# ── Frontend ──────────────────────────────────────────────────────────────────

frontend-dev:
	cd frontend && pnpm dev

typecheck:
	cd frontend && pnpm exec tsc --noEmit

lint:
	cd frontend && pnpm lint

frontend-shell:
	docker compose exec frontend sh

frontend-logs:
	docker compose logs -f frontend

# ── Setup ─────────────────────────────────────────────────────────────────────

init:
	@cp -n example.env .env && echo "Created .env" || echo ".env already exists"
	@grep '^NEXT_PUBLIC_' .env > frontend/.env.local && echo "Created frontend/.env.local" || true
	@echo "Done — edit .env before starting services"

bootstrap: init up-build
	@echo "Waiting for services to be healthy..."
	@sleep 5
	$(MAKE) migrate
	@echo ""
	@echo "OBet is running:"
	@echo "  Frontend  → http://localhost:3000"
	@echo "  Backend   → http://localhost:8000"
	@echo "  API docs  → http://localhost:8000/docs"

# ── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "  OBet — available commands"
	@echo ""
	@echo "  Infrastructure:"
	@echo "    make up              Start all services (detached)"
	@echo "    make up-build        Start all services (with rebuild)"
	@echo "    make down            Stop all services"
	@echo "    make down-v          Stop all services and wipe volumes"
	@echo "    make build           Rebuild Docker images"
	@echo "    make logs            Follow logs (all services)"
	@echo "    make ps              Show service status"
	@echo ""
	@echo "  Database:"
	@echo "    make migrate                Run pending migrations"
	@echo "    make rollback               Roll back last migration"
	@echo "    make makemigration NAME=    Create a new migration"
	@echo "    make db-shell               Open psql in db container"
	@echo ""
	@echo "  Backend:"
	@echo "    make backend-dev     Start backend locally (hot reload)"
	@echo "    make backend-shell   Shell into backend container"
	@echo "    make backend-logs    Follow backend logs"
	@echo ""
	@echo "  Frontend:"
	@echo "    make frontend-dev    Start frontend locally (hot reload)"
	@echo "    make typecheck       Run TypeScript type check"
	@echo "    make lint            Run ESLint"
	@echo "    make frontend-shell  Shell into frontend container"
	@echo "    make frontend-logs   Follow frontend logs"
	@echo ""
	@echo "  Setup:"
	@echo "    make init            Copy example.env → .env and write frontend/.env.local"
	@echo "    make bootstrap       Full fresh start (init + up + migrate)"
	@echo ""

.DEFAULT_GOAL := help
