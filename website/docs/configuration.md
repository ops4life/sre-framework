---
sidebar_position: 2
title: Configuration
---

# Configuration

## `sre.yaml`

The main config file. Set `SRE_CONFIG_FILE` env var to point to your own (default: `app/config/sre.yaml`).

```yaml
provider: http          # preset to use (traefik | http)
default_service: api    # service shown on load

services:
  - name: api
    slo_target: 99.5    # SLO target in percent
    labels:
      service: api      # fills {service} in query templates

  - name: frontend
    slo_target: 99.9
    labels:
      service: frontend
```

## Provider presets

Presets live in `app/config/providers/`. Each defines `latency_unit` and a `queries` map.

| Preset | File | Works with |
|--------|------|------------|
| `traefik` | `traefik.yaml` | Traefik + dockerstats + node_exporter |
| `http` | `http.yaml` | Any app with standard HTTP metrics |

## Custom query overrides

Add a `queries:` block to `sre.yaml` to override or extend the preset:

```yaml
provider: http
queries:
  # replace the default availability query
  availability: 'avg_over_time(my_custom_up{job="{service}"}[{window}]) * 100'
  # add a signal the preset doesn't have
  saturation: 'my_cpu_ratio{container="{container}"}'
```

Query templates use `{service}`, `{container}`, `{window}` as placeholders. Escape literal PromQL braces as `{{` and `}}`.

## Adding a provider preset

Create `app/config/providers/<name>.yaml`:

```yaml
name: mystack
latency_unit: seconds   # or "milliseconds"
queries:
  availability: '...'
  request_rate: '...'
  latency_p99:  '...'
  error_rate:   '...'
  saturation:   '...'       # optional
  cap_vps_cpu:  '...'       # optional
  cap_vps_mem:  '...'       # optional
  cap_vps_disk: '...'       # optional
  cap_container_cpu: '...'  # optional
  cap_container_mem: '...'  # optional
```

Then set `provider: mystack` in `sre.yaml`.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PROMETHEUS_URL` | `http://prometheus:9090` | Prometheus API endpoint |
| `SRE_CONFIG_FILE` | `app/config/sre.yaml` | Path to main config |
| `TRAEFIK_HOST` | _(unset)_ | Domain for Traefik TLS routing |
| `COMPOSE_PROJECT_NAME` | `sre` | Docker Compose project name |
