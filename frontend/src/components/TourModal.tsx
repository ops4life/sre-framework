import { useState, useEffect } from 'react';
import type { TourStep } from '../tours';

interface Props {
  steps: TourStep[];
  onClose: () => void;
}

interface Rect { x: number; y: number; w: number; h: number; }

export default function TourModal({ steps, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    const place = () => {
      const el = document.querySelector(steps[step].sel);
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ x: r.left, y: r.top, w: r.width, h: r.height });
    };

    const el = document.querySelector(steps[step].sel);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(place, 350);
    }
    place();
    window.addEventListener('resize', place);
    const t = setInterval(place, 250);
    return () => { window.removeEventListener('resize', place); clearInterval(t); };
  }, [step, steps]);

  if (!rect) return null;

  const pad = 14, popHeight = 200;
  const placeBelow = rect.y + rect.h + pad + popHeight < window.innerHeight;
  const isMobile = window.innerWidth < 640;
  const popWidth = isMobile ? window.innerWidth - 40 : 320;
  const popX = isMobile ? 20 : Math.min(window.innerWidth - popWidth - 20, Math.max(20, rect.x));
  const popY = placeBelow ? rect.y + rect.h + pad : Math.max(20, rect.y - pad - popHeight);
  const next = () => step < steps.length - 1 ? setStep(s => s + 1) : onClose();
  const prev = () => setStep(s => Math.max(0, s - 1));

  return (
    <>
      <div className="tour-back" onClick={onClose} />
      <div className="tour-spotlight" style={{ left: rect.x - 6, top: rect.y - 6, width: rect.w + 12, height: rect.h + 12 }} />
      <div className="tour-popover" style={{ left: popX, top: popY, width: popWidth }}>
        <div className="tp-head">
          <span><span className="tp-step">{String(step + 1).padStart(2, '0')}</span> / {String(steps.length).padStart(2, '0')}</span>
          <span>tour guide</span>
        </div>
        <div className="tp-body">
          <strong>{steps[step].title}</strong>
          {steps[step].body}
        </div>
        <div className="tp-foot">
          <button className="tour-ghost-btn" onClick={onClose}>Skip</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && <button className="tour-ghost-btn" onClick={prev}>Back</button>}
            <button className="tour-cta" onClick={next}>
              {step === steps.length - 1 ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
