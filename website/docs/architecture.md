---
sidebar_position: 3
title: Architecture
---

# Architecture

## Data flow

```
Browser
  → FastAPI /api/sre/overview?service=<name>
  → metrics.py
  → config_loader.render() builds PromQL
  → prometheus.py queries Prometheus
  → JSON
  → React components
```

The frontend polls every 20 seconds. All metric queries are config-driven — no PromQL is hardcoded in Python.

## Repository layout

```
sre-framework/
├── app/                        # FastAPI backend
│   ├── config_loader.py        # load sre.yaml + provider preset, render PromQL
│   ├── metrics.py              # query logic (config-driven, provider-agnostic)
│   ├── prometheus.py           # Prometheus HTTP client
│   └── config/
│       ├── sre.yaml            # main user config
│       └── providers/
│           ├── traefik.yaml    # Traefik preset
│           └── http.yaml       # generic HTTP RED preset
├── frontend/                   # React + Vite
│   └── src/
│       ├── App.tsx             # root; owns selectedService state + fetch
│       ├── types.ts            # Overview, Kpis, SloRow, GoldenSignals, ...
│       ├── styles/globals.css  # CSS custom properties (tokens)
│       └── components/         # KpiStrip, SloTable, GoldenSignals, ErrorBudgetBurn, CapacityGrid
├── demo/                       # standalone zero-infra demo stack
│   ├── docker-compose.yml
│   ├── metrics-generator/      # synthetic Prometheus metrics for 3 fake services
│   ├── prometheus.yml
│   └── sre.demo.yaml
└── tests/                      # pytest: config loader unit tests
```

## Backend modules

### `config_loader.py`
Loads `sre.yaml`, merges it with the named provider preset from `app/config/providers/<name>.yaml`, and exposes `render(key, labels, **extra) -> str | None`. Result is LRU-cached; tests call `load_config.cache_clear()` between cases.

### `metrics.py`
Async functions that call `config_loader.render()` for each signal key, execute Prometheus queries, and assemble the `Overview` response shape. Returns `None` for any signal whose query key isn't defined in the active config (e.g. `saturation` for the `http` preset).

### `prometheus.py`
Thin async HTTP client wrapping Prometheus `/api/v1/query` and `/api/v1/query_range`. `PROMETHEUS_URL` env var selects the endpoint.

## Frontend components

All components are pure display — no fetching, no state beyond UI interaction. Each accepts `learnMode: boolean` and renders `<InfoTip>` overlays when true.

| Component | Purpose |
|-----------|---------|
| `App.tsx` | Root; owns `selectedService` state, fetches `/api/sre/overview` |
| `KpiStrip` | Top-level KPI cards (composite SLO, error budget, burn rate) |
| `SloTable` | Per-service SLO attainment table |
| `GoldenSignals` | Latency p99, traffic, errors, saturation gauges |
| `ErrorBudgetBurn` | Burn rate chart across 1h / 6h / 28d windows |
| `CapacityGrid` | VPS + container capacity bars |
| `Sidebar` | Service selector |
| `TopBar` | Header with Learn Mode toggle |

## CI pipeline

Every push to `main` runs:

1. `pytest tests/` against Python 3.12
2. `tsc -b && vite build` for the frontend
3. Docker build + push (`linux/amd64,linux/arm64`) to `ops4life/sre-framework` on DockerHub
4. Docusaurus build + deploy to GitHub Pages

Docker images:
```
ops4life/sre-framework:latest   # always tracks main
ops4life/sre-framework:<sha>    # pinned to commit
```
