/** 年度の開始月(要件定義書 Q-04 未確定のため4月始まりで仮置き) */
export const FISCAL_YEAR_START_MONTH = 4;

export function toYearMonth(date: string): string {
  return date.slice(0, 7);
}

export function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split("-").map(Number);
  const idx = y * 12 + (m - 1) + n;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}`;
}

/** endYm を最後とする count か月分(古い順) */
export function monthsEndingAt(endYm: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addMonths(endYm, i - count + 1));
}

export function fiscalYearOf(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return m >= FISCAL_YEAR_START_MONTH ? y : y - 1;
}

export function fiscalYearMonths(fy: number): string[] {
  const start = `${fy}-${String(FISCAL_YEAR_START_MONTH).padStart(2, "0")}`;
  return Array.from({ length: 12 }, (_, i) => addMonths(start, i));
}

/** a から b までの日数 (b - a) */
export function daysBetween(a: string, b: string): number {
  const ms = Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) -
    Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10));
  return Math.round(ms / 86400000);
}

/** YYYY-MM-DD / YYYY/MM/DD / YYYY/M/D を YYYY-MM-DD に正規化。不正なら null */
export function normalizeDate(input: string): string | null {
  const m = input.trim().match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m;
  const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  const dt = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(dt.getTime()) || dt.toISOString().slice(0, 10) !== iso) return null;
  return iso;
}
