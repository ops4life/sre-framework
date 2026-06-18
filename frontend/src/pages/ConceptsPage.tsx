import { useState, useEffect, useMemo } from 'react';
import { concepts } from '../content/concepts';

// LiveSparkline component that generates and animates mock telemetry data
function LiveSparkline({ color, baseVal, variance, type }: { color: string, baseVal: number, variance: number, type: 'latency' | 'traffic' | 'errors' | 'saturation' }) {
  const [data, setData] = useState<number[]>(() =>
    Array.from({ length: 25 }, () => {
      if (type === 'errors') return 0;
      return baseVal + (Math.random() - 0.5) * variance;
    })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1)];
        let newVal = baseVal;
        
        if (type === 'errors') {
          // Errors are normally 0, but sometimes spike
          newVal = Math.random() > 0.90 ? Math.random() * variance : 0;
        } else if (type === 'latency') {
          // Latency fluctuates, occasionally spikes
          const isSpike = Math.random() > 0.88;
          newVal = baseVal + (Math.random() - 0.45) * variance + (isSpike ? variance * 2.5 : 0);
        } else if (type === 'traffic') {
          // Traffic is a smooth wave with noise
          const time = Date.now() / 12000;
          newVal = baseVal + Math.sin(time) * (variance * 0.6) + (Math.random() - 0.5) * (variance * 0.3);
        } else {
          // Saturation fluctuates
          newVal = baseVal + (Math.random() - 0.5) * variance;
        }

        next.push(Math.max(0, newVal));
        return next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [baseVal, variance, type]);

  const width = 160;
  const height = 44;
  const maxVal = Math.max(...data, 10);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;

  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 10) - 5;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div style={{ position: 'relative', width: '100%', height: height, marginTop: 8 }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${type})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="3"
            fill={color}
            style={{ filter: `drop-shadow(0 0 2px ${color})` }}
          />
        )}
      </svg>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0s';
  
  const secondsTotal = Math.round(minutes * 60);
  const days = Math.floor(secondsTotal / (24 * 3600));
  const hours = Math.floor((secondsTotal % (24 * 3600)) / 3600);
  const mins = Math.floor((secondsTotal % 3600) / 60);
  const secs = secondsTotal % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

function formatExhaustionTime(days: number): string {
  if (days === Infinity || isNaN(days) || days > 365) return 'Never (no errors)';
  if (days < 1 / 24) {
    const mins = Math.round(days * 24 * 60);
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }
  if (days < 1) {
    const hrs = Math.round(days * 24);
    return `${hrs} hour${hrs !== 1 ? 's' : ''}`;
  }
  const d = Math.round(days * 10) / 10;
  return `${d} day${d !== 1 ? 's' : ''}`;
}

export default function ConceptsPage() {
  const [sloTarget, setSloTarget] = useState(99.9);
  const [simulatorTab, setSimulatorTab] = useState<'outage' | 'burn'>('outage');
  const [outageDuration, setOutageDuration] = useState(0); // in minutes
  const [errorRate, setErrorRate] = useState(0.05); // in %
  const [searchQuery, setSearchQuery] = useState('');

  const windowMinutes = 28 * 24 * 60; // 28d window = 40,320 mins

  // Outage calcs
  const allowedDowntimeMinutes = windowMinutes * (1 - sloTarget / 100);
  const maxOutageSlider = Math.max(10, Math.ceil(allowedDowntimeMinutes * 2));
  
  // Keep outage duration in bounds of slider max
  useEffect(() => {
    if (outageDuration > maxOutageSlider) {
      setOutageDuration(Math.round(maxOutageSlider / 2));
    }
  }, [sloTarget, maxOutageSlider, outageDuration]);

  const remainingBudgetPercent = ((allowedDowntimeMinutes - outageDuration) / allowedDowntimeMinutes) * 100;
  const sliUptimePercent = ((windowMinutes - outageDuration) / windowMinutes) * 100;
  const budgetBurnedPercent = (outageDuration / allowedDowntimeMinutes) * 100;

  // Burn calcs
  const burnRateMultiplier = errorRate / (100 - sloTarget);
  const timeToExhaustDays = burnRateMultiplier > 0 ? (28 / burnRateMultiplier) : Infinity;

  // Gauge details
  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const displayPercent = Math.max(0, Math.min(100, remainingBudgetPercent));
  const strokeDashoffset = circumference * (1 - displayPercent / 100);

  const budgetColor = remainingBudgetPercent > 50 
    ? 'var(--green)' 
    : remainingBudgetPercent > 0 
      ? 'var(--amber)' 
      : 'var(--danger)';

  // Scroll and highlight effect
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-pulse');
            setTimeout(() => {
              element.classList.remove('highlight-pulse');
            }, 2000);
          }, 150);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Filter terms
  const filteredConcepts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return Object.values(concepts);
    return Object.values(concepts).filter(c =>
      c.term.toLowerCase().includes(query) ||
      c.plain.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="cz-page">
      <div className="slide-up" style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Title */}
        <div className="cz-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="cz-page-title">SRE Learning Lab</div>
            <div className="cz-page-sub">// Interactive sandbox and terminology reference</div>
          </div>
          {/* Quick links to sections */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href="#simulator" className="tour-ghost-btn" style={{ textDecoration: 'none', fontSize: 10 }}>Playground</a>
            <a href="#signals" className="tour-ghost-btn" style={{ textDecoration: 'none', fontSize: 10 }}>Golden Signals</a>
            <a href="#definitions" className="tour-ghost-btn" style={{ textDecoration: 'none', fontSize: 10 }}>Definitions</a>
          </div>
        </div>

        {/* Top Sandbox & Flow Section */}
        <div id="simulator" className="concepts-grid">
          
          {/* SLO & Error Budget Playground */}
          <div className="cz-card concept-term-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="cz-card-head">
              <span className="cz-pre">▍</span> SRE Playground: SLO & Error Budget Simulator
            </div>
            
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* SLO Target Parameter Selector */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>1. Set SLO Reliability Target</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--accent)' }}>
                    {sloTarget.toFixed(sloTarget > 99.9 ? 3 : 1)}%
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {[99.0, 99.5, 99.9, 99.99].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      className={`cz-seg-opt ${sloTarget === preset ? 'active' : ''}`}
                      onClick={() => setSloTarget(preset)}
                      style={{ flex: 1, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', padding: '6px 0' }}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="90"
                  max="99.999"
                  step="0.001"
                  value={sloTarget}
                  onChange={(e) => setSloTarget(parseFloat(e.target.value))}
                  className="concept-slider"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                  <span>90% (Low)</span>
                  <span>99.999% (High Reliability)</span>
                </div>
              </div>

              {/* Toggle Simulator Type */}
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                <div className="cz-seg" style={{ width: '100%' }}>
                  <button
                    type="button"
                    className={`cz-seg-opt ${simulatorTab === 'outage' ? 'active' : ''}`}
                    onClick={() => setSimulatorTab('outage')}
                    style={{ flex: 1, padding: '8px 0' }}
                  >
                    Outage Downtime Simulator
                  </button>
                  <button
                    type="button"
                    className={`cz-seg-opt ${simulatorTab === 'burn' ? 'active' : ''}`}
                    onClick={() => setSimulatorTab('burn')}
                    style={{ flex: 1, padding: '8px 0' }}
                  >
                    Burn Rate Simulator
                  </button>
                </div>
              </div>

              {/* Active Tab Controls & Outputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'center' }}>
                
                {/* Left Side: Parameters Slider */}
                <div>
                  {simulatorTab === 'outage' ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>2. Simulate Outage Duration</span>
                        <span style={{ fontSize: 13, fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--danger)' }}>
                          {outageDuration} mins
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={maxOutageSlider}
                        step="1"
                        value={outageDuration}
                        onChange={(e) => setOutageDuration(parseInt(e.target.value))}
                        className="concept-slider"
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                        <span>0 mins</span>
                        <span>{maxOutageSlider} mins</span>
                      </div>
                      
                      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
                        <p style={{ margin: 0 }}>
                          For a <strong>{sloTarget}%</strong> SLO over a 28-day window, your allowed error budget is{' '}
                          <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 600 }}>
                            {formatDuration(allowedDowntimeMinutes)}
                          </span>{' '}
                          of downtime.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>2. Simulate Current Error Rate</span>
                        <span style={{ fontSize: 13, fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--danger)' }}>
                          {errorRate.toFixed(2)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="5.0"
                        step="0.05"
                        value={errorRate}
                        onChange={(e) => setErrorRate(parseFloat(e.target.value))}
                        className="concept-slider"
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                        <span>0.01% (Low)</span>
                        <span>5.0% (High Errors)</span>
                      </div>

                      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
                        <p style={{ margin: 0 }}>
                          A sustained error rate represents what percent of total user requests are failing right now.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Circular Radial Gauge & Quick Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0', borderLeft: '1px solid var(--border)' }}>
                  
                  {simulatorTab === 'outage' ? (
                    <>
                      {/* Gauge */}
                      <div style={{ position: 'relative', width: 96, height: 96 }}>
                        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
                          {/* Background Track */}
                          <circle cx="48" cy="48" r={radius} fill="transparent" stroke="var(--surface-3)" strokeWidth={strokeWidth} />
                          {/* Active Budget Fill */}
                          <circle
                            cx="48"
                            cy="48"
                            r={radius}
                            fill="transparent"
                            stroke={budgetColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
                          />
                        </svg>
                        {/* Middle Text */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--mono)', color: remainingBudgetPercent <= 0 ? 'var(--danger)' : 'var(--text)' }}>
                            {Math.max(0, remainingBudgetPercent).toFixed(0)}%
                          </span>
                          <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.05, color: 'var(--muted)' }}>Budget</span>
                        </div>
                      </div>

                      {/* Outage Stats */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', padding: '12px 16px 0', fontSize: 11 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--muted)' }}>SLI / Uptime:</span>
                          <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{sliUptimePercent.toFixed(3)}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--muted)' }}>Downtime Burned:</span>
                          <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: remainingBudgetPercent <= 0 ? 'var(--danger)' : 'var(--text)' }}>
                            {budgetBurnedPercent > 100 ? '> 100%' : `${budgetBurnedPercent.toFixed(0)}%`}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Burn Gauge */}
                      <div style={{ position: 'relative', width: 96, height: 96 }}>
                        <svg width="96" height="96" viewBox="0 0 96 96">
                          {/* Outer warning ring that pulses if burnRate > 2 */}
                          <circle
                            cx="48"
                            cy="48"
                            r={radius}
                            fill="transparent"
                            stroke={burnRateMultiplier > 2 ? 'var(--danger)' : burnRateMultiplier > 1 ? 'var(--amber)' : 'var(--green)'}
                            strokeWidth={3}
                            style={{
                              opacity: 0.15,
                              animation: burnRateMultiplier > 1 ? 'pulse 1.5s infinite' : 'none'
                            }}
                          />
                          {/* Inner center text */}
                          <circle cx="48" cy="48" r={radius - 4} fill="var(--surface-2)" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--mono)', color: burnRateMultiplier > 2 ? 'var(--danger)' : burnRateMultiplier > 1 ? 'var(--amber)' : 'var(--green)' }}>
                            {burnRateMultiplier > 999 ? '> 999x' : `${burnRateMultiplier.toFixed(1)}x`}
                          </span>
                          <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.05, color: 'var(--muted)' }}>Burn Rate</span>
                        </div>
                      </div>

                      {/* Burn Stats */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', padding: '12px 16px 0', fontSize: 11 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--muted)' }}>Time to Empty:</span>
                          <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: burnRateMultiplier > 2 ? 'var(--danger)' : 'var(--text)' }}>
                            {formatExhaustionTime(timeToExhaustDays)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--muted)' }}>Safety Threshold:</span>
                          <span style={{ fontFamily: 'var(--mono)', color: 'var(--muted)' }}>&lt; 2.0x</span>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </div>

              {/* Status Banner */}
              <div style={{
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                border: '1px solid',
                background: simulatorTab === 'outage' 
                  ? (remainingBudgetPercent > 50 ? 'rgba(34,197,94,0.06)' : remainingBudgetPercent > 0 ? 'rgba(250,204,21,0.06)' : 'rgba(239,68,68,0.06)')
                  : (burnRateMultiplier <= 1 ? 'rgba(34,197,94,0.06)' : burnRateMultiplier <= 2 ? 'rgba(250,204,21,0.06)' : 'rgba(239,68,68,0.06)'),
                borderColor: simulatorTab === 'outage'
                  ? (remainingBudgetPercent > 50 ? 'rgba(34,197,94,0.15)' : remainingBudgetPercent > 0 ? 'rgba(250,204,21,0.15)' : 'rgba(239,68,68,0.15)')
                  : (burnRateMultiplier <= 1 ? 'rgba(34,197,94,0.15)' : burnRateMultiplier <= 2 ? 'rgba(250,204,21,0.15)' : 'rgba(239,68,68,0.15)'),
                color: simulatorTab === 'outage'
                  ? (remainingBudgetPercent > 50 ? 'var(--green)' : remainingBudgetPercent > 0 ? 'var(--amber)' : 'var(--danger)')
                  : (burnRateMultiplier <= 1 ? 'var(--green)' : burnRateMultiplier <= 2 ? 'var(--amber)' : 'var(--danger)'),
                fontSize: 12,
                lineHeight: 1.45
              }}>
                {simulatorTab === 'outage' ? (
                  remainingBudgetPercent > 50 ? (
                    <span style={{ color: 'var(--text)' }}>🟢 <strong>Budget Healthy</strong>. Outage is well within bounds. Focus on engineering risk and shipping new features.</span>
                  ) : remainingBudgetPercent > 0 ? (
                    <span style={{ color: 'var(--text)' }}>🟡 <strong>Warning: Budget Exhausting</strong>. Over 50% of your allowed downtime is consumed. Deploy with caution and monitor closely.</span>
                  ) : (
                    <span style={{ color: 'var(--text)' }}>🔴 <strong>SLO Breached!</strong> Error budget fully exhausted. Action required: Freeze non-essential deploys and redirect engineering to reliability.</span>
                  )
                ) : (
                  burnRateMultiplier <= 1 ? (
                    <span style={{ color: 'var(--text)' }}>🟢 <strong>Sustainable Burn Rate</strong>. At this pace, you will not exhaust your budget before the end of the rolling window.</span>
                  ) : burnRateMultiplier <= 2 ? (
                    <span style={{ color: 'var(--text)' }}>🟡 <strong>Elevated Burn Rate</strong>. Budget is exhausting faster than standard. Check dashboard alarms.</span>
                  ) : (
                    <span style={{ color: 'var(--text)' }}>🔴 <strong>Critical Burn Rate!</strong> Budget is depleting rapidly. Exhaustion is imminent. Investigate traffic and system logs.</span>
                  )
                )}
              </div>

            </div>
          </div>

          {/* SRE Workflow / Flowchart Visual */}
          <div className="cz-card concept-term-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="cz-card-head">
              <span className="cz-pre">▍</span> How SRE Reliability Management Works
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, height: '100%', justifyContent: 'space-between' }}>
              
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                Uptime is not just a binary metric. A structured workflow ensures your systems remain highly available without blocking software deployments:
              </div>

              {/* Dynamic SVG Flow Diagram */}
              <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: 14, padding: '10px 0' }}>
                
                {/* Flow Node 1: SLI */}
                <div className="sre-sub-panel" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(var(--accent-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: 13 }}>
                    1
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>SLI (Measurement)</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Records the actual success ratio. E.g. good requests / total requests.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', height: 16, color: 'var(--border)' }}>
                  <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                    <path d="M6 0V16M6 16L3 13M6 16L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Flow Node 2: SLO */}
                <div className="sre-sub-panel" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(59,130,246, 0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: 'var(--blue)', fontSize: 13 }}>
                    2
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>SLO (Reliability Target)</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>The target reliability bar. E.g. 99.9% uptime. Compares SLI with target.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', height: 16, color: 'var(--border)' }}>
                  <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                    <path d="M6 0V16M6 16L3 13M6 16L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Flow Node 3: Error Budget */}
                <div className="sre-sub-panel" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(34,197,94, 0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: 'var(--green)', fontSize: 13 }}>
                    3
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>Error Budget (Allowed Risk)</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Buffer: 100% − SLO. Used for deploys and outages. Breaches trigger policy action.</div>
                  </div>
                </div>

              </div>

              <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                💡 An SLO of 100% leaves no room for engineering risk or upgrades.
              </div>

            </div>
          </div>
        </div>

        {/* Golden Signals Section */}
        <div id="signals" className="cz-card concept-term-card">
          <div className="cz-card-head">
            <span className="cz-pre">▍</span> The Four Golden Signals of Monitoring
          </div>
          
          <div style={{ padding: 20 }}>
            <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              Google's SRE handbook describes these four signals as fundamental for evaluating any user-facing systems. Hover to view the live simulation telemetry:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              
              {/* Latency */}
              <div className="sre-sub-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>1. Latency</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>p99 ms</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '6px 0 0', lineHeight: 1.45 }}>
                    Response time for requests. High p99 indicates slow outlier paths or thread pooling.
                  </p>
                </div>
                <div>
                  <LiveSparkline color="var(--accent)" baseVal={120} variance={35} type="latency" />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginTop: 6, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    histogram_quantile(0.99, rate(...))
                  </div>
                </div>
              </div>

              {/* Traffic */}
              <div className="sre-sub-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>2. Traffic</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>req / sec</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '6px 0 0', lineHeight: 1.45 }}>
                    Demand on the system. E.g. HTTP requests per second. Helps predict queue congestion.
                  </p>
                </div>
                <div>
                  <LiveSparkline color="var(--blue)" baseVal={80} variance={40} type="traffic" />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginTop: 6 }}>
                    sum(rate(requests_total[5m]))
                  </div>
                </div>
              </div>

              {/* Errors */}
              <div className="sre-sub-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)' }}>3. Errors</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>5xx %</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '6px 0 0', lineHeight: 1.45 }}>
                    The rate of requests that fail. HTTP 5xx responses burn error budget directly.
                  </p>
                </div>
                <div>
                  <LiveSparkline color="var(--danger)" baseVal={0} variance={8} type="errors" />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginTop: 6 }}>
                    rate(errors_total) / rate(all)
                  </div>
                </div>
              </div>

              {/* Saturation */}
              <div className="sre-sub-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>4. Saturation</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--muted)' }}>CPU %</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-2)', margin: '6px 0 0', lineHeight: 1.45 }}>
                    Resource utilization. High CPU/Memory saturation leads to cascading latency spikes.
                  </p>
                </div>
                <div>
                  <LiveSparkline color="var(--green)" baseVal={45} variance={15} type="saturation" />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', marginTop: 6 }}>
                    container_cpu_usage_ratio
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Detailed Definitions List */}
        <div id="definitions" className="cz-card">
          <div className="cz-card-head" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="cz-pre">▍</span> Glossary of Terminology
            </div>
            {/* Search Box */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search glossary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 12px 6px 28px',
                  color: 'var(--text)',
                  fontSize: 12,
                  fontFamily: 'var(--sans)',
                  width: 180,
                  outline: 'none'
                }}
              />
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="7" cy="7" r="5" />
                <line x1="11" y1="11" x2="15" y2="15" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="cz-list">
            {filteredConcepts.length > 0 ? (
              filteredConcepts.map((c, i) => (
                <div
                  key={c.id}
                  id={c.anchor}
                  className="cz-row concept-term-card"
                  style={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 6,
                    padding: '16px 20px',
                    borderBottom: i === filteredConcepts.length - 1 ? 'none' : '1px solid var(--border)',
                    scrollMarginTop: 80
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>{c.term}</span>
                    <a 
                      href={`#${c.anchor}`} 
                      style={{ 
                        fontSize: 10, 
                        color: 'var(--muted)', 
                        textDecoration: 'none', 
                        fontFamily: 'var(--mono)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '1px 4px'
                      }}
                    >
                      #
                    </a>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{c.plain}</span>
                  {c.computedAs && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 0.05, fontFamily: 'var(--mono)' }}>Computed as:</span>
                      <code style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>
                        {c.computedAs}
                      </code>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                No glossary terms match your search.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
