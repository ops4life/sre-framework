---
sidebar_position: 3
title: SLO & Error Budget
---

# SLO & Error Budget

## SLI — Service Level Indicator

The actual measurement used to judge reliability. Must be a ratio: *good events / total events*.

Common SLIs:

| SLI | Formula |
|-----|---------|
| Availability | `uptime / total_time` |
| Success rate | `non-5xx requests / all requests` |
| Latency | `requests under threshold / all requests` |

**Computed as:** `avg_over_time(up[28d]) × 100`

## SLO — Service Level Objective

The reliability target you commit to. Example: *"99.9% of requests return a successful response over a rolling 28-day window."*

Set in `sre.yaml` per service:

```yaml
services:
  - name: api
    slo_target: 99.5
```

SLOs should reflect user pain, not engineering perfection. An SLO of 100% leaves no room to deploy, experiment, or absorb infrastructure noise.

## Composite SLO

Mean SLI attainment across all services — a fleet-wide health number useful for a status page or executive summary.

## Error Budget

Allowed downtime or errors before breaching the SLO target.

If SLO = **99.9%**, error budget = **0.1%** of the window:

- 28 days = **40 minutes** of allowed downtime
- Error budget is the *fuel* for engineering risk: deploy, experiment, migrate, upgrade.

```
budget    = 100 - slo_target
burned    = max(0, 100 - sli)
remaining = (1 - burned / budget) × 100%
```

## Burn Rate

How fast you're consuming error budget relative to the pace that would exhaust it at window end.

| Burn rate | Meaning |
|-----------|---------|
| 1 | On track to exactly use the budget by day 28 |
| > 1 | Will exhaust budget early — action needed |
| > 2 | Recommended: pause non-critical deploys |

Short-window burn rates (1h, 6h) catch fast-moving incidents earlier than the 28d window.

```
burn_rate  = error_rate / budget_rate
error_rate = (100 - sli_pct) / 100
budget_rate = budget_pct / 100
```
