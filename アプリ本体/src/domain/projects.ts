import type { Project, ProjectStatus } from "@/types";
import { daysBetween } from "./dates";

/** 納期が近いと判定する日数 (F-P04) */
export const DEADLINE_SOON_DAYS = 7;

const ACTIVE_STATUSES: ProjectStatus[] = ["見積中", "進行中"];

export type DeadlineState = "overdue" | "soon" | null;

/** 進行中・見積中の案件について、納期超過/納期間近を判定する */
export function deadlineState(project: Pick<Project, "status" | "dueDate">, today: string): DeadlineState {
  if (!project.dueDate || !ACTIVE_STATUSES.includes(project.status)) return null;
  const days = daysBetween(today, project.dueDate);
  if (days < 0) return "overdue";
  if (days <= DEADLINE_SOON_DAYS) return "soon";
  return null;
}

export function primaryMemberId(project: Project): string | null {
  return (project.members.find((m) => m.isPrimary) ?? project.members[0])?.employeeId ?? null;
}

export interface ProjectFilter {
  query: string;
  status: ProjectStatus | "";
  employeeId: string;
  customerId: string;
}

export function filterProjects(projects: Project[], f: ProjectFilter): Project[] {
  const q = f.query.trim().toLowerCase();
  return projects.filter(
    (p) =>
      (!q || p.name.toLowerCase().includes(q)) &&
      (!f.status || p.status === f.status) &&
      (!f.customerId || p.customerId === f.customerId) &&
      (!f.employeeId || p.members.some((m) => m.employeeId === f.employeeId)),
  );
}

export type ProjectSortKey = "name" | "startDate" | "dueDate" | "progress" | "contractAmount";

export function sortProjects(projects: Project[], key: ProjectSortKey, dir: "asc" | "desc"): Project[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...projects].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    // 日付未設定は常に末尾
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * sign;
    return String(av).localeCompare(String(bv), "ja") * sign;
  });
}

export function clampProgress(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}
