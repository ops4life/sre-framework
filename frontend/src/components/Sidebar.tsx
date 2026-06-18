import { config } from '../lib/config';
import type { Theme } from '../hooks/useTheme';
import { Sun } from '@/components/animate-ui/icons/sun';
import { Moon } from '@/components/animate-ui/icons/moon';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';

export type Page = 'dashboard' | 'customize';

interface Props {
  services: { name: string }[];
  selected: string;
  onSelect: (name: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
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

function PaletteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5" cy="5.5" r="1" fill="currentColor" />
      <circle cx="9" cy="5.5" r="1" fill="currentColor" />
      <circle cx="7" cy="9" r="1" fill="currentColor" />
    </svg>
  );
}

export default function Sidebar({ services, selected, onSelect, theme, onToggleTheme, collapsed, onToggleCollapse, mobileOpen, onMobileClose, page, onSetPage, accent }: Props) {
  const effectiveCollapsed = collapsed && !mobileOpen;

  const handleCustomize = () => {
    onSetPage(page === 'customize' ? 'dashboard' : 'customize');
    if (mobileOpen) onMobileClose();
  };

  return (
    <>
      {mobileOpen && <div className="sre-sidebar-backdrop" onClick={onMobileClose} aria-hidden />}
    <nav className={`sre-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sre-sidebar-brand">
        <div className="sre-sidebar-logo">
          {config.favicon !== '/favicon.png'
            ? <img src={config.favicon} width="22" height="22" alt="" aria-hidden />
            : <LogoMark />}
        </div>
        {!effectiveCollapsed && <span className="sre-sidebar-brand-name">SRE Ops</span>}
        <button type="button" className="sre-sidebar-theme" title="Toggle theme" onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun animateOnHover size={14} aria-hidden /> : <Moon animateOnHover animation="balancing" size={14} aria-hidden />}
        </button>
        <button type="button" className="sre-sidebar-collapse" title={collapsed ? 'Expand' : 'Collapse'} onClick={onToggleCollapse}>
          <ArrowRight animateOnHover animation="pointing" size={10} aria-hidden style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
        </button>
      </div>

      <div className="sre-sidebar-nav">
        {!effectiveCollapsed && <div className="sre-sidebar-section">Services</div>}
        {services.map(svc => (
          <button
            key={svc.name}
            type="button"
            className={`sre-sidebar-item${svc.name === selected && page === 'dashboard' ? ' active' : ''}`}
            title={effectiveCollapsed ? svc.name : ''}
            onClick={() => { onSetPage('dashboard'); onSelect(svc.name); if (mobileOpen) onMobileClose(); }}
          >
            <span className="sre-sidebar-item-badge">{badge(svc.name)}</span>
            {!effectiveCollapsed && <span className="sre-sidebar-item-label">{svc.name}</span>}
          </button>
        ))}

        {!effectiveCollapsed && <div className="sre-sidebar-section" style={{ marginTop: 8 }}>Settings</div>}
        <button
          type="button"
          className={`sre-sidebar-item${page === 'customize' ? ' active' : ''}`}
          title={effectiveCollapsed ? 'Customize' : ''}
          onClick={handleCustomize}
          style={page !== 'customize' && accent !== '#caff04' ? { '--item-accent-dot': accent } as React.CSSProperties : undefined}
        >
          <span
            className="sre-sidebar-item-badge"
            style={page !== 'customize' ? { background: accent, color: '#0b0d0c' } : undefined}
          >
            <PaletteIcon />
          </span>
          {!effectiveCollapsed && <span className="sre-sidebar-item-label">Customize</span>}
        </button>
      </div>
    </nav>
    </>
  );
}
