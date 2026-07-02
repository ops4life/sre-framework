---
sidebar_position: 5
title: DORA Metrics
---

# DORA Metrics

The four metrics identified by Google's DORA (DevOps Research and Assessment) program as the strongest predictors of software delivery performance.

## Signals

| Signal | Source | What it tells you |
|--------|--------|-------------------|
| Deployment Frequency | GitHub Actions API (`deploy.yml` runs) | How often you ship |
| Lead Time for Changes | GitHub Actions API (commit → deploy timestamp) | How fast a change reaches production |
| Change Failure Rate | GitHub Actions runs correlated with Uptime Kuma incidents | How often deploys cause incidents |
| Mean Time to Recovery | Uptime Kuma incident duration, correlated to deploys | How fast you recover from a bad deploy |

## Performance tiers

Values are bucketed into Elite / High / Medium / Low, adapted from the 2021 Accelerate State of DevOps report:

| Tier | Deploy Frequency | Lead Time | Change Failure Rate | MTTR |
|------|------|------|------|------|
| Elite | ≥ 1/day | < 1 hour | ≤ 15% | < 1 hour |
| High | ≥ 1/week | < 1 week | ≤ 30% | < 1 day |
| Medium | ≥ 1/month | < 6 months | ≤ 45% | < 1 week |
| Low | < 1/month | ≥ 6 months | > 45% | ≥ 1 week |

## Config

DORA metrics need a `dora:` block in `sre.yaml` pointing at the GitHub repo and workflow to track, and a GitHub token (`Actions: read` scope) in the `SRE_GITHUB_TOKEN` env var:

```yaml
dora:
  repo: your-org/your-repo
  workflow_file: deploy.yml
  window_days: 28
  correlation_window_min: 60
```

Change Failure Rate and MTTR additionally require the Uptime Kuma SQLite database mounted read-only into the container (`SRE_KUMA_DB_PATH`, default `/data/kuma.db`). Without it, `change_failure_rate` and `mean_time_to_recovery` render as `null` — same "optional signal" behavior as any other missing query key.
