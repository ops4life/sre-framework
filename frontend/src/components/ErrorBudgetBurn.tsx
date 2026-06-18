import type { ErrorBudgetBurn as ErrorBudgetBurnData } from '../types';
import { fmt, spark, area } from '../lib/format';

const RED = 'var(--danger)';

interface Props {
  burn: ErrorBudgetBurnData;
  selectedService: string;
}

export default function ErrorBudgetBurn({ burn, selectedService }: Props) {
  const burnLine = spark(burn.burn_curve, 600, 180, 6);
  const burnArea = area(burn.burn_curve, 600, 180, 6);

  const exhaustDays = (() => {
    const rate = burn.burn_rate_6h;
    const remaining = burn.remaining_pct;
    if (!rate || rate <= 0 || remaining === null) return '—';
    return `~${Math.round((remaining / 100) * 28 / rate)} days`;
  })();
  const burnPolicy = (burn.burn_rate_6h ?? 0) > 2 ? 'Deploy freeze' : 'Deploys allowed';

  return (
    <div className="sre-panel" data-tour="error-budget-burn">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            Error Budget Burn — {selectedService}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--muted)' }}>
            {burn.target}% target · {burn.budget_pct.toFixed(2)}% budget / 28d
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 'clamp(20px, 4.5vw, 32px)', fontWeight: 700, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {fmt(burn.remaining_pct, 1)}%
          </div>
          <div className="sre-label" style={{ fontSize: 9, marginTop: 6 }}>budget remaining</div>
        </div>
      </div>

      <svg viewBox="0 0 600 180" preserveAspectRatio="none" style={{ width: '100%', height: 180, overflow: 'visible' }}>
        <defs>
          <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <line x1="0" y1="45" x2="600" y2="45" stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1="0" y1="90" x2="600" y2="90" stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1="0" y1="135" x2="600" y2="135" stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
        <path d={burnArea} fill="url(#burnGrad)" />
        <path d={burnLine} fill="none" stroke="var(--accent)" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', paddingBottom: 16 }}>
        <span>28d ago</span><span>21d</span><span>14d</span><span>7d</span><span>now</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginTop: 16,
        paddingTop: 18,
        borderTop: '1px solid var(--border)'
      }}>
        <div className="sre-sub-panel" style={{ padding: '12px 14px' }}>
          <div className="sre-label" style={{ fontSize: 9 }}>Burn rate (1h)</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
            {burn.burn_rate_1h !== null ? `${burn.burn_rate_1h}×` : '—'}
          </div>
        </div>
        <div className="sre-sub-panel" style={{ padding: '12px 14px' }}>
          <div className="sre-label" style={{ fontSize: 9 }}>Burn rate (6h)</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
            {burn.burn_rate_6h !== null ? `${burn.burn_rate_6h}×` : '—'}
          </div>
        </div>
        <div className="sre-sub-panel" style={{ padding: '12px 14px' }}>
          <div className="sre-label" style={{ fontSize: 9 }}>Budget exhausts</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
            {exhaustDays}
          </div>
        </div>
        <div className="sre-sub-panel" style={{ padding: '12px 14px', borderLeft: `3px solid ${burnPolicy === 'Deploys allowed' ? 'var(--accent)' : RED}` }}>
          <div className="sre-label" style={{ fontSize: 9 }}>Policy</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: burnPolicy === 'Deploys allowed' ? 'var(--text)' : RED, marginTop: 4 }}>
            {burnPolicy}
          </div>
        </div>
      </div>
    </div>
  );
}
