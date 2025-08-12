# Points Strategy Planner — Full App (React + Vite + Express + Docker + CI)

This is a complete, ready-to-build app with:
- React + Vite + TypeScript SPA
- Minimal CSS (no Tailwind dependency)
- Rules engine for Avios Triangle, Star Alliance, SkyTeam, and hotels
- Express production server with `/health` and `/version`
- Docker multi-stage build + healthcheck
- docker-compose with healthcheck
- GitHub Actions workflow that builds, pushes to GHCR, and smoke tests `/version`

## Quick start (Docker-based development)

```bash
# Production build and run
docker compose up --build

# Development with hot reloading
docker compose -f docker-compose.dev.yml up --build

# App: http://localhost:8080 (production) or http://localhost:5173 (development)
# Health: http://localhost:8080/health (production)
# Version: http://localhost:8080/version (production)
```

## Alternative: Local development (requires Node.js)

```bash
npm install
npm run dev
# open http://localhost:5173
```

## Build & run (production locally)

```bash
# Using Docker (recommended)
docker build \
  --build-arg APP_VERSION=$(git rev-parse --short HEAD 2>/dev/null || echo dev) \
  --build-arg BUILD_TIME=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t points-planner:latest .

docker run --rm -p 8080:3000 points-planner:latest
# App: http://localhost:8080
# Health: http://localhost:8080/health
# Version: http://localhost:8080/version

# Or using Docker Compose
docker compose up --build
# App: http://localhost:8080
```

## Docker Compose Options

**Production:**
```bash
docker compose up --build
# App: http://localhost:8080
```

**Development (with hot reloading):**
```bash
docker compose -f docker-compose.dev.yml up --build
# App: http://localhost:5173
```

## GitHub

1. Initialize repo & set remote: `git remote add origin git@github.com:wcervin/optimize.cards.git`
2. Commit & push; the workflow publishes to `ghcr.io/wcervin/optimize.cards` and runs a smoke test.

---

## Notes
- The UI uses plain CSS for portability; you can swap in Tailwind/shadcn later.
- `src/PointsStrategyPlanner.tsx` holds the rules engine and UI.
- **Container-first approach**: All development and production runs are containerized for consistency.
- **No host dependencies**: The app runs entirely inside Docker containers with proper networking.
- **Development mode**: Use `docker-compose.dev.yml` for hot reloading and development tools.

## 📋 Version Information

| Field | Value |
|-------|-------|
| **Current Version** | `1.0.1` |
| **Last Updated** | `2025-08-12 19:24:58 UTC` |
| **NTP Server** | `system` |
| **NTP Offset** | `0.000000 seconds` |
| **Uncertainty** | `±0.000000 seconds` |
