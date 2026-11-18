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
