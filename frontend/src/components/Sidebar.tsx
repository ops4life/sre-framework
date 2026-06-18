import { config } from '../lib/config';
import type { Theme } from '../hooks/useTheme';
import { Sun } from '@/components/animate-ui/icons/sun';
import { Moon } from '@/components/animate-ui/icons/moon';
import { SlidersHorizontal } from '@/components/animate-ui/icons/sliders-horizontal';
import { Lightbulb } from '@/components/animate-ui/icons/lightbulb';

export type Page = 'dashboard' | 'customize' | 'concepts';

interface Props {
  services: { name: string }[];
  selected: string;
  onSelect: (name: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  page: Page;
  onSetPage: (p: Page) => void;
  accent: string;
}

function badge(name: string): string {
  const parts = name.split('-');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <polyline points="1,14 5,8 9,12 13,5 17,9 21,4" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


export default function Sidebar({ services, selected, onSelect, theme, onToggleTheme, collapsed, onToggleCollapse, page, onSetPage }: Props) {
  const handleCustomize = () => {
    onSetPage(page === 'customize' ? 'dashboard' : 'customize');
  };

  return (
    <>
    <nav className="sre-sidebar">
      <div className="sre-sidebar-brand">
        <div className="sre-sidebar-logo">
          {config.favicon !== '/favicon.png'
            ? <img src={config.favicon} width="22" height="22" alt="" aria-hidden />
            : <LogoMark />}
        </div>
        {!collapsed && <span className="sre-sidebar-brand-name">SRE Ops</span>}
        <button type="button" className="sre-sidebar-theme" title="Toggle theme" onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun animateOnHover size={14} aria-hidden /> : <Moon animateOnHover animation="balancing" size={14} aria-hidden />}
        </button>
        <button type="button" className="sre-sidebar-collapse" title={collapsed ? 'Expand' : 'Collapse'} onClick={onToggleCollapse} aria-label="Toggle sidebar">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            {collapsed ? <path d="M3 2l3 3-3 3"/> : <path d="M7 2L4 5l3 3"/>}
          </svg>
        </button>
      </div>

      <div className="sre-sidebar-nav">
        {!collapsed && <div className="sre-sidebar-section">Services</div>}
        {services.map(svc => (
          <button
            key={svc.name}
            type="button"
            className={`sre-sidebar-item${svc.name === selected && page === 'dashboard' ? ' active' : ''}`}
            title={collapsed ? svc.name : ''}
            onClick={() => { onSetPage('dashboard'); onSelect(svc.name); }}
          >
            <span className="sre-sidebar-item-badge">{badge(svc.name)}</span>
            {!collapsed && <span className="sre-sidebar-item-label">{svc.name}</span>}
          </button>
        ))}

        {!collapsed && <div className="sre-sidebar-section" style={{ marginTop: 8 }}>Settings</div>}
        <button
          type="button"
          className={`sre-sidebar-item${page === 'customize' ? ' active' : ''}`}
          title={collapsed ? 'Customize' : ''}
          onClick={handleCustomize}
        >
          <span className="sre-sidebar-item-badge">
            <SlidersHorizontal animateOnHover size={14} aria-hidden />
          </span>
          {!collapsed && <span className="sre-sidebar-item-label">Customize</span>}
        </button>
        <button
          type="button"
          className={`sre-sidebar-item${page === 'concepts' ? ' active' : ''}`}
          title={collapsed ? 'Concepts' : ''}
          onClick={() => onSetPage(page === 'concepts' ? 'dashboard' : 'concepts')}
        >
          <span className="sre-sidebar-item-badge">
            <Lightbulb animateOnHover size={14} aria-hidden />
          </span>
          {!collapsed && <span className="sre-sidebar-item-label">Concepts</span>}
        </button>
      </div>
    </nav>
    </>
  );
}
