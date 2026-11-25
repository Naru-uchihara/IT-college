"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { addMonths, fiscalYearMonths, fiscalYearOf, monthsEndingAt, toYearMonth } from "@/domain/dates";
import { formatPercent, formatSignedPercent, formatYen, formatYearMonth, todayIso } from "@/domain/format";
import {
  achievementRate,
  breakdown,
  fiscalYearTarget,
  fiscalYearToDate,
  monthlySeries,
  salesInMonths,
  targetFor,
  totalForMonth,
  yoyRate,
  type BreakdownItem,
} from "@/domain/sales";
import { useAppData } from "@/lib/store";
import { Card, EmptyState, PageHeader, StatCard } from "../ui/Card";
import { SelectInput } from "../ui/Field";

const RECENT = "recent";

export function SalesDashboard() {
  const data = useAppData();
  const today = todayIso();
  const thisMonth = toYearMonth(today);
  const currentFy = fiscalYearOf(thisMonth);
  const [period, setPeriod] = useState<string>(RECENT);

  const fiscalYears = useMemo(() => {
    const years = new Set(data.sales.map((s) => fiscalYearOf(toYearMonth(s.recordedOn))));
    years.add(currentFy);
    return [...years].sort((a, b) => b - a);
  }, [data.sales, currentFy]);

  const months = period === RECENT ? monthsEndingAt(thisMonth, 12) : fiscalYearMonths(Number(period));
  const periodLabel =
    period === RECENT
      ? `直近12か月(${formatYearMonth(months[0])}〜${formatYearMonth(months[11])})`
      : `${period}年度(${formatYearMonth(months[0])}〜${formatYearMonth(months[11])})`;

  // 指標カード(常に今月基準)
  const monthTotal = totalForMonth(data.sales, thisMonth);
  const lastYearTotal = totalForMonth(data.sales, addMonths(thisMonth, -12));
  const monthTarget = targetFor(data.targets, thisMonth);
  const fyToDate = fiscalYearToDate(data.sales, thisMonth);
  const fyTarget = fiscalYearTarget(data.targets, currentFy);
  const yoy = yoyRate(monthTotal, lastYearTotal);
  const monthRate = achievementRate(monthTotal, monthTarget);
  const fyRate = achievementRate(fyToDate, fyTarget);

  const series = monthlySeries(data.sales, months).map((p) => ({
    label: `${Number(p.ym.slice(5))}月`,
    今年: p.current,
    前年同月: p.previousYear,
  }));

  const periodSales = salesInMonths(data.sales, months);
  const projectName = (id: string) => data.projects.find((p) => p.id === id)?.name ?? "(削除された案件)";
  const customerName = (id: string) => data.customers.find((c) => c.id === id)?.name ?? "(不明な顧客)";
  const byProject = breakdown(periodSales, (s) => s.projectId, projectName);
  const byCustomer = breakdown(periodSales, (s) => s.customerId, customerName);

  return (
    <>
      <PageHeader
        title="売上ダッシュボード"
        sub={periodLabel}
        actions={
          <SelectInput aria-label="表示期間" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-44">
            <option value={RECENT}>直近12か月</option>
            {fiscalYears.map((y) => (
              <option key={y} value={y}>
                {y}年度
              </option>
            ))}
          </SelectInput>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`今月の売上(${Number(thisMonth.slice(5))}月)`}
          value={formatYen(monthTotal)}
          sub={`前年同月比 ${formatSignedPercent(yoy)}`}
          tone={yoy === null ? "muted" : yoy >= 0 ? "good" : "bad"}
        />
        <StatCard label="前年同月" value={formatYen(lastYearTotal)} sub={formatYearMonth(addMonths(thisMonth, -12))} />
        <StatCard
          label="今月の目標達成率"
          value={formatPercent(monthRate)}
          sub={monthTarget ? `目標 ${formatYen(monthTarget)}` : "目標未設定"}
          tone={monthRate === null ? "muted" : monthRate >= 1 ? "good" : "muted"}
        />
        <StatCard
          label="年度累計の達成率"
          value={formatPercent(fyRate)}
          sub={fyTarget ? `累計 ${formatYen(fyToDate)} / 目標 ${formatYen(fyTarget)}` : "目標未設定"}
        />
      </div>

      <Card title="月別売上推移">
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <BarChart data={series} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barGap={4}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted)" }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={64}
                tick={{ fontSize: 12, fill: "var(--color-muted)" }}
                tickFormatter={(v: number) => `${(v / 10000).toLocaleString("ja-JP")}万`}
              />
              <Tooltip formatter={(v: number) => formatYen(v)} cursor={{ fill: "var(--color-subtle)" }} />
              <Legend align="right" verticalAlign="top" iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
              <Bar dataKey="前年同月" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} maxBarSize={18} />
              <Bar dataKey="今年" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BreakdownCard title="案件別売上" items={byProject} />
        <BreakdownCard title="顧客別売上" items={byCustomer} />
      </div>
    </>
  );
}

function BreakdownCard({ title, items }: { title: string; items: BreakdownItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.amount));
  return (
    <Card title={title}>
      {items.length === 0 ? (
        <EmptyState>この期間の売上はありません</EmptyState>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {items.map((i) => (
            <li key={i.id} className="flex flex-col gap-1.5">
              <div className="flex gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">{i.name}</span>
                <span className="font-medium tabular-nums">{formatYen(i.amount)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-subtle">
                <div className="h-full rounded bg-brand" style={{ width: `${(i.amount / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
