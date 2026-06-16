---
sidebar_position: 1
title: SRE Concepts
---

# SRE Concepts

A concise primer on the concepts shown in this dashboard. Enable **Learn Mode** (the `?` button in the top bar) to see inline tooltips as you explore live data.

## What is SRE?

Site Reliability Engineering treats operations as a software engineering problem. The core ideas:

- **Reliability is a feature** — not a side effect of good luck or heroic ops effort.
- **Error budgets over perfection** — 100% uptime is impossible and undesirable. Define how much unreliability is acceptable, then use it strategically.
- **Toil reduction** — repetitive manual work should be automated away. Engineers should spend < 50% of time on toil.

## In this dashboard

The dashboard surfaces four categories of reliability signal:

| Signal | What it tells you |
|--------|-------------------|
| **SLO / SLI** | Are you meeting your reliability targets? |
| **Error budget** | How much reliability headroom is left to spend on risk? |
| **Golden signals** | Is the service degraded right now? |
| **Capacity** | Are you running out of infrastructure headroom? |

Navigate the sidebar to learn about each in depth.

## Further reading

- [Google SRE Book (free online)](https://sre.google/sre-book/table-of-contents/)
- [The Site Reliability Workbook](https://sre.google/workbook/table-of-contents/)
- [SLO Burn Rate Alerting](https://sre.google/workbook/alerting-on-slos/)
