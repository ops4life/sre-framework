import { config } from '../lib/config';

const GREEN = 'var(--green)';
const AMBER = 'var(--amber)';

interface Props {
  allHealthy: boolean;
  error: string | null;
  clock: string;
  selectedService: string;
  tourOpen: boolean;
  onStartTour: () => void;
  metricWindow: string;
  onOpenMobileNav: () => void;
}

function IconCalendar() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="1" y="2.5" width="10" height="8.5" rx="1.5" />
      <line x1="1" y1="5.5" x2="11" y2="5.5" />
      <line x1="4" y1="1" x2="4" y2="3.5" />
      <line x1="8" y1="1" x2="8" y2="3.5" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="6" cy="6" r="4.5" />
      <polyline points="6,3.5 6,6 7.5,7.5" />
    </svg>
  );
}

export default function TopBar({ allHealthy, error, clock, selectedService, tourOpen, onStartTour, metricWindow, onOpenMobileNav }: Props) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  const windowLabel = metricWindow.endsWith('d') ? `${metricWindow.slice(0, -1)}-day window` : metricWindow;

  return (
    <div style={{ marginBottom: 36 }}>
      {/* Utility bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingBottom: 20,
        borderBottom: '1px solid var(--border)',
        marginBottom: 28,
        flexWrap: 'wrap'
      }}>
        {/* Left: hamburger (mobile) + status + active service */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="sre-hamburger"
            onClick={onOpenMobileNav}
            title="Open menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <line x1="2" y1="4" x2="14" y2="4" />
              <line x1="2" y1="8" x2="14" y2="8" />
              <line x1="2" y1="12" x2="14" y2="12" />
            </svg>
          </button>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg)',
            boxShadow: 'var(--shadow)'
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: allHealthy ? GREEN : AMBER, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              {allHealthy ? 'All systems operational' : 'Degraded SLO attainment'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg)',
            boxShadow: 'var(--shadow)'
          }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>SVC</span>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>/</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{selectedService}</span>
          </div>

          {error && (
            <div style={{ fontSize: 11, color: 'var(--danger)', fontFamily: 'var(--mono)', padding: '4px 10px', background: 'rgba(239,68,68,0.08)', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}
        </div>

        {/* Right: learn toggle + date/clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={onStartTour}
            title="Start tour guide — walks through each dashboard section"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              border: tourOpen ? '1px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-pill)',
              background: tourOpen ? 'var(--accent-tint)' : 'var(--bg)',
              color: tourOpen ? 'var(--accent)' : 'var(--muted)',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--mono)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow)',
              transition: 'var(--transition)',
            }}
          >
            <span style={{ fontSize: 13, lineHeight: 1 }}>▶</span>
            <span>Tour</span>
          </button>

          <div className="sre-hide-mobile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '7px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg)',
            boxShadow: 'var(--shadow)',
            fontFamily: 'var(--mono)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted)' }}>
              <IconCalendar />
              {dateStr}
            </span>
            <span style={{ width: 1, height: 12, background: 'var(--border)', flexShrink: 0 }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
              <IconClock />
              {clock}
            </span>
          </div>
          <div className="sre-show-mobile-only" style={{
            display: 'none',
            alignItems: 'center',
            gap: 5,
            padding: '7px 12px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg)',
            fontFamily: 'var(--mono)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text)'
          }}>
            <IconClock />
            {clock}
          </div>
        </div>
      </div>

      {/* Title row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <div>
          <h1 className="page-title">{config.title}</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)' }}>
            Live metrics, SLOs, golden signals, capacity, and error budget diagnostics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-2)',
            padding: '7px 13px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)'
          }}>
            {windowLabel}
          </div>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-2)',
            padding: '7px 13px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)'
          }}>
            Live · 5m resolution
          </div>
        </div>
      </div>
    </div>
  );
}
