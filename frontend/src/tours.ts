export interface TourStep {
  sel: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    sel: '[data-tour="kpi-strip"]',
    title: 'KPI STRIP',
    body: 'Five at-a-glance metrics for the selected service: composite SLO, error budget remaining, request rate, p99 latency, and error rate. Dots turn amber/red when thresholds are breached.',
  },
  {
    sel: '[data-tour="slo-table"]',
    title: 'SERVICE LEVEL OBJECTIVES',
    body: 'Per-service SLI attainment vs your SLO targets over the rolling window. The trend sparkline shows whether reliability is improving or degrading. Red rows have breached their SLO.',
  },
  {
    sel: '[data-tour="error-budget-burn"]',
    title: 'ERROR BUDGET BURN',
    body: 'How fast you are consuming your reliability budget. Burn rate > 1 means you are on track to exhaust the budget before the window ends. Rate > 2 triggers a deploy freeze policy.',
  },
  {
    sel: '[data-tour="golden-signals"]',
    title: 'GOLDEN SIGNALS',
    body: 'The four SRE pillars: latency (p99 response time), traffic (req/s), errors (5xx rate), and saturation (resource load). Each includes a 5-minute rolling sparkline.',
  },
  {
    sel: '[data-tour="capacity"]',
    title: 'CAPACITY',
    body: 'Infrastructure headroom for the VPS host and the selected service container. Bars turn amber above 80%. Track these trends to predict scaling needs before they become incidents.',
  },
];
