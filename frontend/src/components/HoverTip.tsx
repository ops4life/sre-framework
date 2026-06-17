import { useState } from 'react';
import { concepts } from '../content/concepts';

interface Props {
  conceptId: string;
}

export default function HoverTip({ conceptId }: Props) {
  const [open, setOpen] = useState(false);
  const concept = concepts[conceptId];
  if (!concept) return null;

  return (
    <span style={{ position: 'relative', display: 'inline-block', marginLeft: 6 }}>
      <span
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 15,
          height: 15,
          borderRadius: '50%',
          border: '1px solid var(--border)',
          background: 'var(--surface-2)',
          color: 'var(--muted)',
          fontSize: 9,
          fontWeight: 700,
          fontFamily: 'var(--mono)',
          cursor: 'default',
          verticalAlign: 'middle',
          padding: 0,
          lineHeight: 1,
        }}
      >
        ?
      </span>

      {open && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 0,
          zIndex: 200,
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
        </div>
      )}
    </span>
  );
}
