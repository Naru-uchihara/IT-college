"use client";

import { useMemo, useState } from "react";
import { addMonths, toYearMonth } from "@/domain/dates";
import { formatDate, formatPercent, formatSignedPercent, formatYen, formatYearMonth, todayIso } from "@/domain/format";
import { achievementRate, salesInMonths, sumAmount, targetFor, totalForMonth, yoyRate } from "@/domain/sales";
import { deleteSale, useAppData } from "@/lib/store";
import type { Sale } from "@/types";
import { ImportDialog } from "../import/ImportDialog";
import { Button, IconButton } from "../ui/Button";
import { EmptyState, PageHeader, StatCard } from "../ui/Card";
import { SearchInput, SelectInput } from "../ui/Field";
import { ConfirmDialog } from "../ui/Modal";
import { SortHeader, useSortToggle, type SortDir } from "../ui/SortHeader";
import { SaleFormDialog } from "./SaleFormDialog";
import { TargetDialog } from "./TargetDialog";

type SortKey = "recordedOn" | "project" | "customer" | "amount";

export function SalesDetails() {
  const data = useAppData();
  const today = todayIso();
  const [ym, setYm] = useState(toYearMonth(today));
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "recordedOn", dir: "asc" });
  const [editing, setEditing] = useState<Sale | "new" | null>(null);
  const [deleting, setDeleting] = useState<Sale | null>(null);
  const [targetOpen, setTargetOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const year = ym.slice(0, 4);
  const month = String(Number(ym.slice(5)));
  const years = useMemo(() => {
    const ys = new Set(data.sales.map((s) => s.recordedOn.slice(0, 4)));
    ys.add(today.slice(0, 4));
    ys.add(year);
    return [...ys].sort((a, b) => b.localeCompare(a));
  }, [data.sales, today, year]);

  const projectName = (id: string) => data.projects.find((p) => p.id === id)?.name ?? "(削除された案件)";
  const customerName = (id: string) => data.customers.find((c) => c.id === id)?.name ?? "(不明な顧客)";

  const monthSales = salesInMonths(data.sales, [ym]);
  const q = query.trim().toLowerCase();
  const filtered = monthSales.filter(
    (s) => !q || projectName(s.projectId).toLowerCase().includes(q) || customerName(s.customerId).toLowerCase().includes(q),
  );
  const keyOf = (s: Sale): string | number =>
    sort.key === "project" ? projectName(s.projectId) : sort.key === "customer" ? customerName(s.customerId) : s[sort.key];
  const rows = [...filtered].sort((a, b) => {
    const av = keyOf(a);
    const bv = keyOf(b);
    const c = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "ja");
    return sort.dir === "asc" ? c : -c;
  });
  const onSort = useSortToggle(sort.key, sort.dir, (key, dir) => setSort({ key, dir }));

  const total = sumAmount(monthSales);
  const prev = totalForMonth(data.sales, addMonths(ym, -12));
  const target = targetFor(data.targets, ym);
  const yoy = yoyRate(total, prev);
  const rate = achievementRate(total, target);
  const projectCount = new Set(monthSales.map((s) => s.projectId)).size;
  const label = `${Number(month)}月`;

  return (
    <>
      <PageHeader
        title="売上詳細"
        sub="年月ごとの売上明細"
        actions={
          <>
            <Button variant="secondary" icon="upload" onClick={() => setImportOpen(true)}>CSV/Excel取り込み</Button>
            <Button variant="secondary" icon="target" onClick={() => setTargetOpen(true)}>目標売上を設定</Button>
            <Button icon="plus" onClick={() => setEditing("new")}>売上を登録</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SelectInput aria-label="年" value={year} onChange={(e) => setYm(`${e.target.value}-${ym.slice(5)}`)} className="w-32">
          {years.map((y) => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </SelectInput>
        <SelectInput aria-label="月" value={month} onChange={(e) => setYm(`${year}-${e.target.value.padStart(2, "0")}`)} className="w-24">
          {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((m) => (
            <option key={m} value={m}>{m}月</option>
          ))}
        </SelectInput>
        <div className="hidden flex-1 sm:block" />
        <SearchInput value={query} onChange={setQuery} placeholder="案件名・顧客名で検索" className="w-full sm:w-72" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label={`${label}の売上合計`}
          value={formatYen(total)}
          sub={`前年同月比 ${formatSignedPercent(yoy)}`}
          tone={yoy === null ? "muted" : yoy >= 0 ? "good" : "bad"}
        />
        <StatCard label="明細件数" value={`${monthSales.length}件`} sub={`案件数 ${projectCount}件`} />
        <StatCard
          label={`${label}の目標`}
          value={target !== null ? formatYen(target) : "未設定"}
          sub={target !== null ? `達成率 ${formatPercent(rate)}` : "「目標売上を設定」から登録できます"}
          tone={rate !== null && rate >= 1 ? "good" : "muted"}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <caption className="sr-only">{formatYearMonth(ym)}の売上明細</caption>
          <thead className="bg-subtle text-xs text-muted">
            <tr>
              <SortHeader label="計上日" sortKey="recordedOn" current={sort.key} dir={sort.dir} onSort={onSort} />
              <SortHeader label="案件名" sortKey="project" current={sort.key} dir={sort.dir} onSort={onSort} />
              <SortHeader label="顧客名" sortKey="customer" current={sort.key} dir={sort.dir} onSort={onSort} />
              <SortHeader label="金額" sortKey="amount" current={sort.key} dir={sort.dir} onSort={onSort} align="right" />
              <th scope="col" className="px-4 py-3 font-normal">備考</th>
              <th scope="col" className="w-24 px-4 py-3"><span className="sr-only">操作</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3.5 whitespace-nowrap text-muted tabular-nums">{formatDate(s.recordedOn)}</td>
                <td className="px-4 py-3.5 font-medium">{projectName(s.projectId)}</td>
                <td className="px-4 py-3.5">{customerName(s.customerId)}</td>
                <td className="px-4 py-3.5 text-right font-medium whitespace-nowrap tabular-nums">{formatYen(s.amount)}</td>
                <td className="px-4 py-3.5 text-muted">{s.note || "—"}</td>
                <td className="px-4 py-2 text-right whitespace-nowrap">
                  <IconButton icon="edit" label="編集" onClick={() => setEditing(s)} />
                  <IconButton icon="trash" label="削除" onClick={() => setDeleting(s)} />
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t border-border bg-subtle font-medium">
                <td className="px-4 py-3.5" />
                <td className="px-4 py-3.5">{q ? "合計(絞り込み結果)" : "合計"}</td>
                <td className="px-4 py-3.5" />
                <td className="px-4 py-3.5 text-right tabular-nums">{formatYen(sumAmount(rows))}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
        {rows.length === 0 && <EmptyState>{monthSales.length ? "条件に一致する売上はありません" : `${formatYearMonth(ym)}の売上はまだありません`}</EmptyState>}
      </div>

      {editing && (
        <SaleFormDialog
          sale={editing === "new" ? null : editing}
          defaultDate={ym === toYearMonth(today) ? today : `${ym}-01`}
          onClose={() => setEditing(null)}
        />
      )}
      {targetOpen && <TargetDialog yearMonth={ym} current={target} onClose={() => setTargetOpen(false)} />}
      <ImportDialog entity="sales" open={importOpen} onClose={() => setImportOpen(false)} />
      <ConfirmDialog
        open={!!deleting}
        title="売上明細を削除しますか?"
        message={deleting && `${formatDate(deleting.recordedOn)} ${projectName(deleting.projectId)} ${formatYen(deleting.amount)}`}
        onConfirm={() => {
          if (deleting) deleteSale(deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
