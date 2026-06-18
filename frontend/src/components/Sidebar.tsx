import { config } from '../lib/config';
import type { Theme } from '../hooks/useTheme';
import { Sun } from '@/components/animate-ui/icons/sun';
import { Moon } from '@/components/animate-ui/icons/moon';
import { ArrowRight } from '@/components/animate-ui/icons/arrow-right';

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


export default function Sidebar({ services, selected, onSelect, theme, onToggleTheme, collapsed, onToggleCollapse, mobileOpen, onMobileClose }: Props) {
  const effectiveCollapsed = collapsed && !mobileOpen;
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
            className={`sre-sidebar-item${svc.name === selected ? ' active' : ''}`}
            title={effectiveCollapsed ? svc.name : ''}
            onClick={() => onSelect(svc.name)}
          >
            <span className="sre-sidebar-item-badge">{badge(svc.name)}</span>
            {!effectiveCollapsed && <span className="sre-sidebar-item-label">{svc.name}</span>}
          </button>
        ))}
      </div>
    </nav>
    </>
  );
}
