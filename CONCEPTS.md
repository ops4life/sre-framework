# SRE Concepts

A concise primer on the concepts shown in this dashboard. Each panel has a lightbulb icon — hover (or tap on mobile) to see inline tooltips as you explore live data.

---

## SLO — Service Level Objective

An SLO is the reliability target you commit to for a service. Example: *"99.9% of requests return a successful response, measured over a rolling 28-day window."*

SLOs should be set based on user pain, not engineering perfection. An SLO of 100% is a trap — it leaves no room to deploy, experiment, or absorb infrastructure noise.

**In this dashboard:** each service in `sre.yaml` has an `slo_target` (%). The SLO table shows whether each service is meeting its target.

---

## SLI — Service Level Indicator

An SLI is the actual measurement used to judge the SLO. It must be a ratio: *good events / total events*.

Common SLIs:
- **Availability:** `uptime / total_time` (this dashboard's default)
- **Success rate:** `non-5xx requests / all requests`
- **Latency:** `requests served under threshold / all requests`

**Computed as:** `avg_over_time(up[28d]) × 100` (via Traefik or the `http` preset).

---

## Composite SLO

The average SLI attainment across all services in your SLO table. A quick fleet-wide health number — useful for a status page or executive summary.

**Computed as:** `mean(SLI%)` for all services.

---

## Error Budget

The allowed downtime or errors before you breach your SLO target.

If your SLO is **99.9%**, your error budget is **0.1%** of the window:
- 28 days = 40 minutes of allowed downtime
- The error budget is the *fuel* for engineering risk: deploy, experiment, migrate, upgrade.

**Computed as:**
```
budget = 100 - slo_target
remaining = (1 - burned / budget) × 100%
burned    = max(0, 100 - sli)
```

---

## Burn Rate

How fast you are consuming error budget relative to the pace that would exhaust it at the end of the window.

- **Burn rate = 1:** you will exactly use up the budget at the end of the 28-day window.
- **Burn rate > 1:** you are on track to exhaust the budget early — action needed.
- **Burn rate > 2:** recommended policy: pause non-critical deploys.

Short-window burn rates (1h, 6h) are more sensitive and catch fast-moving incidents earlier than the full 28d window.

**Computed as:**
```
burn_rate = (error_rate / budget_rate)
error_rate   = (100 - sli_pct) / 100
budget_rate  = budget_pct / 100
```

---

## Golden Signals

The four signals that Google's SRE book identifies as sufficient to monitor any user-facing service:

### Latency (p99)
99th-percentile response time. The slowest 1% of requests. High p99 often signals queue buildup, GC pauses, or slow-path code that doesn't show up in averages.

**Computed as:** `histogram_quantile(0.99, rate(duration_bucket[5m]))`

### Traffic
How many requests per second the service is handling right now. Rising traffic can predict latency increases before they appear.

**Computed as:** `sum(rate(requests_total[5m]))`

### Errors
Percentage of requests that returned a 5xx error. Even a small sustained error rate burns error budget quickly.

**Computed as:** `rate(5xx) / rate(all) × 100`

### Saturation
How loaded is the resource (CPU, memory, queue depth)? High saturation predicts latency degradation before errors appear. A service at 90% CPU is fragile — any traffic spike will push it over.

**Computed as:** CPU usage ratio from dockerstats (Traefik preset) or a custom metric.

---

## Capacity

Infrastructure headroom. Tracking VPS-level CPU, memory, and disk alongside per-container metrics lets you predict when you need to scale *before* users feel it.

**Rule of thumb:** keep peak utilization below 70% to preserve headroom for traffic spikes, rolling deployments, and GC bursts.

---

## DORA Metrics

The four metrics identified by Google's DORA (DevOps Research and Assessment) program as the strongest predictors of software delivery performance:

### Deployment Frequency
How often you successfully ship to production. Elite performers deploy on demand, multiple times a day.

**Computed as:** successful `deploy.yml` runs ÷ window days

### Lead Time for Changes
The median time from a commit landing on `main` to it being deployed. Shorter lead time means faster feedback loops and smaller, easier-to-review changes.

**Computed as:** `median(deploy run created_at − commit timestamp)`

### Change Failure Rate
The percentage of deploys that trigger an incident shortly afterward (correlated against Uptime Kuma incidents within a configurable window, default 60 minutes).

**Computed as:** `deploys followed by a correlated incident / total deploys × 100`

### Mean Time to Recovery (MTTR)
How long it takes to restore service after a deploy-triggered incident.

**Computed as:** `mean(incident duration)` for incidents correlated to a deploy

### Performance tiers

Values are bucketed into Elite / High / Medium / Low, adapted from the 2021 Accelerate State of DevOps report (with monotonic boundaries filled in where the official ranges have gaps):

| Tier | Deploy Frequency | Lead Time | Change Failure Rate | MTTR |
|------|------|------|------|------|
| Elite | ≥ 1/day | < 1 hour | ≤ 15% | < 1 hour |
| High | ≥ 1/week | < 1 week | ≤ 30% | < 1 day |
| Medium | ≥ 1/month | < 6 months | ≤ 45% | < 1 week |
| Low | < 1/month | ≥ 6 months | > 45% | ≥ 1 week |

---

## Further reading

- [Google SRE Book (free online)](https://sre.google/sre-book/table-of-contents/)
- [The Site Reliability Workbook](https://sre.google/workbook/table-of-contents/)
- [SLO Burn Rate Alerting](https://sre.google/workbook/alerting-on-slos/)
- [2021 Accelerate State of DevOps Report](https://dora.dev/publications/)
