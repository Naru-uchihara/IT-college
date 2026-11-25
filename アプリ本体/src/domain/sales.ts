import type { Sale, SalesTarget } from "@/types";
import { addMonths, fiscalYearMonths, fiscalYearOf, toYearMonth } from "./dates";

export function salesInMonths(sales: Sale[], months: string[]): Sale[] {
  const set = new Set(months);
  return sales.filter((s) => set.has(toYearMonth(s.recordedOn)));
}

export function sumAmount(sales: Sale[]): number {
  return sales.reduce((acc, s) => acc + s.amount, 0);
}

export function totalForMonth(sales: Sale[], ym: string): number {
  return sumAmount(salesInMonths(sales, [ym]));
}

export interface MonthlyPoint {
  ym: string;
  current: number;
  previousYear: number;
}

/** 指定月ごとの売上と前年同月の売上 */
export function monthlySeries(sales: Sale[], months: string[]): MonthlyPoint[] {
  const totals = new Map<string, number>();
  for (const s of sales) {
    const ym = toYearMonth(s.recordedOn);
    totals.set(ym, (totals.get(ym) ?? 0) + s.amount);
  }
  return months.map((ym) => ({
    ym,
    current: totals.get(ym) ?? 0,
    previousYear: totals.get(addMonths(ym, -12)) ?? 0,
  }));
}

/** 前年同月比(増減率)。前年が0なら null */
export function yoyRate(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / previous;
}

export function achievementRate(actual: number, target: number | null | undefined): number | null {
  if (!target) return null;
  return actual / target;
}

export function targetFor(targets: SalesTarget[], ym: string): number | null {
  return targets.find((t) => t.yearMonth === ym)?.amount ?? null;
}

export function fiscalYearTarget(targets: SalesTarget[], fy: number): number {
  const months = new Set(fiscalYearMonths(fy));
  return targets.filter((t) => months.has(t.yearMonth)).reduce((a, t) => a + t.amount, 0);
}

/** 年度の開始月から ym までの累計売上 */
export function fiscalYearToDate(sales: Sale[], ym: string): number {
  const fy = fiscalYearOf(ym);
  const months = fiscalYearMonths(fy).filter((m) => m <= ym);
  return sumAmount(salesInMonths(sales, months));
}

export interface BreakdownItem {
  id: string;
  name: string;
  amount: number;
}

/** 案件別・顧客別などの内訳。上位 limit 件+「その他」 */
export function breakdown(
  sales: Sale[],
  keyOf: (s: Sale) => string,
  nameOf: (id: string) => string,
  limit = 5,
): BreakdownItem[] {
  const totals = new Map<string, number>();
  for (const s of sales) totals.set(keyOf(s), (totals.get(keyOf(s)) ?? 0) + s.amount);
  const sorted = [...totals.entries()]
    .map(([id, amount]) => ({ id, name: nameOf(id), amount }))
    .sort((a, b) => b.amount - a.amount);
  if (sorted.length <= limit) return sorted;
  const top = sorted.slice(0, limit - 1);
  const rest = sorted.slice(limit - 1).reduce((a, i) => a + i.amount, 0);
  return [...top, { id: "__others__", name: "その他", amount: rest }];
}
