---
sidebar_position: 4
title: Capacity Planning
---

# Capacity Planning

Infrastructure headroom. Tracking VPS-level CPU, memory, and disk alongside per-container metrics lets you predict when to scale *before* users feel it.

## Signals

| Signal | Source | What it tells you |
|--------|--------|-------------------|
| VPS CPU | `node_exporter` | Host-level compute load |
| VPS Memory | `node_exporter` | Host-level memory pressure |
| VPS Disk | `node_exporter` | Storage headroom |
| Container CPU | dockerstats | Per-service compute load |
| Container Memory | dockerstats | Per-service memory usage |

## Rule of thumb

Keep peak utilization below **70%** to preserve headroom for:

- Traffic spikes
- Rolling deployments (two versions briefly co-running)
- GC bursts and periodic batch jobs

At 90%+ utilization, any spike becomes an incident.

## Config

Capacity signals are optional — they render `null` if the query key is absent from the active preset. Add them to any preset via:

```yaml
queries:
  cap_vps_cpu:  'your_cpu_query'
  cap_vps_mem:  'your_mem_query'
  cap_vps_disk: 'your_disk_query'
  cap_container_cpu: 'your_container_cpu_query'
  cap_container_mem: 'your_container_mem_query'
```
