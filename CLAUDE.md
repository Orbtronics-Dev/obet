# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

OBet is a Caribbean prediction market platform. Users deposit funds, bet YES/NO on real-world events (politics, sports, crypto, local news), and receive payouts proportional to their pool share minus a platform fee. The backend is FastAPI + PostgreSQL; the frontend is Next.js 15 App Router.

## Dev commands

Both `make <cmd>` and `just <cmd>` are available (identical).

```bash
# First-time setup
make init          # copies example.env → .env, writes frontend/.env.local
make up            # start the Postgres container
make migrate       # run pending Alembic migrations

# Local dev (no Docker for app services)
make backend-dev   # uvicorn with --reload on :8000  (run from project root)
make frontend-dev  # pnpm dev on :3000

# Type checking / linting
make typecheck     # tsc --noEmit
make lint          # ESLint

# Database
make makemigration NAME="add_something"   # autogenerate migration
make rollback                             # downgrade -1
make db-shell                             # psql in container

# Docker (full stack)
make up-build      # rebuild and start all services
make down-v        # stop and wipe volumes
```

Backend runs from `backend/` using uv. Python is pinned to **3.13** via `backend/.python-version` — do not use 3.14+, pydantic-core 2.27.2 does not support it.

## Environment

A single `example.env` at the project root covers all services. Copy it to `.env` (`make init` does this automatically). The backend reads `<project-root>/.env` first, then falls back to `backend/.env`. `make init` also extracts `NEXT_PUBLIC_*` lines into `frontend/.env.local`.

Key variables:
- `DATABASE_URL` — postgres connection string
- `JWT_SECRET` — must be changed in production
- `OPAY_SECRET_KEY` / `OPAY_BASE_URL` — payment gateway credentials
- `NEXT_PUBLIC_API_URL` — consumed by Next.js (defaults to `http://localhost:8000`)

## Backend architecture

```
backend/
  app/
    api.py          # FastAPI app, CORS, lifespan, /health
    routers/        # thin HTTP layer — validates input, calls services
    services/       # business logic
    dao/            # data access (SQLAlchemy queries, no logic)
    guards/         # auth_guard, admin_guard (FastAPI dependencies)
    schemas/        # Pydantic request/response models
    settings.py     # pydantic-settings; reads .env
  database/
    models/         # SQLAlchemy ORM models
    alembic/        # migrations
    session.py      # engine + SessionLocal
```

**Request flow:** `router → guard (optional) → service → DAO → DB`

**Auth** (`guards/auth_guard.py`): HTTPBearer; decodes JWT (HS256); returns `AuthContext(user_id, email, is_admin, user)`. Raises 401 on bad/expired token, 403 on inactive account.

**Betting flow** (`services/betting_service.py`):
1. `place_bet` — validates market is OPEN, debits wallet, updates pool totals, creates Position + WalletTransaction.
2. `resolve_market` — calculates `prize_pool = total_pool * (1 - fee/100)`, marks losing positions LOST, pays winners `(position_amount / total_winning_amount) * prize_pool`.

**Key models:**
- `User` — `balance` (Numeric 18,8), `preferred_currency` defaults to `XCD` (East Caribbean Dollar)
- `Market` — status enum (OPEN/CLOSED/RESOLVED/CANCELLED), `total_yes_amount` / `total_no_amount`
- `Position` — side (YES/NO), status (OPEN/WON/LOST/CANCELLED), `payout`
- `WalletTransaction` — type (DEPOSIT/BET/PAYOUT/REFUND), `opay_session_id` for dedup

**Market categories:** POLITICS, SPORTS, CRYPTO, LOCAL, OTHER (frontend also shows ECONOMY, ENTERTAINMENT as display labels).

**Payments:** OPay gateway (`services/opay_service.py`) — creates checkout session, returns `checkout_url`. Webhook at `/webhooks` credits wallet idempotently via `opay_session_id`.

## Frontend architecture

```
frontend/
  app/
    (app)/          # authenticated route group
    (auth)/         # login / register
    admin/          # admin market management
    layout.tsx      # Poppins + Inter fonts, Navbar, Providers
    page.tsx        # landing page (Three.js globe + Framer Motion hero)
  features/
    auth/           # LoginForm, RegisterForm
    markets/        # MarketCard, BetModal
    wallet/         # wallet UI
  hooks/            # useMarket, useWallet (React Query wrappers)
  lib/
    api.ts          # typed API client + token management
    utils.ts        # cn() helper
    currency.ts     # XCD formatting
  components/
    Globe.tsx       # Three.js globe with world-atlas landmasses
    Navbar.tsx      # fixed glassmorphism nav
```

**Auth state** lives entirely in `lib/api.ts`: `setTokens()` / `clearTokens()` write to `localStorage` + cookie. The cookie is checked by `middleware.ts` (server-side) to guard `/markets/*`, `/portfolio/*`, `/wallet/*`, `/admin/*`. On 401, `apiFetch` clears tokens and redirects to `/login`.

**API client** (`lib/api.ts`): `api.get<T>(path)` / `api.post<T>(path, body)` wrap `fetch`, auto-attach `Authorization: Bearer` header. All backend namespaces (`authApi`, `marketsApi`, `positionsApi`, `walletApi`, `adminApi`) are defined here.

**Data fetching:** React Query via hooks in `hooks/`. `usePlaceBet` invalidates `market`, `wallet`, and `positions` queries on success. `useDeposit` redirects to OPay `checkout_url`.

**Design system:** primary blue `#007BFF`, background `#060810`, surface `#0d1320`. Tailwind tokens defined in `tailwind.config.ts`. CSS vars `--font-poppins` / `--font-inter` injected via `next/font/google`. `.gradient-text` utility in `globals.css`.

**Globe** (`components/Globe.tsx`): Three.js; world-atlas 110m TopoJSON via `topojson-client`; opacity by region — Caribbean 0.82, Americas 0.44, Europe 0.20, rest 0.10; drag + touch rotation; anti-meridian splitting for line segments.

## Commit conventions

Lowercase semantic commits, one logical change per commit: `feat:`, `fix:`, `chore:`, `docs:`, scoped when relevant, e.g. `feat(frontend):`, `fix(backend):`.
