import { useState } from 'react';
import { concepts } from '../content/concepts';
import { Lightbulb } from '@/components/animate-ui/icons/lightbulb';

interface Props {
  conceptId: string;
}

export default function InfoTip({ conceptId }: Props) {
  const [open, setOpen] = useState(false);
  const concept = concepts[conceptId];

  if (!concept) return null;

  return (
    <span
      style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        title={`Learn: ${concept.term}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: '1px solid var(--accent)',
          background: open ? 'var(--accent)' : 'var(--accent-tint)',
          color: open ? '#0b0d0c' : 'var(--accent)',
          cursor: 'default',
          padding: 0,
        }}
      >
        <Lightbulb animateOnHover size={12} aria-hidden />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 28,
          right: 0,
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
            marginBottom: 8,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
              {concept.term}
            </span>
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
      )}
    </span>
  );
}
