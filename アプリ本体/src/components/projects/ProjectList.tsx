"use client";

import { useState } from "react";
import { formatDate, formatYen, todayIso } from "@/domain/format";
import { deadlineState, DEADLINE_SOON_DAYS, filterProjects, primaryMemberId, sortProjects, type ProjectFilter, type ProjectSortKey } from "@/domain/projects";
import { useAppData } from "@/lib/store";
import { PROJECT_STATUSES, type ProjectStatus } from "@/types";
import { ImportDialog } from "../import/ImportDialog";
import { Button } from "../ui/Button";
import { EmptyState, PageHeader, ProgressBar } from "../ui/Card";
import { SearchInput, SelectInput } from "../ui/Field";
import { SortHeader, useSortToggle, type SortDir } from "../ui/SortHeader";
import { StatusBadge } from "../ui/StatusBadge";
import { ProjectModal } from "./ProjectModal";

export function ProjectList() {
  const data = useAppData();
  const today = todayIso();
  const [filter, setFilter] = useState<ProjectFilter>({ query: "", status: "", employeeId: "", customerId: "" });
  const [sort, setSort] = useState<{ key: ProjectSortKey; dir: SortDir }>({ key: "dueDate", dir: "asc" });
  const [openId, setOpenId] = useState<string | "new" | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const onSort = useSortToggle(sort.key, sort.dir, (key, dir) => setSort({ key, dir }));

  const rows = sortProjects(filterProjects(data.projects, filter), sort.key, sort.dir);
  const customerName = (id: string) => data.customers.find((c) => c.id === id)?.name ?? "(不明な顧客)";
  const employeeName = (id: string | null) => (id ? (data.employees.find((e) => e.id === id)?.name ?? "—") : "—");
  const set = (patch: Partial<ProjectFilter>) => setFilter((f) => ({ ...f, ...patch }));
  const filtered = rows.length !== data.projects.length;

  return (
    <>
      <PageHeader
        title="案件一覧"
        sub={filtered ? `${rows.length}件 / 全${data.projects.length}件` : `全${data.projects.length}件`}
        actions={
          <>
            <Button variant="secondary" icon="upload" onClick={() => setImportOpen(true)}>CSV/Excel取り込み</Button>
            <Button icon="plus" onClick={() => setOpenId("new")}>新規案件</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={filter.query} onChange={(query) => set({ query })} placeholder="案件名で検索" className="w-full sm:w-64" />
        <SelectInput aria-label="ステータス" value={filter.status} onChange={(e) => set({ status: e.target.value as ProjectStatus | "" })} className="w-48">
          <option value="">ステータス: すべて</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </SelectInput>
        <SelectInput aria-label="担当者" value={filter.employeeId} onChange={(e) => set({ employeeId: e.target.value })} className="w-40">
          <option value="">担当者: すべて</option>
          {data.employees.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </SelectInput>
        <SelectInput aria-label="顧客" value={filter.customerId} onChange={(e) => set({ customerId: e.target.value })} className="w-52">
          <option value="">顧客: すべて</option>
          {data.customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </SelectInput>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <caption className="sr-only">案件一覧。行を選ぶと詳細が開きます</caption>
          <thead className="bg-subtle text-xs text-muted">
            <tr>
              <SortHeader label="案件名" sortKey="name" current={sort.key} dir={sort.dir} onSort={onSort} />
              <th scope="col" className="px-4 py-3 font-normal whitespace-nowrap">顧客名</th>
              <th scope="col" className="px-4 py-3 font-normal whitespace-nowrap">担当者</th>
              <th scope="col" className="px-4 py-3 font-normal whitespace-nowrap">ステータス</th>
              <SortHeader label="開始日" sortKey="startDate" current={sort.key} dir={sort.dir} onSort={onSort} />
              <SortHeader label="納期" sortKey="dueDate" current={sort.key} dir={sort.dir} onSort={onSort} />
              <SortHeader label="進捗" sortKey="progress" current={sort.key} dir={sort.dir} onSort={onSort} />
              <SortHeader label="契約金額" sortKey="contractAmount" current={sort.key} dir={sort.dir} onSort={onSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const deadline = deadlineState(p, today);
              const rowColor = deadline === "overdue" ? "bg-red-50 hover:bg-red-100" : deadline === "soon" ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-subtle";
              return (
                <tr key={p.id} onClick={() => setOpenId(p.id)} className={`cursor-pointer border-t border-border ${rowColor}`}>
                  <td className="px-4 py-3.5 font-medium">
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpenId(p.id); }} className="text-left hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">
                      {p.name}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">{customerName(p.customerId)}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {employeeName(primaryMemberId(p))}
                    {p.members.length > 1 && <span className="ml-1 text-xs text-muted">他{p.members.length - 1}名</span>}
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted tabular-nums">{formatDate(p.startDate)}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <span className={`tabular-nums ${deadline === "overdue" ? "text-red-700" : ""}`}>{formatDate(p.dueDate)}</span>
                      {deadline === "soon" && <StatusBadge status="納期間近" />}
                      {deadline === "overdue" && <StatusBadge status="期限超過" />}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"><ProgressBar value={p.progress} /></td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap tabular-nums">{formatYen(p.contractAmount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <EmptyState>条件に一致する案件はありません</EmptyState>}
      </div>
      <p className="text-xs text-muted">
        ※ 行をクリックすると案件詳細が開きます。納期{DEADLINE_SOON_DAYS}日以内は黄色、納期超過は赤色で表示します(進行中・見積中の案件のみ)。
      </p>

      {openId && <ProjectModal key={openId} projectId={openId === "new" ? null : openId} onClose={() => setOpenId(null)} />}
      <ImportDialog entity="projects" open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  );
}
