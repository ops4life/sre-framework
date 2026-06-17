import { useEffect, useState } from 'react';
import type { Overview } from './types';
import { fmtClock } from './lib/format';
import { config } from './lib/config';
import { useTheme } from './hooks/useTheme';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import TourModal from './components/TourModal';
import KpiStrip from './components/KpiStrip';
import SloTable from './components/SloTable';
import GoldenSignals from './components/GoldenSignals';
import ErrorBudgetBurn from './components/ErrorBudgetBurn';
import CapacityGrid from './components/CapacityGrid';
import { TOUR_STEPS } from './tours';

const POLL_INTERVAL_MS = 20_000;

const monoMuted: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' };

export default function App() {
  const [data, setData] = useState<Overview | null>(null);
  const [clock, setClock] = useState(fmtClock(config.timezone));
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState(
    () => localStorage.getItem('sre.selectedService') ?? ''
  );
  const selectService = (name: string) => {
    localStorage.setItem('sre.selectedService', name);
    setSelectedService(name);
  };
  const [theme, toggleTheme] = useTheme();
  const [tourOpen, setTourOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const clockId = setInterval(() => setClock(fmtClock(config.timezone)), 1000);
    return () => clearInterval(clockId);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const url = selectedService ? `/api/sre/overview?service=${selectedService}` : '/api/sre/overview';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
          if (!selectedService && json.kpis?.selected_service) {
            selectService(json.kpis.selected_service);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'failed to load');
      }
    };
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [selectedService]);

  const services = data?.slo_table.map(r => ({ name: r.name })) ?? (selectedService ? [{ name: selectedService }] : []);


  if (!data) {
    return (
      <div className={`sre-layout${sidebarCollapsed ? ' collapsed' : ''}`}>
        <Sidebar services={services} selected={selectedService} onSelect={name => { selectService(name); setMobileSidebarOpen(false); }} theme={theme} onToggleTheme={toggleTheme} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(c => !c)} mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
        <main className="page">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
            {error ? (
              <>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--danger)" strokeWidth="1.75" strokeLinecap="round">
                    <circle cx="9" cy="9" r="7.5" />
                    <line x1="9" y1="5.5" x2="9" y2="9.5" />
                    <line x1="9" y1="12" x2="9" y2="12.5" />
                  </svg>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Failed to connect</div>
                  <div style={{ ...monoMuted, fontSize: 12 }}>{error}</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite' }} />
                <span style={{ ...monoMuted, fontSize: 12 }}>Connecting to Prometheus…</span>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  const { kpis, slo_table, golden_signals, error_budget_burn, capacity } = data;
  const allHealthy = slo_table.length > 0 && slo_table.every(r => r.sli !== null && r.sli >= r.slo_target);

  return (
    <div className={`sre-layout${sidebarCollapsed ? ' collapsed' : ''}`}>
      <Sidebar services={services} selected={selectedService} onSelect={name => { selectService(name); setMobileSidebarOpen(false); }} theme={theme} onToggleTheme={toggleTheme} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(c => !c)} mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <main className="page">
        <TopBar
          onOpenMobileNav={() => setMobileSidebarOpen(true)}
          allHealthy={allHealthy}
          error={error}
          clock={clock}
          selectedService={kpis.selected_service}
          tourOpen={tourOpen}
          onStartTour={() => setTourOpen(true)}
          metricWindow={config.window}
        />

        <div className="slide-up" style={{ marginTop: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="sre-dashboard-layout">
            {/* Left Column (Wide) - main diagnostics */}
            <div className="sre-dashboard-main">
              <KpiStrip kpis={kpis} sloCount={slo_table.length} allHealthy={allHealthy} />
              <ErrorBudgetBurn burn={error_budget_burn} selectedService={kpis.selected_service} />
              <SloTable rows={slo_table} selected={selectedService} />
            </div>

            {/* Right Column (Aside) - live telemetry/capacity */}
            <div className="sre-dashboard-aside">
              <GoldenSignals golden={golden_signals} selectedService={kpis.selected_service} />
              <CapacityGrid capacity={capacity} selectedService={kpis.selected_service} />
            </div>
          </div>
        </div>
        {tourOpen && <TourModal steps={TOUR_STEPS} onClose={() => setTourOpen(false)} />}
      </main>
    </div>
  );
}
