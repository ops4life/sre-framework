# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Backend (Python):**
```bash
pip install -r requirements.txt -r requirements-dev.txt
pytest tests/ -v                          # all tests
pytest tests/test_config_loader.py::TestTraefikPreset::test_render_availability -v  # single test
uvicorn app.main:app --reload             # dev server (port 8000)
```

**Frontend (React + Vite):**
```bash
cd frontend
pnpm install
pnpm run build    # tsc -b + vite build → frontend/dist/
pnpm run dev      # Vite dev server (proxied at /api/* by vite.config.ts)
```

**Docker:**
```bash
docker compose up --build                          # production stack
docker compose -f demo/docker-compose.yml up       # zero-infra demo (no real Prometheus needed)
```

## Architecture

**Data flow:** Browser → FastAPI `/api/sre/overview?service=<name>` → `metrics.py` → `config_loader.render()` builds PromQL → `prometheus.py` queries Prometheus → JSON → React.

The frontend polls every 20 seconds. All metric queries are config-driven — no PromQL is hardcoded in Python.

### Backend (`app/`)

- **`config_loader.py`** — loads `sre.yaml`, merges it with the named provider preset from `app/config/providers/<name>.yaml`, and exposes `render(key, labels, **extra) -> str | None`. Result is LRU-cached; tests call `load_config.cache_clear()` between cases. Env var `SRE_CONFIG_FILE` overrides the config path.
- **`metrics.py`** — async functions that call `config_loader.render()` for each signal key, execute Prometheus queries, and assemble the `Overview` response shape. `None` is returned for any signal whose query key isn't defined in the active config (e.g. `saturation` for the `http` preset).
- **`prometheus.py`** — thin async HTTP client wrapping Prometheus `/api/v1/query` and `/api/v1/query_range`. `PROMETHEUS_URL` env var (default: `http://prometheus:9090`).
- **`config/providers/`** — YAML presets (`traefik.yaml`, `http.yaml`). Each defines `latency_unit` and a `queries` map. Keys: `availability`, `request_rate`, `latency_p99`, `error_rate`, `saturation`, `cap_vps_cpu`, `cap_vps_mem`, `cap_vps_disk`, `cap_container_cpu`, `cap_container_mem`. Query templates use `{service}`, `{container}`, `{window}` placeholders; literal PromQL braces must be doubled (`{{`, `}}`).

### Frontend (`frontend/src/`)

- **`App.tsx`** — root component; owns `selectedService` state, fetches `/api/sre/overview`, passes typed `Overview` props down to all panels.
- **`types.ts`** — single source of truth for all response shapes (`Overview`, `Kpis`, `SloRow`, `GoldenSignals`, `ErrorBudgetBurn`, `Capacity`).
- **`styles/globals.css`** — all CSS custom properties (tokens). Definitive source for colors, spacing, typography.
- Components (`KpiStrip`, `SloTable`, `GoldenSignals`, `ErrorBudgetBurn`, `CapacityGrid`, `Sidebar`, `TopBar`) are all pure display — no fetching, no state beyond UI interaction. Each accepts `learnMode: boolean` and renders `<InfoTip>` overlays when true.
- **`content/concepts.ts`** — SRE concept copy used by `InfoTip` in Learn Mode.

### Config system

`sre.yaml` → picks a provider preset → preset queries are merged with user `queries:` overrides (user wins). `render(key, labels)` returns `None` if the key doesn't exist, which propagates as `null` in the JSON response and `null` in the React types. Components handle `null` gracefully.

### UI customization env vars

Set in `.env` or Docker environment. No rebuild needed — values are injected into `index.html` at serve time via `window.__SRE_CONFIG__`.

| Var | Default | Effect |
|---|---|---|
| `SRE_TITLE` | `SRE Ops — Mission Control` | Browser `<title>` and dashboard H1 |
| `SRE_TIMEZONE` | `UTC` | Clock display (IANA string, e.g. `America/New_York`) |
| `SRE_WINDOW` | `28d` | Prometheus evaluation window; day format only (e.g. `7d`, `30d`) |
| `SRE_STEP` | `5m` | Prometheus query step / chart resolution. Format: `Xm` or `Xh` (e.g. `1m`, `15m`, `1h`). Also shown in the TopBar "Live · Xm resolution" badge. |
| `SRE_FAVICON` | `/favicon.png` | Override browser favicon **and** sidebar logo. To serve a local file, mount it into `frontend/dist/` (e.g. `./my-logo.svg:/app/frontend/dist/my-logo.svg:ro`) and set this var to `/my-logo.svg` |
| `SRE_ACCENT` | *(lime `#caff04`)* | Override the UI accent color. Must be a 6-digit hex string (e.g. `#3b82f6`). Applied at runtime — no rebuild needed. |

- **`lib/config.ts`** — reads `window.__SRE_CONFIG__` with defaults fallback; imported by `App.tsx`, `TopBar.tsx`, `main.tsx`.
- `SRE_WINDOW` is also read by `metrics.py` (`_window()`) for Prometheus query construction.
- `SRE_STEP` is also read by `metrics.py` (`_step()`) for range query step and chart window (`40 × step_secs`).

### CI

`.github/workflows/ci.yml` runs on every push/PR:
1. `pytest tests/` against Python 3.12
2. `tsc -b && vite build` for the frontend
3. On `main` only: builds multi-arch Docker image (`linux/amd64,linux/arm64`) and pushes to `ops4life/sre-framework` on DockerHub. Requires `DOCKER_USERNAME` and `DOCKER_PASSWORD` repository secrets.
