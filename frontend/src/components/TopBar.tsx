const GREEN = 'var(--green)';
const AMBER = 'var(--amber)';
const RED = 'var(--danger)';

interface Props {
  allHealthy: boolean;
  error: string | null;
  clock: string;
  selectedService: string;
  learnMode: boolean;
  onToggleLearn: () => void;
}

export default function TopBar({ allHealthy, error, clock, selectedService, learnMode, onToggleLearn }: Props) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div style={{ marginBottom: 36 }}>
      {/* Top Utility Bar */}
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
        {/* Left: Status and service capsule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Status Capsule */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg)',
            boxShadow: 'var(--shadow)'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: allHealthy ? GREEN : AMBER }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>
              {allHealthy ? 'All systems operational' : 'Degraded SLO attainment'}
            </span>
          </div>

          {/* Active Service Capsule */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg)',
            boxShadow: 'var(--shadow)'
          }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>SVC //</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{selectedService}</span>
          </div>

          {error && (
            <div style={{ fontSize: 11, color: RED, fontFamily: 'var(--mono)', padding: '4px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
              ERR: {error}
            </div>
          )}
        </div>

        {/* Right: Learn toggle + Date/Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Learn Mode Toggle */}
          <button
            onClick={onToggleLearn}
            title="Toggle Learn Mode — shows concept explanations on each panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              border: learnMode ? '1px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: 'var(--radius-pill)',
              background: learnMode ? 'var(--accent-tint)' : 'var(--bg)',
              color: learnMode ? 'var(--accent)' : 'var(--muted)',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'var(--mono)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow)',
              transition: 'var(--transition)',
            }}
          >
            <span>?</span>
            <span>{learnMode ? 'Learn ON' : 'Learn'}</span>
          </button>

          {/* Greeting */}
          <div className="sre-hide-mobile" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>
              Hi Operator, <span style={{ color: 'var(--muted)' }}>Welcome to SRE Ops</span>
            </div>
          </div>

          {/* Date & Clock Capsule */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 18px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--bg)',
            boxShadow: 'var(--shadow)',
            fontFamily: 'var(--mono)'
          }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>📅 {dateStr}</span>
            <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>⏰ {clock}</span>
          </div>
        </div>
      </div>

      {/* Title section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <h1 className="page-title">SRE Ops Mission Control</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--muted)' }}>
              Live metrics, SLOs, golden signals, capacity, and error budget diagnostics.
            </p>
          </div>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0b0d0c',
            fontWeight: 800,
            fontSize: 18,
            boxShadow: '0 4px 10px rgba(202, 255, 4, 0.3)',
            flexShrink: 0
          }}>*</div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-2)',
            padding: '8px 14px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)'
          }}>
            🗓 28-day window
          </div>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-2)',
            padding: '8px 14px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-pill)'
          }}>
            ⚡ Live (5m)
          </div>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#0b0d0c',
            padding: '8px 14px',
            background: 'var(--accent)',
            borderRadius: 'var(--radius-pill)',
            boxShadow: '0 4px 12px rgba(202, 255, 4, 0.2)'
          }}>
            Active
          </div>
        </div>
      </div>
    </div>
  );
}
