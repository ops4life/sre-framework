# demo/

Zero-infra demo stack — no real Prometheus or services needed. Synthetic metrics generated for three fake services (`frontend`, `api`, `worker`).

## Start / stop

```bash
# from repo root
docker compose -f demo/docker-compose.yml up --build     # start
docker compose -f demo/docker-compose.yml down           # stop
docker compose -f demo/docker-compose.yml up -d --build sre  # rebuild sre only
```

## Services

| Container | Role |
|---|---|
| `metrics-generator` | Python app emitting synthetic Prometheus metrics |
| `prometheus` | Scrapes metrics-generator; retention 7d |
| `sre` | FastAPI + React dashboard |

## Config files

- **`sre.demo.yaml`** — SRE config (3 fake services, `http` provider preset). Mounted into the container at `/app/demo/sre.demo.yaml`.
- **`prometheus.yml`** — Prometheus scrape config pointing at metrics-generator.

## UI customization env vars

Set in `docker-compose.yml` under `sre.environment`. No rebuild required — values injected at serve time.

| Variable | Current value | Description |
|---|---|---|
| `SRE_TITLE` | `SRE Ops — Mission Control` | Browser tab title and dashboard heading |
| `SRE_TIMEZONE` | `Asia/Ho_Chi_Minh` | Clock display timezone (IANA string). Run `timedatectl list-timezones` for valid values |
| `SRE_WINDOW` | `28d` | SLO evaluation window — day format only (e.g. `7d`, `30d`) |
| `SRE_FAVICON` | `/favicon.svg` | URL to a custom favicon **and** sidebar logo. `demo/favicon.svg` is mounted into `frontend/dist/favicon.svg` — replace that file to change the logo |

## Ports

- `sre` exposes port `8000` internally; routed via Traefik to `sre-demo.ops4life.com`.
- Prometheus accessible at `http://prometheus:9090` within `demo-internal` network only.

## Metrics generator

Lives in `demo/metrics-generator/`. Emits `http_requests_total`, `http_request_duration_seconds_bucket`, and `up` metrics for each fake service with realistic jitter.
