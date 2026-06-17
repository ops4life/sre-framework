import type { GoldenSignals as GoldenSignalsData } from '../types';
import { fmt, spark, area } from '../lib/format';
import HoverTip from './HoverTip';

const GREEN = 'var(--green)';
const AMBER = 'var(--amber)';
const RED = 'var(--danger)';
const BLUE = 'var(--blue)';

interface Props {
  golden: GoldenSignalsData;
  selectedService: string;
}

const SIGNAL_TIPS: Record<string, string> = {
  lat: 'latency',
  traf: 'traffic',
  err: 'errors',
  sat: 'saturation',
};

export default function GoldenSignals({ golden, selectedService }: Props) {
  const signals = [
    { id: 'lat', label: 'Latency p99', value: fmt(golden.latency_p99_ms, 0), unit: 'ms', color: (golden.latency_p99_ms ?? 0) > 500 ? AMBER : GREEN, vals: golden.series.latency_p99_ms },
    { id: 'traf', label: 'Traffic', value: fmt(golden.request_rate, 2), unit: 'req/s', color: BLUE, vals: golden.series.request_rate },
    { id: 'err', label: 'Errors', value: fmt(golden.error_rate_pct, 2), unit: '%', color: golden.error_rate_pct > 1 ? RED : GREEN, vals: golden.series.error_rate_pct },
    { id: 'sat', label: 'Saturation', value: fmt(golden.saturation_pct, 0), unit: '%', color: (golden.saturation_pct ?? 0) > 80 ? AMBER : GREEN, vals: golden.series.saturation_pct },
  ].map(g => ({ ...g, line: spark(g.vals, 120, 36, 3), area: area(g.vals, 120, 36, 3) }));

  return (
    <div className="sre-panel" data-tour="golden-signals">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          Golden Signals
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--accent)',
            animation: 'pulse 2s infinite'
          }} />
          <span className="sre-label" style={{ fontSize: 9, color: 'var(--accent)' }}>LIVE</span>
        </div>
      </div>
      <p style={{ margin: '0 0 20px', fontSize: 12, color: 'var(--muted)' }}>
        {selectedService} · 5m windows
      </p>

      <div className="sre-signals-grid">
        {signals.map(g => (
          <div key={g.id} className="sre-sub-panel">
            <div className="sre-label" style={{ fontSize: 10 }}>
              {g.label}
              <HoverTip conceptId={SIGNAL_TIPS[g.id]} />
            </div>
            <div style={{
              fontFamily: 'var(--sans)',
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 700,
              color: 'var(--text)',
              marginTop: 8,
              lineHeight: 1
            }}>
              {g.value}
              <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', color: 'var(--muted)', fontWeight: 500, marginLeft: 2 }}>{g.unit}</span>
            </div>
            <svg viewBox="0 0 120 36" preserveAspectRatio="none" style={{ width: '100%', height: 38, marginTop: 12, overflow: 'visible' }}>
              <defs>
                <linearGradient id={`gs-${g.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={g.color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={g.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <path d={g.area} fill={`url(#gs-${g.id})`} />
              <path d={g.line} fill="none" stroke={g.color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
