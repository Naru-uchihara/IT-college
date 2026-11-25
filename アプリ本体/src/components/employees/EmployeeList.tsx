"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { currentSalary, filterEmployees, projectsOfEmployee, uniqueSorted, type EmployeeFilter } from "@/domain/employees";
import { formatDate, formatYen, todayIso } from "@/domain/format";
import { useAppData } from "@/lib/store";
import { ImportDialog } from "../import/ImportDialog";
import { Button } from "../ui/Button";
import { EmptyState, PageHeader } from "../ui/Card";
import { SearchInput, SelectInput } from "../ui/Field";
import { EmployeeFormDialog } from "./EmployeeFormDialog";

export function EmployeeList() {
  const data = useAppData();
  const router = useRouter();
  const today = todayIso();
  const [filter, setFilter] = useState<EmployeeFilter>({ query: "", department: "", position: "", skill: "" });
  const [creating, setCreating] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const set = (patch: Partial<EmployeeFilter>) => setFilter((f) => ({ ...f, ...patch }));

  const rows = filterEmployees(data.employees, filter).sort((a, b) => a.employeeNo.localeCompare(b.employeeNo));
  const active = data.employees.filter((e) => e.status === "在籍").length;

  return (
    <>
      <PageHeader
        title="社員一覧"
        sub={`在籍 ${active}名 / 登録 ${data.employees.length}名`}
        actions={
          <>
            <Button variant="secondary" icon="upload" onClick={() => setImportOpen(true)}>CSV/Excel取り込み</Button>
            <Button icon="plus" onClick={() => setCreating(true)}>社員を登録</Button>
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={filter.query} onChange={(query) => set({ query })} placeholder="氏名・社員番号で検索" className="w-full sm:w-64" />
        <SelectInput aria-label="部署" value={filter.department} onChange={(e) => set({ department: e.target.value })} className="w-40">
          <option value="">部署: すべて</option>
          {uniqueSorted(data.employees.map((e) => e.department)).map((d) => <option key={d} value={d}>{d}</option>)}
        </SelectInput>
        <SelectInput aria-label="役職" value={filter.position} onChange={(e) => set({ position: e.target.value })} className="w-36">
          <option value="">役職: すべて</option>
          {uniqueSorted(data.employees.map((e) => e.position)).map((d) => <option key={d} value={d}>{d}</option>)}
        </SelectInput>
        <SelectInput aria-label="スキル" value={filter.skill} onChange={(e) => set({ skill: e.target.value })} className="w-40">
          <option value="">スキル: すべて</option>
          {uniqueSorted(data.employees.flatMap((e) => e.skills)).map((d) => <option key={d} value={d}>{d}</option>)}
        </SelectInput>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[980px] text-left text-sm">
          <caption className="sr-only">社員一覧</caption>
          <thead className="bg-subtle text-xs text-muted">
            <tr>
              {["社員番号", "氏名", "部署", "役職", "入社日"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-normal whitespace-nowrap">{h}</th>
              ))}
              <th scope="col" className="px-4 py-3 text-right font-normal whitespace-nowrap">給料(月額)</th>
              <th scope="col" className="px-4 py-3 text-right font-normal whitespace-nowrap">参加案件</th>
              <th scope="col" className="px-4 py-3 font-normal">スキル</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => {
              const salary = currentSalary(e.salaryHistory, today);
              return (
                <tr key={e.id} onClick={() => router.push(`/employees/${e.id}`)} className="cursor-pointer border-t border-border hover:bg-subtle">
                  <td className="px-4 py-3 text-muted tabular-nums">{e.employeeNo}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs text-white">{e.name.slice(0, 1)}</span>
                      <div>
                        <Link href={`/employees/${e.id}`} onClick={(ev) => ev.stopPropagation()} className="font-medium hover:text-brand">
                          {e.name}
                        </Link>
                        <p className="text-xs text-muted">{e.nameKana}</p>
                      </div>
                      {e.status !== "在籍" && <span className="rounded bg-subtle px-1.5 text-xs text-muted">{e.status}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{e.department}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{e.position || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted tabular-nums">{formatDate(e.hireDate)}</td>
                  <td className="px-4 py-3 text-right font-medium whitespace-nowrap tabular-nums">{salary ? formatYen(salary.amount) : "—"}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{projectsOfEmployee(data.projects, e.id).length}件</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {e.skills.map((s) => <span key={s} className="rounded-md bg-subtle px-2 py-0.5 text-xs text-slate-600">{s}</span>)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <EmptyState>条件に一致する社員はいません</EmptyState>}
      </div>
      <p className="text-xs text-muted">※ 行をクリックすると社員詳細ページへ移動します。</p>

      {creating && <EmployeeFormDialog employee={null} onClose={() => setCreating(false)} onSaved={(id) => router.push(`/employees/${id}`)} />}
      <ImportDialog entity="employees" open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
