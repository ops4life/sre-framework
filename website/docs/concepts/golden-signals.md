---
sidebar_position: 2
title: Golden Signals
---

# Golden Signals

The four signals Google's SRE book identifies as sufficient to monitor any user-facing service.

## Latency (p99)

99th-percentile response time — the slowest 1% of requests. High p99 often signals queue buildup, GC pauses, or slow-path code that doesn't show up in averages.

```promql
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

## Traffic

Requests per second the service is handling right now. Rising traffic can predict latency increases before they appear.

```promql
sum(rate(http_requests_total[5m]))
```

## Errors

Percentage of requests that returned a 5xx error. Even a small sustained error rate burns error budget quickly.

```promql
rate(http_requests_total{status=~"5.."}[5m])
  / rate(http_requests_total[5m]) * 100
```

## Saturation

How loaded is the resource (CPU, memory, queue depth)? High saturation predicts latency degradation before errors appear. A service at 90% CPU is fragile — any traffic spike will push it over.

```promql
# Traefik preset — container CPU ratio from dockerstats
container_cpu_usage_seconds_total
```

**Rule of thumb:** alert when saturation exceeds 80%, page when it exceeds 90%.
