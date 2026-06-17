import type { Theme } from '../hooks/useTheme';

interface Props {
  services: { name: string }[];
  selected: string;
  onSelect: (name: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

function badge(name: string): string {
  const parts = name.split('-');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M13 9.5A6 6 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z" />
    </svg>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <polyline points="1,14 5,8 9,12 13,5 17,9 21,4" stroke="#0b0d0c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Sidebar({ services, selected, onSelect, theme, onToggleTheme }: Props) {
  return (
    <nav className="sre-sidebar">
      <div className="sre-sidebar-logo" title="SRE Framework">
        <LogoMark />
      </div>
      <div className="sre-sidebar-icons">
        {services.map(svc => (
          <button
            key={svc.name}
            type="button"
            className={`sre-sidebar-icon ${svc.name === selected ? 'active' : ''}`}
            title={svc.name}
            onClick={() => onSelect(svc.name)}
          >
            {badge(svc.name)}
          </button>
        ))}
      </div>
      <button type="button" className="sre-sidebar-theme" title="Toggle theme" onClick={onToggleTheme}>
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>
    </nav>
  );
}
