import type { Theme } from '../hooks/useTheme';

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

function IconSun() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="8" cy="8" r="3" />
      <line x1="8" y1="1.5" x2="8" y2="3" />
      <line x1="8" y1="13" x2="8" y2="14.5" />
      <line x1="1.5" y1="8" x2="3" y2="8" />
      <line x1="13" y1="8" x2="14.5" y2="8" />
      <line x1="3.4" y1="3.4" x2="4.5" y2="4.5" />
      <line x1="11.5" y1="11.5" x2="12.6" y2="12.6" />
      <line x1="12.6" y1="3.4" x2="11.5" y2="4.5" />
      <line x1="4.5" y1="11.5" x2="3.4" y2="12.6" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M13 9.5A6 6 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z" />
    </svg>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <polyline points="1,14 5,8 9,12 13,5 17,9 21,4" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevron({ collapsed }: { collapsed: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      {collapsed ? <path d="M3 2l3 3-3 3" /> : <path d="M7 2L4 5l3 3" />}
    </svg>
  );
}

export default function Sidebar({ services, selected, onSelect, theme, onToggleTheme, collapsed, onToggleCollapse, mobileOpen, onMobileClose }: Props) {
  return (
    <>
      {mobileOpen && <div className="sre-sidebar-backdrop" onClick={onMobileClose} aria-hidden />}
    <nav className={`sre-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sre-sidebar-brand">
        <div className="sre-sidebar-logo">
          <LogoMark />
        </div>
        {!collapsed && <span className="sre-sidebar-brand-name">SRE Ops</span>}
        <button type="button" className="sre-sidebar-theme" title="Toggle theme" onClick={onToggleTheme}>
          {theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
        <button type="button" className="sre-sidebar-collapse" title={collapsed ? 'Expand' : 'Collapse'} onClick={onToggleCollapse}>
          <IconChevron collapsed={collapsed} />
        </button>
      </div>

      <div className="sre-sidebar-nav">
        {!collapsed && <div className="sre-sidebar-section">Services</div>}
        {services.map(svc => (
          <button
            key={svc.name}
            type="button"
            className={`sre-sidebar-item${svc.name === selected ? ' active' : ''}`}
            title={collapsed ? svc.name : ''}
            onClick={() => onSelect(svc.name)}
          >
            <span className="sre-sidebar-item-badge">{badge(svc.name)}</span>
            {!collapsed && <span className="sre-sidebar-item-label">{svc.name}</span>}
          </button>
        ))}
      </div>
    </nav>
    </>
  );
}
