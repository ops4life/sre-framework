import type { Capacity } from '../types';
import { fmt } from '../lib/format';

const GREEN = 'var(--green)';
const AMBER = 'var(--amber)';

interface Props {
  capacity: Capacity;
  selectedService: string;
}

export default function CapacityGrid({ capacity, selectedService }: Props) {
  const cards = [
    { label: 'VPS CPU', used: capacity.vps_cpu_pct },
    { label: 'VPS Memory', used: capacity.vps_memory_pct },
    { label: 'VPS Disk', used: capacity.vps_disk_pct },
    { label: `${selectedService} CPU`, used: capacity.service_container_cpu_pct },
    { label: `${selectedService} Memory`, used: capacity.service_container_memory_pct },
  ].map(c => ({ ...c, color: (c.used ?? 0) > 80 ? AMBER : GREEN }));

  return (
    <div className="sre-panel" data-tour="capacity">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            Capacity
          </h2>
          <p style={{ margin: '5px 0 0', fontSize: 12, color: 'var(--muted)' }}>VPS + {selectedService} container resource usage</p>
        </div>
        <span className="sre-mono-muted">node_exporter + dockerstats</span>
      </div>

      <div className="sre-capacity-grid">
        {cards.map((c, i) => (
          <div key={i} className="sre-sub-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="sre-label" style={{ fontSize: 10 }}>{c.label}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: c.color }}>{fmt(c.used, 1)}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden', marginTop: 14 }}>
              <div style={{
                height: '100%',
                width: `${c.used ?? 0}%`,
                borderRadius: 3,
                background: c.color,
                boxShadow: `0 0 6px ${c.color}`
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
