export interface Concept {
  id: string;
  term: string;
  plain: string;
  computedAs?: string;
  anchor: string; // CONCEPTS.md section anchor
}

export const concepts: Record<string, Concept> = {
  slo: {
    id: "slo",
    term: "SLO",
    plain: "Service Level Objective — the reliability target you commit to. E.g. 99.9% availability over 28 days.",
    computedAs: "Defined per-service in sre.yaml as slo_target (%).",
    anchor: "slo--service-level-objective",
  },
  sli: {
    id: "sli",
    term: "SLI",
    plain: "Service Level Indicator — the measured signal used to judge whether the SLO is being met.",
    computedAs: "avg_over_time(up[28d]) × 100  →  % of time the service was healthy.",
    anchor: "sli--service-level-indicator",
  },
  composite_slo: {
    id: "composite_slo",
    term: "Composite SLO",
    plain: "Average SLI attainment across all monitored services. A quick fleet-wide health number.",
    computedAs: "mean(SLI%) for all services in the SLO table.",
    anchor: "composite-slo",
  },
  error_budget: {
    id: "error_budget",
    term: "Error Budget",
    plain: "The allowed downtime before you breach your SLO. If your SLO is 99.9%, your error budget is 0.1% of the window (~43 min/month).",
    computedAs: "budget = 100 − SLO target.  remaining = (1 − burned/budget) × 100%.",
    anchor: "error-budget",
  },
  burn_rate: {
    id: "burn_rate",
    term: "Burn Rate",
    plain: "How fast you are consuming error budget relative to the SLO window. A burn rate of 1 means you will exactly exhaust budget at window end. >1 means you are on track to breach.",
    computedAs: "(error_rate / budget_rate).  error_rate = (100 − SLI%) / 100.",
    anchor: "burn-rate",
  },
  latency: {
    id: "latency",
    term: "Latency (p99)",
    plain: "99th-percentile response time — the worst latency seen by the slowest 1% of requests. High p99 often signals queue buildup or slow outlier paths.",
    computedAs: "histogram_quantile(0.99, rate(duration_bucket[5m]))",
    anchor: "golden-signals",
  },
  traffic: {
    id: "traffic",
    term: "Traffic",
    plain: "Request rate — how many requests per second the service is handling right now.",
    computedAs: "sum(rate(requests_total[5m]))",
    anchor: "golden-signals",
  },
  errors: {
    id: "errors",
    term: "Error Rate",
    plain: "Percentage of requests returning a 5xx (server error) response. Any non-zero value should be investigated.",
    computedAs: "rate(5xx) / rate(all) × 100",
    anchor: "golden-signals",
  },
  saturation: {
    id: "saturation",
    term: "Saturation",
    plain: "How loaded is the service? High saturation (CPU near 100%) predicts degraded latency before errors appear.",
    computedAs: "container CPU usage ratio (dockerstats) or custom metric.",
    anchor: "golden-signals",
  },
  capacity: {
    id: "capacity",
    term: "Capacity",
    plain: "Infrastructure headroom. Tracking VPS-level CPU/memory/disk alongside per-container usage helps predict when you need to scale.",
    anchor: "capacity",
  },
  slo_attainment: {
    id: "slo_attainment",
    term: "SLO Attainment",
    plain: "Indicates whether all services are meeting their target reliability metrics. Degraded status means one or more service SLIs are currently below their SLO target.",
    anchor: "slo--service-level-objective",
  },
  window: {
    id: "window",
    term: "SLO Window",
    plain: "The rolling time window over which reliability targets are calculated. Typically 28 or 30 days to align with monthly reporting cycles.",
    anchor: "slo--service-level-objective",
  },
  resolution: {
    id: "resolution",
    term: "Resolution",
    plain: "The lookback step size for metrics calculations. A 5-minute resolution rate calculates data points using rolling 5-minute intervals.",
    anchor: "golden-signals",
  },
};
