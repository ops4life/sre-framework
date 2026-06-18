import { useState } from 'react';
import type { Theme } from '../hooks/useTheme';

interface Props {
  accent: string;
  onSetAccent: (hex: string) => void;
  theme: Theme;
}

const PRESETS = [
  { hex: '#caff04', label: 'Lime' },
  { hex: '#3b82f6', label: 'Blue' },
  { hex: '#a855f7', label: 'Purple' },
  { hex: '#f97316', label: 'Orange' },
  { hex: '#ec4899', label: 'Pink' },
  { hex: '#22c55e', label: 'Green' },
  { hex: '#f43f5e', label: 'Rose' },
  { hex: '#06b6d4', label: 'Cyan' },
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export default function CustomizePage({ accent, onSetAccent, theme }: Props) {
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState(false);

  const validAccent = /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : '#caff04';
  const textOnAccent = luminance(validAccent) > 140 ? '#0b0d0c' : '#ffffff';

  const handleCommit = () => {
    const v = input.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      onSetAccent(v);
      setInput('');
      setInputError(false);
    } else {
      setInputError(true);
      setTimeout(() => setInputError(false), 1200);
    }
  };

  const cardBg = theme === 'dark' ? 'rgba(16,18,19,0.72)' : 'rgba(255,255,255,0.72)';
  const cardBorder = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="customize-page" style={{ background: validAccent }}>
      <div
        className="customize-card"
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="customize-card-header">
          <div className="customize-swatch-preview" style={{ background: validAccent }}>
            <span style={{ color: textOnAccent, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em' }}>
              {validAccent.toUpperCase()}
            </span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>Accent Color</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
              Applied to buttons, highlights, and interactive elements
            </div>
          </div>
        </div>

        <div className="customize-section-label">Presets</div>
        <div className="customize-presets">
          {PRESETS.map(p => (
            <button
              key={p.hex}
              type="button"
              className={`customize-preset${validAccent.toLowerCase() === p.hex ? ' active' : ''}`}
              onClick={() => onSetAccent(p.hex)}
              title={p.label}
            >
              <span className="customize-preset-dot" style={{ background: p.hex }} />
              <span className="customize-preset-label">{p.label}</span>
            </button>
          ))}
        </div>

        <div className="customize-section-label" style={{ marginTop: 20 }}>Custom</div>
        <div className="customize-input-row">
          <div className="customize-input-preview" style={{ background: /^#[0-9a-fA-F]{6}$/.test(input) ? input : 'var(--surface-3)' }} />
          <input
            type="text"
            className={`customize-hex-input${inputError ? ' error' : ''}`}
            placeholder="#rrggbb"
            maxLength={7}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCommit(); }}
            spellCheck={false}
          />
          <button type="button" className="customize-apply-btn" onClick={handleCommit}>
            Apply
          </button>
        </div>

        <div className="customize-section-label" style={{ marginTop: 24 }}>Preview</div>
        <div className="customize-preview-row">
          <button type="button" className="customize-preview-btn" style={{ background: validAccent, color: textOnAccent, border: `1px solid ${validAccent}` }}>
            Primary Button
          </button>
          <div className="customize-preview-badge" style={{ background: `rgba(var(--accent-rgb), 0.15)`, color: validAccent }}>
            Active state
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: validAccent }}>
            Link / accent text
          </div>
        </div>
      </div>
    </div>
  );
}
