import { useState, useRef, useEffect } from 'react';
import { concepts } from '../content/concepts';
import { Lightbulb } from '@/components/animate-ui/icons/lightbulb';

interface Props {
  conceptId: string;
}

export default function InfoTip({ conceptId }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const concept = concepts[conceptId];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  if (!concept) return null;

  return (
    <span
      ref={ref}
      style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        title={`Learn: ${concept.term}`}
        onClick={() => setOpen(v => !v)}
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
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <Lightbulb animateOnHover size={12} aria-hidden />
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          zIndex: 300,
          width: 'min(280px, calc(100vw - 24px))',
          padding: '14px 16px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow)',
          ...(ref.current ? (() => {
            const r = ref.current.getBoundingClientRect();
            const tipW = Math.min(280, window.innerWidth - 24);
            let left = r.right - tipW;
            if (left < 12) left = 12;
            return { top: r.bottom + 8, left };
          })() : {}),
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
