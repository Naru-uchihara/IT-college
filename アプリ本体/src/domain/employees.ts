import type { Employee, Project, ProjectMember, SalaryRecord } from "@/types";

/** 適用開始日の新しい順 */
export function sortedSalaryHistory(history: SalaryRecord[]): SalaryRecord[] {
  return [...history].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
}

/** today 時点で適用されている給料 */
export function currentSalary(history: SalaryRecord[], today: string): SalaryRecord | null {
  return sortedSalaryHistory(history).find((r) => r.effectiveFrom <= today) ?? null;
}

export function projectsOfEmployee(
  projects: Project[],
  employeeId: string,
): { project: Project; member: ProjectMember }[] {
  return projects.flatMap((project) => {
    const member = project.members.find((m) => m.employeeId === employeeId);
    return member ? [{ project, member }] : [];
  });
}

/** 勤続年数(満年数) */
export function yearsOfService(hireDate: string, today: string): number {
  let years = Number(today.slice(0, 4)) - Number(hireDate.slice(0, 4));
  if (today.slice(5) < hireDate.slice(5)) years -= 1;
  return Math.max(0, years);
}

export interface EmployeeFilter {
  query: string;
  department: string;
  position: string;
  skill: string;
}

export function filterEmployees(employees: Employee[], f: EmployeeFilter): Employee[] {
  const q = f.query.trim().toLowerCase();
  return employees.filter(
    (e) =>
      (!q || e.name.toLowerCase().includes(q) || e.nameKana.toLowerCase().includes(q) || e.employeeNo.toLowerCase().includes(q)) &&
      (!f.department || e.department === f.department) &&
      (!f.position || e.position === f.position) &&
      (!f.skill || e.skills.includes(f.skill)),
  );
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
}
