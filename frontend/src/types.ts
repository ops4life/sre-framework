export interface SloRow {
  name: string;
  slo_target: number;
  sli: number | null;
  error_budget_remaining: number | null;
  sparkline: number[];
}

export interface GoldenSignals {
  latency_p99_ms: number | null;
  request_rate: number | null;
  error_rate_pct: number;
  saturation_pct: number | null;
  series: {
    latency_p99_ms: number[];
    request_rate: number[];
    error_rate_pct: number[];
    saturation_pct: number[];
  };
}

export interface ErrorBudgetBurn {
  target: number;
  budget_pct: number;
  remaining_pct: number | null;
  burn_curve: number[];
  burn_rate_1h: number | null;
  burn_rate_6h: number | null;
}

export interface Capacity {
  vps_cpu_pct: number | null;
  vps_memory_pct: number | null;
  vps_disk_pct: number | null;
  service_container_cpu_pct: number | null;
  service_container_memory_pct: number | null;
}

export interface Kpis {
  composite_slo: number | null;
  error_budget_remaining_pct: number | null;
  selected_service: string;
  selected_request_rate: number | null;
  selected_latency_p99_ms: number | null;
  selected_error_rate_pct: number;
}

export interface Overview {
  kpis: Kpis;
  slo_table: SloRow[];
  golden_signals: GoldenSignals;
  error_budget_burn: ErrorBudgetBurn;
  capacity: Capacity;
  generated_at: number;
}

export type DoraTier = 'elite' | 'high' | 'medium' | 'low';

export interface DeploymentFrequency {
  deploys_per_day: number;
  total_deploys: number;
  tier: DoraTier | null;
}

export interface LeadTimeForChanges {
  median_seconds: number | null;
  sample_size: number;
  tier: DoraTier | null;
}

export interface ChangeFailureRate {
  pct: number | null;
  tier: DoraTier | null;
  failed_deploys: number;
  total_deploys: number;
}

export interface MeanTimeToRecovery {
  seconds: number | null;
  tier: DoraTier | null;
}

export interface DoraMetrics {
  deployment_frequency: DeploymentFrequency | null;
  lead_time_for_changes: LeadTimeForChanges | null;
  change_failure_rate: ChangeFailureRate | null;
  mean_time_to_recovery: MeanTimeToRecovery | null;
  generated_at: number;
}
