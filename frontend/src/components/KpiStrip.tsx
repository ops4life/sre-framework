import type { Kpis } from '../types';
import { fmt } from '../lib/format';
import { useHoverTip } from './HoverTip';

const GREEN = 'var(--green)';
const AMBER = 'var(--amber)';
const RED = 'var(--danger)';
const BLUE = 'var(--blue)';

interface Props {
  kpis: Kpis;
  sloCount: number;
  allHealthy: boolean;
}

interface CardDef {
  label: string;
  value: string;
  unit: string;
  dot: string;
  sub: string;
  tip: string;
}

function KpiCard({ k }: { k: CardDef }) {
  const { handlers, tooltip } = useHoverTip(k.tip);
  return (
    <div className="sre-panel" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} {...handlers}>
      {tooltip}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span className="sre-label" style={{ fontSize: 10 }}>{k.label}</span>
        <span style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: k.dot,
          boxShadow: `0 0 8px ${k.dot}`,
          flexShrink: 0
        }} />
      </div>
      <div style={{
        fontFamily: 'var(--sans)',
        fontSize: 'clamp(20px, 4.5vw, 32px)',
        fontWeight: 700,
        color: 'var(--text)',
        marginTop: 14,
        lineHeight: 1,
        letterSpacing: '-0.02em'
      }}>
        {k.value}
        <span style={{ fontSize: 'clamp(11px, 2.5vw, 14px)', color: 'var(--muted)', fontWeight: 500, marginLeft: 2 }}>{k.unit}</span>
      </div>
      {k.sub && (
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>
          {k.sub}
        </div>
      )}
    </div>
  );
}

export default function KpiStrip({ kpis, sloCount, allHealthy }: Props) {
  const cards: CardDef[] = [
    { label: 'Composite SLO', value: fmt(kpis.composite_slo, 2), unit: '%', dot: allHealthy ? GREEN : AMBER, sub: `${sloCount} services`, tip: 'composite_slo' },
    { label: 'Error budget', value: fmt(kpis.error_budget_remaining_pct, 1), unit: '%', dot: (kpis.error_budget_remaining_pct ?? 100) < 20 ? RED : GREEN, sub: 'remaining', tip: 'error_budget' },
    { label: 'Req rate', value: fmt(kpis.selected_request_rate, 2), unit: '/s', dot: BLUE, sub: 'requests', tip: 'traffic' },
    { label: 'p99 latency', value: fmt(kpis.selected_latency_p99_ms, 0), unit: 'ms', dot: (kpis.selected_latency_p99_ms ?? 0) > 500 ? AMBER : GREEN, sub: 'response', tip: 'latency' },
    { label: 'Error rate', value: fmt(kpis.selected_error_rate_pct, 2), unit: '%', dot: kpis.selected_error_rate_pct > 1 ? RED : GREEN, sub: '5xx errors', tip: 'errors' },
  ];

  return (
    <div className="sre-kpi-grid" data-tour="kpi-strip">
      {cards.map((k, i) => <KpiCard key={i} k={k} />)}
    </div>
  );
}
