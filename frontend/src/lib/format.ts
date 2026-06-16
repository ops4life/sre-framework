export function spark(values: number[], w: number, h: number, pad = 2): string {
  if (!values.length) return '';
  const min = Math.min(...values), max = Math.max(...values), rng = (max - min) || 1;
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  return values.map((v, i) => {
    const x = i * step;
    const y = pad + (h - pad * 2) * (1 - (v - min) / rng);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export function area(values: number[], w: number, h: number, pad = 2): string {
  const line = spark(values, w, h, pad);
  if (!line) return '';
  return `${line} L${w},${h} L0,${h} Z`;
}

export function fmtClock(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

export function fmt(value: number | null | undefined, digits = 1): string {
  return value === null || value === undefined ? '—' : value.toFixed(digits);
}
