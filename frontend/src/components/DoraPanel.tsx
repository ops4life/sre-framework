import type { DoraMetrics, DoraTier } from '../types';
import { fmt } from '../lib/format';
import { useHoverTip } from './HoverTip';

const TIER_COLOR: Record<DoraTier, string> = {
  elite: 'var(--green)',
  high: 'var(--accent)',
  medium: 'var(--amber)',
  low: 'var(--danger)',
};

const TIER_LABEL: Record<DoraTier, string> = {
  elite: 'Elite',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function TierBadge({ tier }: { tier: DoraTier | null }) {
  if (!tier) return <span className="sre-label" style={{ fontSize: 9 }}>—</span>;
  return (
    <span style={{
      fontFamily: 'var(--mono)',
      fontSize: 9,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      color: TIER_COLOR[tier],
      border: `1px solid ${TIER_COLOR[tier]}`,
      borderRadius: 4,
      padding: '2px 6px',
    }}>
      {TIER_LABEL[tier]}
    </span>
  );
}

function fmtDuration(seconds: number | null): string {
  if (seconds === null) return '—';
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
  return `${(seconds / 86400).toFixed(1)}d`;
}

interface Props {
  dora: DoraMetrics;
}

export default function DoraPanel({ dora }: Props) {
  const deployFreqTip = useHoverTip('deployment_frequency');
  const leadTimeTip = useHoverTip('lead_time_for_changes');
  const cfrTip = useHoverTip('change_failure_rate');
  const mttrTip = useHoverTip('mean_time_to_recovery');

  const tiles = [
    {
      label: 'Deployment Frequency',
      value: dora.deployment_frequency ? `${fmt(dora.deployment_frequency.deploys_per_day, 2)}/day` : '—',
      sub: dora.deployment_frequency ? `${dora.deployment_frequency.total_deploys} deploys` : 'no data',
      tier: dora.deployment_frequency?.tier ?? null,
      tip: deployFreqTip,
    },
    {
      label: 'Lead Time for Changes',
      value: dora.lead_time_for_changes ? fmtDuration(dora.lead_time_for_changes.median_seconds) : '—',
      sub: dora.lead_time_for_changes ? `n=${dora.lead_time_for_changes.sample_size}` : 'no data',
      tier: dora.lead_time_for_changes?.tier ?? null,
      tip: leadTimeTip,
    },
    {
      label: 'Change Failure Rate',
      value: dora.change_failure_rate?.pct !== null && dora.change_failure_rate?.pct !== undefined
        ? `${dora.change_failure_rate.pct}%`
        : '—',
      sub: dora.change_failure_rate
        ? `${dora.change_failure_rate.failed_deploys}/${dora.change_failure_rate.total_deploys} deploys`
        : 'no data',
      tier: dora.change_failure_rate?.tier ?? null,
      tip: cfrTip,
    },
    {
      label: 'Mean Time to Recovery',
      value: dora.mean_time_to_recovery ? fmtDuration(dora.mean_time_to_recovery.seconds) : '—',
      sub: 'across correlated incidents',
      tier: dora.mean_time_to_recovery?.tier ?? null,
      tip: mttrTip,
    },
  ];

  return (
    <div className="sre-panel" data-tour="dora-metrics">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            DORA Metrics
          </h2>
          <p style={{ margin: '5px 0 0', fontSize: 12, color: 'var(--muted)' }}>Software delivery performance</p>
        </div>
        <span className="sre-mono-muted">GitHub Actions + Uptime Kuma</span>
      </div>

      <div className="sre-capacity-grid">
        {tiles.map((t, i) => (
          <div key={i} className="sre-sub-panel" style={{ padding: '12px 14px', cursor: 'pointer' }} {...t.tip.handlers}>
            {t.tip.tooltip}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="sre-label" style={{ fontSize: 9 }}>{t.label}</span>
              <TierBadge tier={t.tier} />
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>
              {t.value}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
              {t.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
