/** 金額を「¥12,480,000」形式で表示する (F-C02) */
export function formatYen(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}¥${Math.abs(Math.round(amount)).toLocaleString("ja-JP")}`;
}

/** YYYY-MM-DD → YYYY/MM/DD。null は「—」 */
export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return date.replaceAll("-", "/");
}

/** YYYY-MM → 2026年11月 */
export function formatYearMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${y}年${Number(m)}月`;
}

export function formatPercent(rate: number | null, digits = 1): string {
  if (rate === null || !Number.isFinite(rate)) return "—";
  return `${(rate * 100).toFixed(digits)}%`;
}

export function formatSignedPercent(rate: number | null, digits = 1): string {
  if (rate === null || !Number.isFinite(rate)) return "—";
  const v = rate * 100;
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

/** ローカル時刻の今日を YYYY-MM-DD で返す */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
