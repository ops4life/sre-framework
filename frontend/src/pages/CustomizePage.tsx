import type { Theme } from '../hooks/useTheme';

const SWATCHES = [
  '#caff04', '#00d4ff', '#a855f7', '#f97316',
  '#ec4899', '#22c55e', '#f43f5e', '#06b6d4',
  '#fbbf24', '#3b82f6',
];

interface Props {
  accent: string;
  onSetAccent: (hex: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function CustomizePage({ accent, onSetAccent, theme, onToggleTheme }: Props) {
  const validAccent = /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : '#caff04';
  const isCustom = !SWATCHES.includes(validAccent.toLowerCase()) && !SWATCHES.includes(validAccent);

  return (
    <div className="cz-page">
      <div className="slide-up" style={{ maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="cz-page-head">
          <div className="cz-page-title">Customize</div>
          <div className="cz-page-sub">// theme · accent color</div>
        </div>

        <div className="cz-card">
          <div className="cz-card-head">
            <span className="cz-pre">▍</span> Appearance
          </div>
          <div className="cz-list">
            <div className="cz-row">
              <span className="cz-row-label">Theme</span>
              <span style={{ flex: 1 }} />
              <div className="cz-seg">
                <button className={`cz-seg-opt${theme === 'dark' ? ' active' : ''}`} onClick={() => theme === 'light' && onToggleTheme()}>Dark</button>
                <button className={`cz-seg-opt${theme === 'light' ? ' active' : ''}`} onClick={() => theme === 'dark' && onToggleTheme()}>Light</button>
              </div>
            </div>
            <div className="cz-row" style={{ flexWrap: 'wrap', gap: 12 }}>
              <span className="cz-row-label">Accent</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {SWATCHES.map(c => (
                  <button
                    key={c}
                    className={`cz-swatch${validAccent.toLowerCase() === c.toLowerCase() ? ' on' : ''}`}
                    style={{ background: c }}
                    onClick={() => onSetAccent(c)}
                    aria-label={c}
                  />
                ))}
                <label
                  className={`cz-swatch cz-swatch-custom${isCustom ? ' on' : ''}`}
                  style={isCustom ? { background: validAccent } : {}}
                  title="Custom color"
                  aria-label="Pick custom accent color"
                >
                  <input
                    type="color"
                    value={validAccent}
                    onChange={e => onSetAccent(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                  />
                  {!isCustom && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M7 2v10M2 7h10" />
                    </svg>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
