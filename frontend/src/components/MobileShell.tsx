import { useState } from 'react';
import { config } from '../lib/config';
import type { Theme } from '../hooks/useTheme';
import type { Page } from './Sidebar';
import { Sun } from '@/components/animate-ui/icons/sun';
import { Moon } from '@/components/animate-ui/icons/moon';

function LogoMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 22 22" fill="none" aria-hidden>
      <polyline points="1,14 5,8 9,12 13,5 17,9 21,4" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function badge(name: string): string {
  const parts = name.split('-');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface Props {
  services: { name: string }[];
  selected: string;
  onSelect: (name: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
  page: Page;
  onSetPage: (p: Page) => void;
}

export default function MobileShell({ services, selected, onSelect, theme, onToggleTheme, page, onSetPage }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const goTo = (id: string) => { onSelect(id); setDrawerOpen(false); };

  const title = page === 'customize' ? 'Customize' : (selected || 'SRE Ops');

  return (
    <>
      {/* Fixed top bar */}
      <div className="m-topbar">
        <button className="m-icon-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M1 1h16M1 7h16M1 13h16"/>
          </svg>
        </button>

        <div className="m-topbar-title">
          <div className="m-brand-mark">
            {config.favicon !== '/favicon.png'
              ? <img src={config.favicon} width="16" height="16" alt="" aria-hidden />
              : <LogoMark />}
          </div>
          <span className="m-title-text">{title}</span>
        </div>

        <button className="m-icon-btn" onClick={onToggleTheme} title="Toggle theme" aria-label="Toggle theme">
          {theme === 'dark' ? <Sun animateOnHover size={15} aria-hidden /> : <Moon animateOnHover animation="balancing" size={15} aria-hidden />}
        </button>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <div className="m-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden />
          <div className="m-drawer">
            <div className="m-drawer-head">
              <div className="m-brand-row">
                <div className="m-brand-mark" style={{ width: 36, height: 36, borderRadius: 10 }}>
                  {config.favicon !== '/favicon.png'
                    ? <img src={config.favicon} width="20" height="20" alt="" aria-hidden />
                    : <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden>
                        <polyline points="1,14 5,8 9,12 13,5 17,9 21,4" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>}
                </div>
                <div className="m-brand-stack">
                  <span className="m-brand-name">SRE Ops</span>
                </div>
              </div>
              <button className="m-icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="M1 1l12 12M13 1L1 13"/>
                </svg>
              </button>
            </div>

            <div className="m-drawer-nav">
              <div className="m-nav-group">
                <div className="m-nav-section">Services</div>
                {services.map(svc => (
                  <button
                    key={svc.name}
                    className={`m-nav-item${svc.name === selected && page === 'dashboard' ? ' active' : ''}`}
                    onClick={() => { onSetPage('dashboard'); goTo(svc.name); }}
                  >
                    <span className="m-nav-icon m-nav-badge">{badge(svc.name)}</span>
                    <span className="m-nav-label">{svc.name}</span>
                  </button>
                ))}
              </div>

              <div className="m-nav-group">
                <div className="m-nav-section">Settings</div>
                <button
                  className={`m-nav-item${page === 'customize' ? ' active' : ''}`}
                  onClick={() => { onSetPage(page === 'customize' ? 'dashboard' : 'customize'); setDrawerOpen(false); }}
                >
                  <span className="m-nav-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
                    </svg>
                  </span>
                  <span className="m-nav-label">Customize</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
