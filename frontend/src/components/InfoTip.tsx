import { useState } from 'react';
import { concepts } from '../content/concepts';

interface Props {
  conceptId: string;
  learnMode: boolean;
}

export default function InfoTip({ conceptId, learnMode }: Props) {
  const [open, setOpen] = useState(false);
  const concept = concepts[conceptId];

  if (!learnMode || !concept) return null;

  return (
    <span style={{ position: 'relative', display: 'inline-block', marginLeft: 6 }}>
      <button
        onClick={() => setOpen(v => !v)}
        title={`Learn: ${concept.term}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: '1px solid var(--accent)',
          background: 'var(--accent-tint)',
          color: 'var(--accent)',
          fontSize: 10,
          fontWeight: 700,
          fontFamily: 'var(--mono)',
          cursor: 'pointer',
          verticalAlign: 'middle',
          padding: 0,
          lineHeight: 1,
        }}
      >
        ?
      </button>

      {open && (
        <>
          {/* backdrop */}
          <span
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          />
          <div style={{
            position: 'absolute',
            top: 22,
            left: 0,
            zIndex: 100,
            width: 280,
            padding: '14px 16px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
                {concept.term}
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, padding: 0 }}
              >
                ×
              </button>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>
              {concept.plain}
            </p>
            {concept.computedAs && (
              <p style={{ margin: '0 0 10px', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', lineHeight: 1.5 }}>
                {concept.computedAs}
              </p>
            )}
            <a
              href={`/CONCEPTS.md#${concept.anchor}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--mono)' }}
            >
              → Read more in CONCEPTS.md
            </a>
          </div>
        </>
      )}
    </span>
  );
}
