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
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Sidebar({ services, selected, onSelect, theme, onToggleTheme }: Props) {
  return (
    <nav className="sre-sidebar">
      <div className="sre-sidebar-logo">*</div>
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
        {theme === 'dark' ? '☀' : '☾'}
      </button>
    </nav>
  );
}
