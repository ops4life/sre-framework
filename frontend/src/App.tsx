import { useEffect, useState } from 'react';
import type { Overview, DoraMetrics } from './types';
import { fmtClock } from './lib/format';
import { config } from './lib/config';
import { useTheme } from './hooks/useTheme';
import { useAccent } from './hooks/useAccent';
import Sidebar from './components/Sidebar';
import type { Page } from './components/Sidebar';
import MobileShell from './components/MobileShell';
import TopBar from './components/TopBar';
import CustomizePage from './pages/CustomizePage';
import ConceptsPage from './pages/ConceptsPage';
import TourModal from './components/TourModal';
import KpiStrip from './components/KpiStrip';
import SloTable from './components/SloTable';
import GoldenSignals from './components/GoldenSignals';
import ErrorBudgetBurn from './components/ErrorBudgetBurn';
import CapacityGrid from './components/CapacityGrid';
import DoraPanel from './components/DoraPanel';
import { TOUR_STEPS } from './tours';
import { BubbleBackground } from './components/animate-ui/backgrounds/bubble';

const POLL_INTERVAL_MS = 20_000;
const DORA_POLL_INTERVAL_MS = 300_000;

const monoMuted: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' };

export default function App() {
  const [data, setData] = useState<Overview | null>(null);
  const [doraData, setDoraData] = useState<DoraMetrics | null>(null);
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
  const [accent, setAccent] = useAccent();
  const [page, setPage] = useState<Page>(() => {
    if (window.location.pathname.endsWith('/CONCEPTS.md')) return 'concepts';
    return (localStorage.getItem('sre.page') as Page) ?? 'dashboard';
  });
  const setPagePersisted = (p: Page) => {
    localStorage.setItem('sre.page', p);
    setPage(p);
  };
  const [tourOpen, setTourOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    const loadDora = async () => {
      try {
        const res = await fetch('/api/sre/dora');
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setDoraData(json);
      } catch {
        // DORA panel is a secondary signal — silently retry on the next poll
      }
    };
    loadDora();
    const id = setInterval(loadDora, DORA_POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const services = data?.slo_table.map(r => ({ name: r.name })) ?? (selectedService ? [{ name: selectedService }] : []);

  const accentRgb = (() => {
    const hex = /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : '#caff04';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  })();

  const bubbleBackground = theme === 'dark'
    ? `linear-gradient(135deg, rgba(${accentRgb},0.22) 0%, rgba(0,0,0,0) 100%)`
    : `linear-gradient(135deg, rgba(${accentRgb},0.12) 0%, rgba(0,0,0,0) 100%)`;

  const bubbleColors = {
    first: accentRgb,
    second: accentRgb,
    third: accentRgb,
    fourth: accentRgb,
    fifth: accentRgb,
    sixth: accentRgb,
  };

  if (!data) {
    const sidebar = <Sidebar services={services} selected={selectedService} onSelect={selectService} theme={theme} onToggleTheme={toggleTheme} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(c => !c)} page={page} onSetPage={setPagePersisted} accent={accent} />;
    const mobile = <MobileShell services={services} selected={selectedService} onSelect={selectService} theme={theme} onToggleTheme={toggleTheme} page={page} onSetPage={setPagePersisted} />;
    const bg = <BubbleBackground colors={bubbleColors} style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', background: bubbleBackground }} />;

    if (page === 'concepts') {
      return (
        <div className={`sre-layout${sidebarCollapsed ? ' collapsed' : ''}`}>
          {bg}{sidebar}{mobile}
          <main className="page"><ConceptsPage /></main>
        </div>
      );
    }
    if (page === 'customize') {
      return (
        <div className={`sre-layout${sidebarCollapsed ? ' collapsed' : ''}`}>
          {bg}{sidebar}{mobile}
          <main className="page"><CustomizePage accent={accent} onSetAccent={setAccent} theme={theme} onToggleTheme={toggleTheme} /></main>
        </div>
      );
    }

    return (
      <div className={`sre-layout${sidebarCollapsed ? ' collapsed' : ''}`}>
        {bg}{sidebar}{mobile}
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
      <BubbleBackground colors={bubbleColors} style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', background: bubbleBackground }} />
      <Sidebar services={services} selected={selectedService} onSelect={selectService} theme={theme} onToggleTheme={toggleTheme} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(c => !c)} page={page} onSetPage={setPagePersisted} accent={accent} />
      <MobileShell services={services} selected={selectedService} onSelect={selectService} theme={theme} onToggleTheme={toggleTheme} page={page} onSetPage={setPagePersisted} />
      <main className="page">
        {page === 'customize' ? (
          <CustomizePage accent={accent} onSetAccent={setAccent} theme={theme} onToggleTheme={toggleTheme} />
        ) : page === 'concepts' ? (
          <ConceptsPage />
        ) : (
          <>
            <TopBar
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
                <div className="sre-dashboard-main">
                  <KpiStrip kpis={kpis} sloCount={slo_table.length} allHealthy={allHealthy} />
                  <ErrorBudgetBurn burn={error_budget_burn} selectedService={kpis.selected_service} />
                  <SloTable rows={slo_table} selected={selectedService} />
                </div>
                <div className="sre-dashboard-aside">
                  <GoldenSignals golden={golden_signals} selectedService={kpis.selected_service} />
                  <CapacityGrid capacity={capacity} selectedService={kpis.selected_service} />
                  {doraData && <DoraPanel dora={doraData} />}
                </div>
              </div>
            </div>
            {tourOpen && <TourModal steps={TOUR_STEPS} onClose={() => setTourOpen(false)} />}
          </>
        )}
      </main>
    </div>
  );
}
