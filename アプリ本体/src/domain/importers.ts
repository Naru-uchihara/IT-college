import { PROJECT_STATUSES, type AppData, type ProjectStatus } from "@/types";
import { normalizeDate } from "./dates";
import { clampProgress } from "./projects";

/**
 * CSV/Excel取り込みの検証 (4.4)。
 * ファイルの読み込みは lib/file-import.ts、ここでは1行ずつの検証と変換だけを行う純粋関数。
 */

export type ImportEntity = "sales" | "projects" | "employees";

export interface ImportColumn {
  label: string;
  required: boolean;
  example: string;
  hint?: string;
}

export interface SaleImport {
  recordedOn: string;
  projectId: string;
  customerId: string;
  amount: number;
  note: string;
}

export interface ProjectImport {
  name: string;
  /** 既存顧客のID。新規顧客の場合は null */
  customerId: string | null;
  customerName: string;
  contractAmount: number;
  status: ProjectStatus;
  startDate: string | null;
  dueDate: string | null;
  progress: number;
  primaryEmployeeId: string | null;
  description: string;
}

export interface EmployeeImport {
  employeeNo: string;
  name: string;
  nameKana: string;
  department: string;
  position: string;
  hireDate: string;
  email: string;
  phone: string;
  salary: number | null;
  skills: string[];
}

export interface ImportValueMap {
  sales: SaleImport;
  projects: ProjectImport;
  employees: EmployeeImport;
}

export interface RowResult<T> {
  /** ファイル上の行番号(見出し行=1) */
  rowNumber: number;
  raw: Record<string, string>;
  value: T | null;
  errors: string[];
}

export const IMPORT_COLUMNS: Record<ImportEntity, ImportColumn[]> = {
  sales: [
    { label: "計上日", required: true, example: "2026/11/05" },
    { label: "案件名", required: true, example: "ECサイト構築", hint: "登録済みの案件名と完全一致" },
    { label: "金額", required: true, example: "2400000" },
    { label: "備考", required: false, example: "中間金" },
  ],
  projects: [
    { label: "案件名", required: true, example: "新規Webサイト構築" },
    { label: "顧客名", required: true, example: "ABC商事株式会社", hint: "未登録の顧客は新規作成" },
    { label: "契約金額", required: true, example: "5000000" },
    { label: "ステータス", required: true, example: "見積中", hint: PROJECT_STATUSES.join(" / ") },
    { label: "開始日", required: false, example: "2026/12/01" },
    { label: "納期", required: false, example: "2027/03/31" },
    { label: "進捗率", required: false, example: "0", hint: "0〜100" },
    { label: "主担当社員番号", required: false, example: "E0002" },
    { label: "案件詳細", required: false, example: "コーポレートサイトの全面リニューアル" },
  ],
  employees: [
    { label: "社員番号", required: true, example: "E0009" },
    { label: "氏名", required: true, example: "田中 一花" },
    { label: "氏名(カナ)", required: false, example: "タナカ イチカ" },
    { label: "部署", required: true, example: "開発部" },
    { label: "役職", required: false, example: "一般" },
    { label: "入社日", required: true, example: "2027/04/01" },
    { label: "メールアドレス", required: false, example: "i.tanaka@example.co.jp" },
    { label: "電話番号", required: false, example: "090-0000-0009" },
    { label: "給料(月額)", required: false, example: "250000" },
    { label: "スキル", required: false, example: "React/SQL", hint: "「/」区切り" },
  ],
};

export const IMPORT_TITLES: Record<ImportEntity, string> = {
  sales: "売上明細",
  projects: "案件",
  employees: "社員",
};

export function templateCsv(entity: ImportEntity): string {
  const cols = IMPORT_COLUMNS[entity];
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v);
  return [cols.map((c) => esc(c.label)).join(","), cols.map((c) => esc(c.example)).join(",")].join("\r\n") + "\r\n";
}

/** 「¥1,200,000」「1200000円」などを数値に。不正なら null */
export function parseAmount(input: string): number | null {
  const s = input.replace(/[¥￥,，円\s]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

function get(raw: Record<string, string>, label: string): string {
  return (raw[label] ?? "").trim();
}

function requireFields(entity: ImportEntity, raw: Record<string, string>): string[] {
  return IMPORT_COLUMNS[entity]
    .filter((c) => c.required && !get(raw, c.label))
    .map((c) => `「${c.label}」が空です`);
}

function optionalDate(raw: Record<string, string>, label: string, errors: string[]): string | null {
  const v = get(raw, label);
  if (!v) return null;
  const d = normalizeDate(v);
  if (!d) errors.push(`「${label}」の日付形式が正しくありません(例: 2026/11/05)`);
  return d;
}

function validateSale(raw: Record<string, string>, data: AppData): { value: SaleImport | null; errors: string[] } {
  const errors = requireFields("sales", raw);
  const recordedOn = optionalDate(raw, "計上日", errors);
  const amountText = get(raw, "金額");
  const amount = amountText ? parseAmount(amountText) : null;
  if (amountText && amount === null) errors.push("「金額」が数値ではありません");
  const projectName = get(raw, "案件名");
  const project = projectName ? data.projects.find((p) => p.name === projectName) : undefined;
  if (projectName && !project) errors.push(`案件「${projectName}」が見つかりません`);
  if (errors.length || !recordedOn || amount === null || !project) return { value: null, errors };
  return {
    value: { recordedOn, projectId: project.id, customerId: project.customerId, amount, note: get(raw, "備考") },
    errors,
  };
}

function validateProject(raw: Record<string, string>, data: AppData): { value: ProjectImport | null; errors: string[] } {
  const errors = requireFields("projects", raw);
  const name = get(raw, "案件名");
  const customerName = get(raw, "顧客名");
  const customer = data.customers.find((c) => c.name === customerName);
  if (name && customer && data.projects.some((p) => p.name === name && p.customerId === customer.id)) {
    errors.push("同じ顧客・案件名の案件が既に登録されています");
  }
  const amountText = get(raw, "契約金額");
  const contractAmount = amountText ? parseAmount(amountText) : null;
  if (amountText && contractAmount === null) errors.push("「契約金額」が数値ではありません");
  const statusText = get(raw, "ステータス");
  const status = PROJECT_STATUSES.find((s) => s === statusText);
  if (statusText && !status) errors.push(`「ステータス」は ${PROJECT_STATUSES.join("/")} のいずれかです`);
  const startDate = optionalDate(raw, "開始日", errors);
  const dueDate = optionalDate(raw, "納期", errors);
  const progressText = get(raw, "進捗率").replace("%", "");
  const progressNum = progressText ? parseAmount(progressText) : 0;
  if (progressNum === null || progressNum < 0 || progressNum > 100) errors.push("「進捗率」は0〜100の数値です");
  const empNo = get(raw, "主担当社員番号");
  const employee = empNo ? data.employees.find((e) => e.employeeNo === empNo) : undefined;
  if (empNo && !employee) errors.push(`社員番号「${empNo}」が見つかりません`);
  if (errors.length || contractAmount === null || !status) return { value: null, errors };
  return {
    value: {
      name,
      customerId: customer?.id ?? null,
      customerName,
      contractAmount,
      status,
      startDate,
      dueDate,
      progress: clampProgress(progressNum ?? 0),
      primaryEmployeeId: employee?.id ?? null,
      description: get(raw, "案件詳細"),
    },
    errors,
  };
}

function validateEmployee(raw: Record<string, string>, data: AppData): { value: EmployeeImport | null; errors: string[] } {
  const errors = requireFields("employees", raw);
  const employeeNo = get(raw, "社員番号");
  if (employeeNo && data.employees.some((e) => e.employeeNo === employeeNo)) {
    errors.push(`社員番号「${employeeNo}」は既に登録されています`);
  }
  const hireDate = optionalDate(raw, "入社日", errors);
  const email = get(raw, "メールアドレス");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("「メールアドレス」の形式が正しくありません");
  const salaryText = get(raw, "給料(月額)");
  const salary = salaryText ? parseAmount(salaryText) : null;
  if (salaryText && salary === null) errors.push("「給料(月額)」が数値ではありません");
  if (errors.length || !hireDate) return { value: null, errors };
  return {
    value: {
      employeeNo,
      name: get(raw, "氏名"),
      nameKana: get(raw, "氏名(カナ)"),
      department: get(raw, "部署"),
      position: get(raw, "役職"),
      hireDate,
      email,
      phone: get(raw, "電話番号"),
      salary,
      skills: get(raw, "スキル").split(/[/／]/).map((s) => s.trim()).filter(Boolean),
    },
    errors,
  };
}

const validators = {
  sales: validateSale,
  projects: validateProject,
  employees: validateEmployee,
};

/** 取り込むファイルの全行を検証する。ファイル内の重複もエラーにする */
export function validateRows<E extends ImportEntity>(
  entity: E,
  rows: Record<string, string>[],
  data: AppData,
): RowResult<ImportValueMap[E]>[] {
  const seen = new Set<string>();
  return rows.map((raw, i) => {
    const { value, errors } = validators[entity](raw, data) as { value: ImportValueMap[E] | null; errors: string[] };
    const dupKey =
      entity === "employees" ? get(raw, "社員番号") : entity === "projects" ? `${get(raw, "顧客名")}\u0000${get(raw, "案件名")}` : "";
    if (dupKey) {
      if (seen.has(dupKey)) errors.push("ファイル内で重複しています");
      seen.add(dupKey);
    }
    return { rowNumber: i + 2, raw, value: errors.length ? null : value, errors };
  });
}

/** 見出し行に必須列がそろっているか */
export function missingHeaders(entity: ImportEntity, headers: string[]): string[] {
  const set = new Set(headers.map((h) => h.trim()));
  return IMPORT_COLUMNS[entity].filter((c) => c.required && !set.has(c.label)).map((c) => c.label);
}
