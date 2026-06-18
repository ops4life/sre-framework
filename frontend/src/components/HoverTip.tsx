import { useState } from 'react';
import { createPortal } from 'react-dom';
import { concepts } from '../content/concepts';

interface TipPos { top: number; left: number }

export function useHoverTip(conceptId: string) {
  const [pos, setPos] = useState<TipPos | null>(null);
  const concept = concepts[conceptId];

  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      setPos({ top: r.bottom + 8, left: r.left });
    },
    onMouseLeave: () => setPos(null),
  };

  const tooltip = pos && concept ? createPortal(
    <div style={{
      position: 'fixed',
      top: pos.top,
      left: pos.left,
      zIndex: 300,
      width: 260,
      padding: '12px 14px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow)',
      pointerEvents: 'none',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)', marginBottom: 6 }}>
        {concept.term}
      </div>
      <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-2)', lineHeight: 1.55, fontFamily: 'var(--mono)' }}>
        {concept.plain}
      </p>
      {concept.computedAs && (
        <p style={{ margin: 0, fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', lineHeight: 1.5 }}>
          {concept.computedAs}
        </p>
      )}
    </div>,
    document.body
  ) : null;

  return { handlers, tooltip };
}
