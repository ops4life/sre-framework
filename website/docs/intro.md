---
sidebar_position: 1
title: Quickstart
---

# Quickstart

SRE Framework is an open-source SRE Ops dashboard that helps teams apply Site Reliability Engineering practices. Config-driven, Prometheus-native, ships with a zero-infra demo stack.

## Zero-infra demo (recommended first step)

**From DockerHub (no build needed):**

```bash
docker run -p 8000:8000 ops4life/sre-framework:latest
```

**From source:**

```bash
git clone https://github.com/ops4life/sre-framework
cd sre-framework
docker compose -f demo/docker-compose.yml up --build
```

Open **http://localhost:8080** — live SRE dashboard with synthetic metrics from three fake services (`frontend`, `api`, `worker`). No Traefik, no Prometheus to install.

---

## Use your own metrics

### 1. Pick a provider preset

| Preset | Works with |
|--------|------------|
| `traefik` | Traefik reverse proxy + dockerstats + node_exporter |
| `http` | Any app exposing `http_requests_total` + `http_request_duration_seconds_bucket` |

### 2. Write `sre.yaml`

```yaml
provider: http          # or "traefik"
default_service: api

services:
  - name: api
    slo_target: 99.5
    labels:
      service: api

  - name: frontend
    slo_target: 99.9
    labels:
      service: frontend
```

For the `traefik` preset, add a `container` label too:

```yaml
    labels:
      service: devex-svc@file
      container: devex
```

### 3. Run

```bash
docker compose up --build
```

Set `PROMETHEUS_URL` and `SRE_CONFIG_FILE` in your `.env` (see `.env.example`).

---

## Panel tooltips & Tour

Every panel has a lightbulb icon — hover (or tap on mobile) to see what the metric means, how it's computed, and links to the [SRE Concepts](/docs/concepts/) primer.

Click **Tour** in the top bar for a guided walkthrough of the full dashboard.
