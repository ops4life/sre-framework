import { concepts } from '../content/concepts';

export default function ConceptsPage() {
  return (
    <div className="cz-page">
      <div className="slide-up" style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="cz-page-head">
          <div className="cz-page-title">Concepts</div>
          <div className="cz-page-sub">// SRE terminology reference</div>
        </div>

        <div className="cz-card">
          <div className="cz-card-head">
            <span className="cz-pre">▍</span> Definitions
          </div>
          <div className="cz-list">
            {Object.values(concepts).map((c, i) => (
              <div key={c.id} className="cz-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, paddingTop: i === 0 ? 0 : 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--accent)' }}>{c.term}</span>
                <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{c.plain}</span>
                {c.computedAs && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {c.computedAs}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
