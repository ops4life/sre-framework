import { useEffect, useState } from 'react';
import type { Overview } from './types';
import { fmtClock } from './lib/format';
import { useTheme } from './hooks/useTheme';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import KpiStrip from './components/KpiStrip';
import SloTable from './components/SloTable';
import GoldenSignals from './components/GoldenSignals';
import ErrorBudgetBurn from './components/ErrorBudgetBurn';
import CapacityGrid from './components/CapacityGrid';

const POLL_INTERVAL_MS = 20_000;

const monoMuted: React.CSSProperties = { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' };

export default function App() {
  const [data, setData] = useState<Overview | null>(null);
  const [clock, setClock] = useState(fmtClock());
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState('devex');
  const [theme, toggleTheme] = useTheme();
  const [learnMode, setLearnMode] = useState(false);

  useEffect(() => {
    const clockId = setInterval(() => setClock(fmtClock()), 1000);
    return () => clearInterval(clockId);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/sre/overview?service=${selectedService}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) { setData(json); setError(null); }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'failed to load');
      }
    };
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, [selectedService]);

  const services = data?.slo_table.map(r => ({ name: r.name })) ?? [{ name: selectedService }];

  if (!data) {
    return (
      <div className="sre-layout">
        <Sidebar services={services} selected={selectedService} onSelect={setSelectedService} theme={theme} onToggleTheme={toggleTheme} />
        <main className="page">
          <div className="page-head">
            <h1 className="page-title">SRE Ops<br /><span className="accent">Mission Control.</span></h1>
          </div>
          <p style={monoMuted}>{error ? `Error loading metrics: ${error}` : 'Loading…'}</p>
        </main>
      </div>
    );
  }

  const { kpis, slo_table, golden_signals, error_budget_burn, capacity } = data;
  const allHealthy = slo_table.length > 0 && slo_table.every(r => r.sli !== null && r.sli >= r.slo_target);

  return (
    <div className="sre-layout">
      <Sidebar services={services} selected={selectedService} onSelect={setSelectedService} theme={theme} onToggleTheme={toggleTheme} />
      <main className="page">
        <TopBar
          allHealthy={allHealthy}
          error={error}
          clock={clock}
          selectedService={kpis.selected_service}
          learnMode={learnMode}
          onToggleLearn={() => setLearnMode(v => !v)}
        />

        <div className="slide-up" style={{ maxWidth: 1320, margin: '0 auto', marginTop: 20 }}>
          <div className="sre-dashboard-layout">
            {/* Left Column (Wide) - main diagnostics */}
            <div className="sre-dashboard-main">
              <KpiStrip kpis={kpis} sloCount={slo_table.length} allHealthy={allHealthy} learnMode={learnMode} />
              <ErrorBudgetBurn burn={error_budget_burn} selectedService={kpis.selected_service} learnMode={learnMode} />
              <SloTable rows={slo_table} selected={selectedService} learnMode={learnMode} />
            </div>

            {/* Right Column (Aside) - live telemetry/capacity */}
            <div className="sre-dashboard-aside">
              <GoldenSignals golden={golden_signals} selectedService={kpis.selected_service} learnMode={learnMode} />
              <CapacityGrid capacity={capacity} selectedService={kpis.selected_service} learnMode={learnMode} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
