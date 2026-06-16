// SRE Framework UI Kit — Dashboard Components v2 (Redesigned)
// Capture CDN React BEFORE support.js overwrites window.React
const React = window.React;
const ReactDOM = window.ReactDOM;
window.__sreReact = React;
window.__sreReactDOM = ReactDOM;

const { spark: spk, area: ar, fmt, badge } = window.DashUtils;
const GREEN = '#22c55e', AMBER = '#facc15', RED = '#ef4444', BLUE = '#3b82f6', LIME = '#caff04';

// ── Style helpers ─────────────────────────────────────────────────────────────
const crd = (p) => ({ background:'var(--card-bg, var(--bg))', borderRadius:20, border:'1px solid var(--border)', boxShadow:'var(--shadow)', ...p });
const lcirc = (sz=32) => ({ width:sz, height:sz, borderRadius:'50%', background:LIME, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(202,255,4,0.3)' });
const pillBtn = (active) => ({ display:'inline-flex', alignItems:'center', padding:'5px 12px', borderRadius:999, fontSize:11, fontWeight:600, cursor:'pointer', background: active ? '#161718' : 'var(--surface-2)', color: active ? LIME : 'var(--muted)', transition:'all 0.2s', border: active ? 'none' : '1px solid var(--border)', fontFamily:'var(--font-sans)' });
const chip = (ok) => ({ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:999, background: ok ? 'rgba(202,255,4,0.18)' : 'rgba(239,68,68,0.12)', color: ok ? '#4a7000' : RED, fontSize:10, fontWeight:700, fontFamily:'var(--font-mono)', border: ok ? '1px solid rgba(202,255,4,0.3)' : '1px solid rgba(239,68,68,0.2)' });
const LBL = { fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--muted)' };
const MN  = { fontFamily:'var(--font-mono)' };

function statusC(sli, target) { return (sli !== null && sli >= target) ? GREEN : AMBER; }

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function BarChart({ values, height = 90 }) {
  if (!values || !values.length) return null;
  const max = Math.max(...values);
  const n = values.length;
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height, overflow:'hidden' }}>
      {values.map((v, i) => {
        const h = Math.max(4, (v / max) * height);
        const isLast = i === n - 1;
        const isMax  = v === max;
        const opacity = isLast || isMax ? 1 : 0.12 + (i / n) * 0.5;
        return (
          <div key={i} style={{ flex:1, height:h, borderRadius:'4px 4px 0 0', background: (isLast || isMax) ? LIME : 'var(--text)', opacity, transition:'height 0.3s ease' }} />
        );
      })}
    </div>
  );
}

// ── Responsive hook ───────────────────────────────────────────────────────────
function useIsMobile(breakpoint) {
  const bp = breakpoint || 768;
  const [mobile, setMobile] = React.useState(() => window.innerWidth < bp);
  React.useEffect(() => {
    const handler = () => setMobile(window.innerWidth < bp);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [bp]);
  return mobile;
}

// ── Service button (shared) ───────────────────────────────────────────────────
function SvcBtn({ svc, active, onSelect, cardBg }) {
  const d = window.MOCK_DATA[svc];
  const healthy = d?.slo_table?.every(r => r.sli !== null && r.sli >= r.slo_target);
  return (
    <button onClick={() => onSelect(svc)} title={svc}
      style={{ width:44, height:44, borderRadius:'50%', border:`2px solid ${active ? LIME : 'var(--border)'}`, background: active ? LIME : 'var(--surface-2)', color: active ? '#0b0d0c' : 'var(--muted)', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', flexShrink:0, position:'relative', fontFamily:'var(--font-sans)' }}>
      {badge(svc)}
      {!active && <span style={{ position:'absolute', top:1, right:1, width:9, height:9, borderRadius:'50%', background: healthy ? GREEN : AMBER, border:`2px solid ${cardBg || 'var(--bg)'}`, boxSizing:'border-box' }} />}
    </button>
  );
}

// ── Left Sidebar (desktop) ────────────────────────────────────────────────────
function LeftSidebar({ services, selected, onSelect, theme, onToggle, cardBg, collapsed }) {
  return (
    <nav style={{
      width: collapsed ? 0 : 72,
      minWidth: collapsed ? 0 : 72,
      display:'flex', flexDirection:'column', alignItems:'center', gap:10,
      padding: collapsed ? 0 : '20px 0',
      background: cardBg || 'var(--bg)',
      borderRight: collapsed ? 'none' : '1px solid var(--border)',
      flexShrink:0, position:'sticky', top:0, height:'100vh',
      overflowY:'auto', overflowX:'hidden',
      transition:'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {!collapsed && <>
        <div style={{ ...lcirc(40), marginBottom:8 }}>
          <span style={{ fontSize:24, fontWeight:800, color:'#0b0d0c' }}>*</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8, flex:1 }}>
          {services.map(svc => (
            <SvcBtn key={svc} svc={svc} active={svc === selected} onSelect={onSelect} cardBg={cardBg} />
          ))}
        </div>
        <button onClick={onToggle} style={{ width:44, height:44, borderRadius:'50%', border:'1px solid var(--border)', background:'var(--surface-2)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text)', marginTop:'auto' }}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </>}
    </nav>
  );
}

// ── Bottom Nav (mobile) ───────────────────────────────────────────────────────
function BottomNav({ services, selected, onSelect, theme, onToggle, cardBg }) {
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, height:64, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', background: cardBg || 'var(--bg)', borderTop:'1px solid var(--border)', zIndex:200, gap:8 }}>
      <div style={{ ...lcirc(36) }}>
        <span style={{ fontSize:20, fontWeight:800, color:'#0b0d0c' }}>*</span>
      </div>
      <div style={{ display:'flex', gap:8, flex:1, justifyContent:'center' }}>
        {services.map(svc => (
          <SvcBtn key={svc} svc={svc} active={svc === selected} onSelect={onSelect} cardBg={cardBg} />
        ))}
      </div>
      <button onClick={onToggle} style={{ width:40, height:40, borderRadius:'50%', border:'1px solid var(--border)', background:'var(--surface-2)', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text)', flexShrink:0 }}>
        {theme === 'dark' ? '☀' : '☾'}
      </button>
    </nav>
  );
}

// ── Top Bar ───────────────────────────────────────────────────────────────────
function TopBar({ allHealthy, clock, learnMode, onToggleLearn, isMobile, onToggleSidebar }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday:'short', day:'numeric', month:'short' });
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding: isMobile ? '10px 14px' : '12px 24px', background:'var(--card-bg, var(--bg))', borderBottom:'1px solid var(--border)', gap:10, flexWrap:'wrap' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {!isMobile && onToggleSidebar && (
          <button onClick={onToggleSidebar} title="Toggle sidebar"
            style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-2)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, flexShrink:0, transition:'all 0.2s' }}>
            <span style={{ width:14, height:1.5, background:'var(--muted)', borderRadius:1, display:'block' }} />
            <span style={{ width:14, height:1.5, background:'var(--muted)', borderRadius:1, display:'block' }} />
            <span style={{ width:10, height:1.5, background:'var(--muted)', borderRadius:1, display:'block', alignSelf:'flex-start', marginLeft:2 }} />
          </button>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:999, background: allHealthy ? 'rgba(34,197,94,0.10)' : 'rgba(250,204,21,0.10)', border:`1px solid ${allHealthy ? 'rgba(34,197,94,0.3)' : 'rgba(250,204,21,0.35)'}` }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background: allHealthy ? GREEN : AMBER, boxShadow:`0 0 6px ${allHealthy ? GREEN : AMBER}` }} />
          <span style={{ fontSize:11, fontWeight:600, color: allHealthy ? GREEN : AMBER }}>{allHealthy ? (isMobile ? 'Operational' : 'All systems operational') : (isMobile ? 'Degraded' : 'Degraded SLO attainment')}</span>
        </div>
        {!isMobile && <span style={{ fontSize:12, color:'var(--muted)' }}>Hi Operator, <span style={{ color:'var(--text)', fontWeight:600 }}>Welcome to SRE Ops</span></span>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button onClick={onToggleLearn} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', border: learnMode ? `1px solid ${LIME}` : '1px solid var(--border)', borderRadius:999, background: learnMode ? 'rgba(202,255,4,0.12)' : 'var(--surface-2)', color: learnMode ? LIME : 'var(--muted)', fontSize:11, fontWeight:600, cursor:'pointer', ...MN }}>
          ? {learnMode ? 'Learn ON' : 'Learn'}
        </button>
        {!isMobile && <div style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 14px', border:'1px solid var(--border)', borderRadius:999, background:'var(--surface-2)', ...MN }}>
          <span style={{ fontSize:11, color:'var(--muted)' }}>📅 {dateStr}</span>
          <span style={{ width:1, height:10, background:'var(--border)' }} />
          <span style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>⏰ {clock}</span>
        </div>}
        {isMobile && <span style={{ ...MN, fontSize:11, fontWeight:700, color:'var(--text)' }}>⏰ {clock}</span>}
      </div>
    </div>
  );
}

// ── Dashboard Header ──────────────────────────────────────────────────────────
function DashHeader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div>
          <div style={{ fontSize:12, fontWeight:500, color:'var(--muted)' }}>SRE Ops</div>
          <div style={{ fontSize:28, fontWeight:800, color:'var(--text)', letterSpacing:'-0.025em', lineHeight:1.1 }}>Mission Control</div>
        </div>
        <div style={{ ...lcirc(34) }}>
          <span style={{ fontSize:20, fontWeight:800, color:'#0b0d0c' }}>*</span>
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        {['🗓 28d window', '⚡ Live (5m)'].map((l, i) => (
          <div key={i} style={{ padding:'6px 12px', borderRadius:999, border:'1px solid var(--border)', background:'var(--surface-2)', fontSize:11, fontWeight:600, color:'var(--text-2)' }}>{l}</div>
        ))}
        <div style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:999, background:LIME, fontSize:11, fontWeight:700, color:'#0b0d0c', boxShadow:'0 3px 10px rgba(202,255,4,0.3)' }}>
          <span style={{ width:5, height:5, borderRadius:'50%', background:'#0b0d0c' }} />Active
        </div>
      </div>
    </div>
  );
}

// ── Hero KPI Card ─────────────────────────────────────────────────────────────
function HeroKpiCard({ kpis, allHealthy, sloCount }) {
  return (
    <div style={{ ...crd({ padding:'22px' }) }}>
      <div style={{ display:'flex', gap:6, marginBottom:18 }}>
        <button style={pillBtn(true)}>Composite SLO</button>
        <button style={pillBtn(false)}>Fleet</button>
      </div>
      <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
        <div style={{ fontSize:'clamp(40px,5vw,52px)', fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em', lineHeight:1 }}>
          {fmt(kpis.composite_slo, 2)}
        </div>
        <div style={{ paddingTop:8, display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ fontSize:18, fontWeight:700, color:'var(--muted)' }}>%</span>
          <span style={chip(allHealthy)}>{allHealthy ? '▲ on target' : '▼ degraded'}</span>
        </div>
      </div>
      <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.55, marginBottom:20, maxWidth:210 }}>
        Mean SLI attainment across {sloCount} services<br />over a rolling 28-day window
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[
          { label:'Error Budget', val: fmt(kpis.error_budget_remaining_pct, 1), unit:'%', ok:(kpis.error_budget_remaining_pct??100)>30, chipLabel:'remaining' },
          { label:'Req / sec', val: fmt(kpis.selected_request_rate, 1), unit:'/s', ok:true, chipLabel:'traffic', chipStyle:{ background:'rgba(59,130,246,0.12)', color:BLUE, border:'1px solid rgba(59,130,246,0.25)' } },
        ].map((m, i) => (
          <div key={i} style={{ background:'var(--surface-2)', borderRadius:14, padding:'12px 14px', border:'1px solid var(--border)' }}>
            <div style={LBL}>{m.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--text)', letterSpacing:'-0.02em', marginTop:4 }}>
              {m.val}<span style={{ fontSize:12, fontWeight:500, color:'var(--muted)', marginLeft:2 }}>{m.unit}</span>
            </div>
            <div style={{ marginTop:6 }}>
              <span style={{ ...chip(m.ok), ...(m.chipStyle || {}) }}>{m.chipLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Metric Pair ───────────────────────────────────────────────────────────────
function MetricPairCard({ kpis }) {
  const items = [
    { label:'p99 Latency', val: fmt(kpis.selected_latency_p99_ms, 0), unit:'ms', pct: Math.min(100,(kpis.selected_latency_p99_ms||0)/10), color:(kpis.selected_latency_p99_ms||0)>500?AMBER:LIME },
    { label:'Error Rate',  val: fmt(kpis.selected_error_rate_pct, 2), unit:'%',  pct: Math.min(100,kpis.selected_error_rate_pct*20),        color: kpis.selected_error_rate_pct>1?RED:LIME },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
      {items.map((m, i) => (
        <div key={i} style={{ ...crd({ padding:'18px' }) }}>
          <div style={LBL}>{m.label}</div>
          <div style={{ fontSize:26, fontWeight:800, color:'var(--text)', letterSpacing:'-0.025em', marginTop:8, lineHeight:1 }}>
            {m.val}<span style={{ fontSize:12, fontWeight:500, color:'var(--muted)', marginLeft:2 }}>{m.unit}</span>
          </div>
          <div style={{ marginTop:10, height:4, borderRadius:2, background:'var(--surface-2)' }}>
            <div style={{ height:'100%', width:`${m.pct}%`, borderRadius:2, background:m.color, boxShadow:`0 0 6px ${m.color}` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Signal Chart Card ─────────────────────────────────────────────────────────
function SignalChartCard({ golden, selectedService }) {
  const [tab, setTab] = React.useState('lat');
  const tabs = [
    { id:'lat',  label:'Latency',    vals: golden.series.latency_p99_ms,  val: golden.latency_p99_ms, unit:'ms', ok:(golden.latency_p99_ms||0)<500 },
    { id:'traf', label:'Traffic',    vals: golden.series.request_rate,    val: golden.request_rate,   unit:'/s', ok:true },
    { id:'err',  label:'Errors',     vals: golden.series.error_rate_pct,  val: golden.error_rate_pct, unit:'%',  ok:(golden.error_rate_pct||0)<1 },
    { id:'sat',  label:'Saturation', vals: golden.series.saturation_pct,  val: golden.saturation_pct, unit:'%',  ok:(golden.saturation_pct||0)<80 },
  ];
  const active = tabs.find(t => t.id === tab) || tabs[0];
  const digits = tab === 'lat' ? 0 : 2;
  return (
    <div style={{ ...crd({ padding:'22px' }) }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:'var(--text)', letterSpacing:'-0.01em' }}>Golden Signals</h2>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:LIME, animation:'pulse 2s infinite' }} />
          <span style={{ ...MN, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:LIME }}>LIVE</span>
        </div>
      </div>
      <p style={{ margin:'0 0 16px', fontSize:11, color:'var(--muted)' }}>{selectedService} · 5m windows</p>
      <div style={{ display:'flex', alignItems:'flex-end', gap:14, marginBottom:14 }}>
        <div>
          <div style={{ fontSize:'clamp(32px,4vw,42px)', fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em', lineHeight:1 }}>
            {fmt(active.val, digits)}
          </div>
          <div style={{ fontSize:11, color:'var(--muted)', marginTop:4, ...MN }}>{active.unit} · {active.label.toLowerCase()}</div>
        </div>
        <span style={{ ...chip(active.ok), marginBottom:4 }}>{active.ok ? '✓ nominal' : '▲ elevated'}</span>
      </div>
      <BarChart values={active.vals} height={80} />
      <div style={{ display:'flex', gap:4, flexWrap:'wrap', borderTop:'1px solid var(--border)', paddingTop:12, marginTop:14 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...pillBtn(t.id === tab), padding:'4px 10px', fontSize:10 }}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── SLO Table Card ────────────────────────────────────────────────────────────
function SloTableCard({ rows, selected }) {
  return (
    <div style={{ ...crd({ padding:'22px' }) }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
        <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:'var(--text)', letterSpacing:'-0.01em' }}>Service SLOs</h2>
        <span style={{ ...MN, fontSize:10, color:'var(--muted)' }}>28d rolling</span>
      </div>
      <p style={{ margin:'0 0 16px', fontSize:11, color:'var(--muted)' }}>SLI attainment vs target · error budget</p>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {rows.map((sv, i) => {
          const sc = statusC(sv.sli, sv.slo_target);
          const isSel = sv.name === selected;
          const budget = sv.error_budget_remaining ?? 0;
          const bc = budget < 20 ? RED : budget < 40 ? AMBER : GREEN;
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:14, background: isSel ? 'rgba(202,255,4,0.08)' : 'var(--surface-2)', borderLeft:`3px solid ${isSel ? LIME : 'transparent'}`, border:`1px solid ${isSel ? 'rgba(202,255,4,0.3)' : 'var(--border)'}`, borderLeft:`3px solid ${isSel ? LIME : 'transparent'}`, transition:'all 0.2s' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:sc, boxShadow:`0 0 6px ${sc}`, flexShrink:0 }} />
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text)', flex:'0 0 58px' }}>{sv.name}</span>
              <span style={{ ...MN, fontSize:12, fontWeight:700, color:sc, flex:'0 0 54px' }}>{fmt(sv.sli, 2)}%</span>
              <div style={{ flex:1 }}>
                <div style={{ height:4, borderRadius:2, background:'var(--surface-3)', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${budget}%`, borderRadius:2, background:bc }} />
                </div>
                <div style={{ ...MN, fontSize:9, color:'var(--muted)', marginTop:3 }}>{fmt(sv.error_budget_remaining, 1)}% budget left</div>
              </div>
              <svg viewBox="0 0 80 24" preserveAspectRatio="none" style={{ width:56, height:24, flexShrink:0 }}>
                <path d={spk(sv.sparkline, 80, 24, 2)} fill="none" stroke={sc} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Golden Signals Mini ───────────────────────────────────────────────────────
function GoldenSignalsCard({ golden, selectedService }) {
  const signals = [
    { id:'lat',  label:'Latency p99', value:fmt(golden.latency_p99_ms, 0),  unit:'ms',    color:(golden.latency_p99_ms||0)>500?AMBER:GREEN, vals:golden.series.latency_p99_ms },
    { id:'traf', label:'Traffic',     value:fmt(golden.request_rate, 2),    unit:'req/s',  color:BLUE,                                       vals:golden.series.request_rate },
    { id:'err',  label:'Errors',      value:fmt(golden.error_rate_pct, 2),  unit:'%',      color:golden.error_rate_pct>1?RED:GREEN,           vals:golden.series.error_rate_pct },
    { id:'sat',  label:'Saturation',  value:fmt(golden.saturation_pct, 0),  unit:'%',      color:(golden.saturation_pct||0)>80?AMBER:GREEN,   vals:golden.series.saturation_pct },
  ];
  return (
    <div style={{ ...crd({ padding:'18px' }) }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <h2 style={{ margin:0, fontSize:14, fontWeight:700, color:'var(--text)', letterSpacing:'-0.01em' }}>Live Signals</h2>
        <span style={{ ...MN, fontSize:10, color:'var(--muted)' }}>{selectedService}</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {signals.map(g => {
          const aPath = ar(g.vals, 120, 36, 3);
          const lPath = spk(g.vals, 120, 36, 3);
          return (
            <div key={g.id} style={{ background:'var(--surface-2)', borderRadius:14, padding:'12px 14px', border:'1px solid var(--border)' }}>
              <div style={LBL}>{g.label}</div>
              <div style={{ fontSize:20, fontWeight:800, color:'var(--text)', letterSpacing:'-0.02em', marginTop:6, lineHeight:1 }}>
                {g.value}<span style={{ fontSize:11, color:'var(--muted)', fontWeight:500, marginLeft:2 }}>{g.unit}</span>
              </div>
              <svg viewBox="0 0 120 36" preserveAspectRatio="none" style={{ width:'100%', height:28, marginTop:8, overflow:'visible' }}>
                <defs>
                  <linearGradient id={`sg2-${g.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={g.color} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={g.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <path d={aPath} fill={`url(#sg2-${g.id})`} />
                <path d={lPath} fill="none" stroke={g.color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Capacity Card ─────────────────────────────────────────────────────────────
function CapacityCard({ capacity, selectedService }) {
  const items = [
    { label:'VPS CPU',                used: capacity.vps_cpu_pct },
    { label:'VPS Memory',             used: capacity.vps_memory_pct },
    { label:'VPS Disk',               used: capacity.vps_disk_pct },
    { label:`${selectedService} CPU`, used: capacity.service_container_cpu_pct },
    { label:`${selectedService} Mem`, used: capacity.service_container_memory_pct },
  ].map(c => ({ ...c, color:(c.used||0)>80?AMBER:GREEN }));
  return (
    <div style={{ ...crd({ padding:'18px' }) }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <h2 style={{ margin:0, fontSize:14, fontWeight:700, color:'var(--text)', letterSpacing:'-0.01em' }}>Capacity</h2>
        <span style={{ ...MN, fontSize:9, color:'var(--muted)' }}>dockerstats</span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {items.map((c, i) => (
          <div key={i}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={LBL}>{c.label}</span>
              <span style={{ ...MN, fontSize:11, fontWeight:700, color:c.color }}>{fmt(c.used, 1)}%</span>
            </div>
            <div style={{ height:5, borderRadius:3, background:'var(--surface-3)', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${c.used||0}%`, borderRadius:3, background:c.color, boxShadow:`0 0 6px ${c.color}` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function SreDashboard() {
  const [selected, setSelected] = React.useState('devex');
  const [theme, setTheme] = React.useState(() => localStorage.getItem('sre-theme') || 'light');
  const [learnMode, setLearnMode] = React.useState(false);
  const [clock, setClock] = React.useState(window.DashUtils.fmtClock());

  React.useEffect(() => {
    let s = document.getElementById('__sre-card-vars');
    if (!s) { s = document.createElement('style'); s.id = '__sre-card-vars'; document.head.appendChild(s); }
    s.textContent = ':root{--card-bg:#ffffff;}[data-theme="dark"]{--card-bg:#191c1e;}';
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sre-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    const id = setInterval(() => setClock(window.DashUtils.fmtClock()), 1000);
    return () => clearInterval(id);
  }, []);

  const isMobile = useIsMobile(768);
  const isTablet = useIsMobile(1100);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const data = window.MOCK_DATA[selected];
  const { kpis, slo_table, golden_signals, capacity } = data;
  const allHealthy = slo_table.every(r => r.sli !== null && r.sli >= r.slo_target);
  const cardBg = theme === 'dark' ? '#191c1e' : '#ffffff';

  const cols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1.35fr 1fr';

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'var(--surface)', backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'36px 36px' }}>
      <TopBar allHealthy={allHealthy} clock={clock} learnMode={learnMode} onToggleLearn={() => setLearnMode(v => !v)} isMobile={isMobile} onToggleSidebar={() => setSidebarCollapsed(v => !v)} />
      <div style={{ display:'flex', flex:1 }}>
        {!isMobile && (
          <LeftSidebar services={window.SERVICES} selected={selected} onSelect={setSelected}
            theme={theme} onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            cardBg={cardBg} collapsed={sidebarCollapsed} />
        )}
        <main style={{ flex:1, padding: isMobile ? '16px 12px 80px' : '24px', overflowY:'auto', position:'relative' }}>
          <DashHeader />
          <div style={{ display:'grid', gridTemplateColumns: cols, gap:14, alignItems:'start' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <HeroKpiCard kpis={kpis} allHealthy={allHealthy} sloCount={slo_table.length} />
              <MetricPairCard kpis={kpis} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <SignalChartCard golden={golden_signals} selectedService={kpis.selected_service} />
              <SloTableCard rows={slo_table} selected={selected} />
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <GoldenSignalsCard golden={golden_signals} selectedService={kpis.selected_service} />
              <CapacityCard capacity={capacity} selectedService={kpis.selected_service} />
            </div>
          </div>
        </main>
      </div>
      {isMobile && (
        <BottomNav services={window.SERVICES} selected={selected} onSelect={setSelected}
          theme={theme} onToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} cardBg={cardBg} />
      )}
    </div>
  );
}

Object.assign(window, { SreDashboard });
