export const toNum = (v: string) => {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
export const show = (v: number | null, digits = 0) =>
  v == null ? '—' : v.toFixed(digits).replace('.', ',');
export const fmt = (v: number | null) => (v == null ? '—' : String(v).replace('.', ','));

const pad = (n: number) => String(n).padStart(2, '0');
export const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};
export const longDate = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

// "60" -> "60 s", "120" -> "2 min"
export const restLabel = (seconds: number) =>
  seconds >= 60 && seconds % 60 === 0 ? `${seconds / 60} min` : `${seconds} s`;

export const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

// "2026-11-17" -> "17/11/2026" (sem passar por Date, para não deslocar o dia por fuso horário)
export const dateOnly = (d: string) => {
  const [y, m, day] = d.slice(0, 10).split('-');
  return `${day}/${m}/${y}`;
};
