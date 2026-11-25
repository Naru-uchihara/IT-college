"use client";

import { useSyncExternalStore } from "react";
import { createSeedData } from "@/data/seed";
import type { EmployeeImport, ProjectImport, SaleImport } from "@/domain/importers";
import { localStorageRepository, type DataRepository } from "@/repositories/data-repository";
import type { AppData, AuditFields, Customer, Employee, Project, Sale, SalaryRecord } from "@/types";
import { currentUserEmail } from "./session";

/**
 * アプリ全体のデータストア。UIはこのモジュールのフックとアクション経由でのみデータを読み書きする。
 */

const repository: DataRepository = localStorageRepository;
const listeners = new Set<() => void>();
const serverSnapshot = createSeedData();
let state: AppData | null = null;

function getSnapshot(): AppData {
  if (!state) state = repository.load();
  return state;
}

function update(fn: (d: AppData) => AppData) {
  state = fn(getSnapshot());
  repository.save(state);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

/** ハイドレーション完了後に true */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function stamp<T extends object>(entity: T, isNew: boolean): T & AuditFields {
  const now = new Date().toISOString();
  return {
    ...entity,
    createdAt: isNew ? now : ((entity as Partial<AuditFields>).createdAt ?? now),
    updatedAt: now,
    updatedBy: currentUserEmail(),
  };
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
}

// ---- 売上
export type SaleInput = Omit<Sale, keyof AuditFields | "id" | "customerId"> & { id?: string };

export function saveSale(input: SaleInput) {
  update((d) => {
    const existing = input.id ? d.sales.find((s) => s.id === input.id) : undefined;
    const project = d.projects.find((p) => p.id === input.projectId);
    const sale = stamp(
      { ...existing, ...input, id: input.id ?? newId("s"), customerId: project?.customerId ?? existing?.customerId ?? "" },
      !existing,
    ) as Sale;
    return { ...d, sales: upsert(d.sales, sale) };
  });
}

export function deleteSale(id: string) {
  update((d) => ({ ...d, sales: d.sales.filter((s) => s.id !== id) }));
}

export function setTarget(yearMonth: string, amount: number | null) {
  update((d) => {
    const rest = d.targets.filter((t) => t.yearMonth !== yearMonth);
    return { ...d, targets: amount === null ? rest : [...rest, { yearMonth, amount }] };
  });
}

// ---- 案件
export type ProjectInput = Omit<Project, keyof AuditFields | "id"> & { id?: string };

export function saveProject(input: ProjectInput): string {
  const id = input.id ?? newId("p");
  update((d) => {
    const existing = d.projects.find((p) => p.id === id);
    const project = stamp({ ...existing, ...input, id }, !existing) as Project;
    // 案件の顧客が変わったら、紐づく売上の顧客も合わせる
    const sales = d.sales.map((s) => (s.projectId === id ? { ...s, customerId: project.customerId } : s));
    return { ...d, projects: upsert(d.projects, project), sales };
  });
  return id;
}

export function deleteProject(id: string) {
  update((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id), sales: d.sales.filter((s) => s.projectId !== id) }));
}

export function addCustomer(name: string): string {
  const id = newId("c");
  update((d) => ({ ...d, customers: [...d.customers, stamp({ id, name }, true) as Customer] }));
  return id;
}

// ---- 社員
export type EmployeeInput = Omit<Employee, keyof AuditFields | "id"> & { id?: string };

export function saveEmployee(input: EmployeeInput): string {
  const id = input.id ?? newId("e");
  update((d) => {
    const existing = d.employees.find((e) => e.id === id);
    return { ...d, employees: upsert(d.employees, stamp({ ...existing, ...input, id }, !existing) as Employee) };
  });
  return id;
}

/** 給料の変更は履歴に1行追加する(上書きしない) */
export function addSalaryRecord(employeeId: string, record: SalaryRecord) {
  update((d) => ({
    ...d,
    employees: d.employees.map((e) =>
      e.id === employeeId ? (stamp({ ...e, salaryHistory: [...e.salaryHistory, record] }, false) as Employee) : e,
    ),
  }));
}

export function deleteEmployee(id: string) {
  update((d) => ({
    ...d,
    employees: d.employees.filter((e) => e.id !== id),
    projects: d.projects.map((p) => ({ ...p, members: p.members.filter((m) => m.employeeId !== id) })),
  }));
}

// ---- 一括取り込み
export function importSales(rows: SaleImport[]) {
  update((d) => ({ ...d, sales: [...d.sales, ...rows.map((r) => stamp({ ...r, id: newId("s") }, true) as Sale)] }));
}

export function importProjects(rows: ProjectImport[]) {
  update((d) => {
    const customers = [...d.customers];
    const projects = rows.map((r) => {
      let customerId = r.customerId ?? customers.find((c) => c.name === r.customerName)?.id;
      if (!customerId) {
        customerId = newId("c");
        customers.push(stamp({ id: customerId, name: r.customerName }, true) as Customer);
      }
      return stamp(
        {
          id: newId("p"),
          name: r.name,
          customerId,
          contractAmount: r.contractAmount,
          status: r.status,
          startDate: r.startDate,
          dueDate: r.dueDate,
          progress: r.progress,
          description: r.description,
          members: r.primaryEmployeeId ? [{ employeeId: r.primaryEmployeeId, role: "", isPrimary: true }] : [],
        },
        true,
      ) as Project;
    });
    return { ...d, customers, projects: [...d.projects, ...projects] };
  });
}

export function importEmployees(rows: EmployeeImport[]) {
  update((d) => ({
    ...d,
    employees: [
      ...d.employees,
      ...rows.map(
        (r) =>
          stamp(
            {
              id: newId("e"),
              employeeNo: r.employeeNo,
              name: r.name,
              nameKana: r.nameKana,
              department: r.department,
              position: r.position,
              hireDate: r.hireDate,
              email: r.email,
              phone: r.phone,
              status: "在籍",
              skills: r.skills,
              qualifications: [],
              salaryHistory: r.salary !== null ? [{ effectiveFrom: r.hireDate, amount: r.salary, reason: "取り込み" }] : [],
            },
            true,
          ) as Employee,
      ),
    ],
  }));
}

/** ダミーデータを初期状態に戻す */
export function resetData() {
  state = repository.reset();
  repository.save(state);
  listeners.forEach((l) => l());
}

/** 最新のデータ(イベントハンドラ内で使う) */
export function getData(): AppData {
  return getSnapshot();
}
