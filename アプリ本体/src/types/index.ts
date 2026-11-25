export const PROJECT_STATUSES = ["見積中", "進行中", "納品済", "請求済", "失注"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const EMPLOYEE_STATUSES = ["在籍", "休職", "退職"] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

/** 登録・更新日時と更新者 (F-C04) */
export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Customer extends AuditFields {
  id: string;
  name: string;
}

export interface SalaryRecord {
  /** YYYY-MM-DD */
  effectiveFrom: string;
  amount: number;
  reason: string;
}

export interface Qualification {
  name: string;
  /** YYYY-MM-DD */
  acquiredOn: string;
}

export interface Employee extends AuditFields {
  id: string;
  employeeNo: string;
  name: string;
  nameKana: string;
  department: string;
  position: string;
  /** YYYY-MM-DD */
  hireDate: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  skills: string[];
  qualifications: Qualification[];
  /** 給料履歴。上書きせず追加していく */
  salaryHistory: SalaryRecord[];
}

export interface ProjectMember {
  employeeId: string;
  role: string;
  isPrimary: boolean;
}

export interface Project extends AuditFields {
  id: string;
  name: string;
  customerId: string;
  contractAmount: number;
  status: ProjectStatus;
  /** YYYY-MM-DD */
  startDate: string | null;
  /** YYYY-MM-DD */
  dueDate: string | null;
  /** 0〜100 */
  progress: number;
  description: string;
  members: ProjectMember[];
}

export interface Sale extends AuditFields {
  id: string;
  projectId: string;
  customerId: string;
  /** 計上日 YYYY-MM-DD */
  recordedOn: string;
  amount: number;
  note: string;
}

export interface SalesTarget {
  /** YYYY-MM */
  yearMonth: string;
  amount: number;
}

export interface AppData {
  version: number;
  customers: Customer[];
  employees: Employee[];
  projects: Project[];
  sales: Sale[];
  targets: SalesTarget[];
}
