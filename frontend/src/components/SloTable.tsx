import type { SloRow } from '../types';
import { fmt, spark } from '../lib/format';
import { useHoverTip } from './HoverTip';

const GREEN = 'var(--green)';
const AMBER = 'var(--amber)';
const RED = 'var(--danger)';

interface Props {
  rows: SloRow[];
  selected: string;
}

export default function SloTable({ rows, selected }: Props) {
  const sloTip = useHoverTip('slo');
  return (
    <div className="sre-panel" data-tour="slo-table">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2
          style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em', cursor: 'pointer' }}
          {...sloTip.handlers}
        >
          {sloTip.tooltip}
          Service Level Objectives
        </h2>
        <span className="sre-mono-muted">28d rolling</span>
      </div>
      <p style={{ margin: '0 0 20px', fontSize: 12, color: 'var(--muted)' }}>
        SLI attainment vs target · error budget remaining
      </p>

      <div className="sre-slo-head" style={{ padding: '0 8px 12px', borderBottom: '1px solid var(--border)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600 }}>
        <span>Service</span><span>SLI · 28d</span><span>Error budget</span><span>Trend</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        {rows.map((sv, i) => {
          const healthy = sv.sli !== null && sv.sli >= sv.slo_target;
          const statusColor = sv.sli === null ? 'var(--muted)' : healthy ? GREEN : AMBER;
          const budget = sv.error_budget_remaining ?? 0;
          const budgetColor = budget < 20 ? RED : budget < 40 ? AMBER : GREEN;
          const isSelected = sv.name === selected;
          return (
            <div
              key={i}
              className="sre-slo-row"
              style={{
                padding: '12px 8px',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--accent-tint)' : 'transparent',
                transition: 'var(--transition)',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: statusColor,
                    boxShadow: `0 0 6px ${statusColor}`,
                    flex: 'none'
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? 'var(--text)' : 'var(--text-2)' }}>{sv.name}</span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 4, paddingLeft: 16 }}>
                  target {sv.slo_target}%
                </div>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: statusColor }}>
                <span className="sre-mobile-label">SLI</span>{fmt(sv.sli, 2)}%
              </div>
              <div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${sv.error_budget_remaining ?? 0}%`, borderRadius: 3, background: budgetColor }} />
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 5 }}>
                  <span className="sre-mobile-label">Budget</span>{fmt(sv.error_budget_remaining, 1)}% left
                </div>
              </div>
              <svg viewBox="0 0 120 30" preserveAspectRatio="none" style={{ width: '100%', height: 30, overflow: 'visible' }}>
                <path d={spark(sv.sparkline, 120, 30, 3)} fill="none" stroke={statusColor} strokeWidth={2} vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
