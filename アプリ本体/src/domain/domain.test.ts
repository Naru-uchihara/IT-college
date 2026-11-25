import { describe, expect, it } from "vitest";
import { createSeedData } from "@/data/seed";
import type { Project, Sale } from "@/types";
import { addMonths, daysBetween, fiscalYearMonths, fiscalYearOf, monthsEndingAt, normalizeDate } from "./dates";
import { currentSalary, projectsOfEmployee, yearsOfService } from "./employees";
import { formatDate, formatPercent, formatSignedPercent, formatYen } from "./format";
import { missingHeaders, parseAmount, templateCsv, validateRows } from "./importers";
import { deadlineState, filterProjects, sortProjects } from "./projects";
import { achievementRate, breakdown, fiscalYearTarget, fiscalYearToDate, monthlySeries, totalForMonth, yoyRate } from "./sales";

const sale = (recordedOn: string, amount: number, projectId = "p1", customerId = "c1"): Sale => ({
  id: recordedOn + amount, projectId, customerId, recordedOn, amount, note: "",
  createdAt: "", updatedAt: "", updatedBy: "",
});

describe("format", () => {
  it("formats yen with commas", () => {
    expect(formatYen(12480000)).toBe("¥12,480,000");
    expect(formatYen(-500)).toBe("-¥500");
  });
  it("formats dates and percents", () => {
    expect(formatDate("2026-11-05")).toBe("2026/11/05");
    expect(formatDate(null)).toBe("—");
    expect(formatPercent(1.04)).toBe("104.0%");
    expect(formatSignedPercent(0.124)).toBe("+12.4%");
    expect(formatPercent(null)).toBe("—");
  });
});

describe("dates", () => {
  it("adds months across years", () => {
    expect(addMonths("2026-11", 2)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(monthsEndingAt("2026-02", 3)).toEqual(["2025-12", "2026-01", "2026-02"]);
  });
  it("handles April fiscal year", () => {
    expect(fiscalYearOf("2026-03")).toBe(2025);
    expect(fiscalYearOf("2026-04")).toBe(2026);
    expect(fiscalYearMonths(2026)[0]).toBe("2026-04");
    expect(fiscalYearMonths(2026)[11]).toBe("2027-03");
  });
  it("normalizes and validates dates", () => {
    expect(normalizeDate("2026/1/5")).toBe("2026-01-05");
    expect(normalizeDate("2026-02-30")).toBeNull();
    expect(normalizeDate("abc")).toBeNull();
    expect(daysBetween("2026-11-25", "2026-12-02")).toBe(7);
  });
});

describe("sales", () => {
  const sales = [sale("2025-11-10", 100), sale("2026-11-01", 150), sale("2026-11-20", 50, "p2", "c2"), sale("2026-04-01", 300)];
  it("sums by month and compares to previous year", () => {
    expect(totalForMonth(sales, "2026-11")).toBe(200);
    expect(monthlySeries(sales, ["2026-11"])).toEqual([{ ym: "2026-11", current: 200, previousYear: 100 }]);
    expect(yoyRate(200, 100)).toBe(1);
    expect(yoyRate(200, 0)).toBeNull();
  });
  it("computes achievement and fiscal year to date", () => {
    expect(achievementRate(120, 100)).toBeCloseTo(1.2);
    expect(achievementRate(120, null)).toBeNull();
    expect(fiscalYearToDate(sales, "2026-11")).toBe(500);
    expect(fiscalYearTarget([{ yearMonth: "2026-04", amount: 10 }, { yearMonth: "2027-03", amount: 5 }, { yearMonth: "2027-04", amount: 99 }], 2026)).toBe(15);
  });
  it("groups breakdown with others bucket", () => {
    const many = ["a", "b", "c", "d", "e", "f"].map((p, i) => sale("2026-11-01", (i + 1) * 10, p));
    const result = breakdown(many, (s) => s.projectId, (id) => id.toUpperCase(), 3);
    expect(result.map((r) => r.name)).toEqual(["F", "E", "その他"]);
    expect(result[2].amount).toBe(10 + 20 + 30 + 40);
  });
  it("seed sales are not recorded before the project starts", () => {
    const d = createSeedData();
    for (const s of d.sales) {
      const p = d.projects.find((x) => x.id === s.projectId)!;
      expect(p.startDate!.slice(0, 7) <= s.recordedOn.slice(0, 7)).toBe(true);
    }
  });
  it("seed data matches the design's November total", () => {
    const d = createSeedData();
    expect(totalForMonth(d.sales, "2026-11")).toBe(12480000);
    expect(totalForMonth(d.sales, "2025-11")).toBe(11100000);
    expect(fiscalYearTarget(d.targets, 2026)).toBe(135300000);
  });
});

describe("projects", () => {
  const base = { status: "進行中" as const };
  it("detects overdue and soon deadlines for active projects only", () => {
    expect(deadlineState({ ...base, dueDate: "2026-11-20" }, "2026-11-25")).toBe("overdue");
    expect(deadlineState({ ...base, dueDate: "2026-12-02" }, "2026-11-25")).toBe("soon");
    expect(deadlineState({ ...base, dueDate: "2026-12-03" }, "2026-11-25")).toBeNull();
    expect(deadlineState({ status: "納品済", dueDate: "2026-11-20" }, "2026-11-25")).toBeNull();
    expect(deadlineState({ ...base, dueDate: null }, "2026-11-25")).toBeNull();
  });
  it("filters and sorts", () => {
    const { projects } = createSeedData();
    expect(filterProjects(projects, { query: "ec", status: "", employeeId: "", customerId: "" }).map((p) => p.id)).toEqual(["p2"]);
    expect(filterProjects(projects, { query: "", status: "", employeeId: "e6", customerId: "" }).map((p) => p.id).sort()).toEqual(["p2", "p4"]);
    const sorted = sortProjects(projects, "dueDate", "asc");
    expect(sorted[0].id).toBe("p11");
    expect(sorted.at(-1)?.dueDate).toBeNull();
    expect(sortProjects(projects, "contractAmount", "desc")[0].id).toBe("p1");
  });
});

describe("employees", () => {
  it("picks the salary effective today", () => {
    const h = [
      { effectiveFrom: "2015-04-01", amount: 1, reason: "" },
      { effectiveFrom: "2026-04-01", amount: 3, reason: "" },
      { effectiveFrom: "2027-04-01", amount: 9, reason: "" },
    ];
    expect(currentSalary(h, "2026-11-25")?.amount).toBe(3);
    expect(currentSalary(h, "2010-01-01")).toBeNull();
  });
  it("counts years of service and projects", () => {
    expect(yearsOfService("2015-04-01", "2026-11-25")).toBe(11);
    expect(yearsOfService("2015-12-01", "2026-11-25")).toBe(10);
    const { projects } = createSeedData();
    expect(projectsOfEmployee(projects as Project[], "e2").map((x) => x.project.id)).toEqual(["p1", "p2", "p7"]);
  });
});

describe("importers", () => {
  const data = createSeedData();
  it("parses amounts", () => {
    expect(parseAmount("¥1,200,000")).toBe(1200000);
    expect(parseAmount("500円")).toBe(500);
    expect(parseAmount("abc")).toBeNull();
  });
  it("validates sales rows", () => {
    const rows = validateRows("sales", [
      { 計上日: "2026/12/01", 案件名: "ECサイト構築", 金額: "1,000", 備考: "" },
      { 計上日: "2026/13/01", 案件名: "存在しない案件", 金額: "x" },
    ], data);
    expect(rows[0].value).toMatchObject({ recordedOn: "2026-12-01", projectId: "p2", customerId: "c2", amount: 1000 });
    expect(rows[1].value).toBeNull();
    expect(rows[1].errors).toHaveLength(3);
    expect(rows[1].rowNumber).toBe(3);
  });
  it("validates employees including duplicates", () => {
    const rows = validateRows("employees", [
      { 社員番号: "E0001", 氏名: "重複", 部署: "営業部", 入社日: "2026/04/01" },
      { 社員番号: "E0100", 氏名: "新人", 部署: "開発部", 入社日: "2027/04/01", スキル: "React/SQL", "給料(月額)": "250000" },
      { 社員番号: "E0100", 氏名: "新人2", 部署: "開発部", 入社日: "2027/04/01" },
    ], data);
    expect(rows[0].errors[0]).toContain("既に登録");
    expect(rows[1].value).toMatchObject({ skills: ["React", "SQL"], salary: 250000 });
    expect(rows[2].errors).toContain("ファイル内で重複しています");
  });
  it("validates projects and allows new customers", () => {
    const rows = validateRows("projects", [
      { 案件名: "新案件", 顧客名: "新しい会社", 契約金額: "100", ステータス: "見積中", 主担当社員番号: "E0002" },
      { 案件名: "ECサイト構築", 顧客名: "みどり物産株式会社", 契約金額: "100", ステータス: "進行中" },
      { 案件名: "x", 顧客名: "y", 契約金額: "1", ステータス: "完了", 進捗率: "120" },
    ], data);
    expect(rows[0].value).toMatchObject({ customerId: null, customerName: "新しい会社", primaryEmployeeId: "e2" });
    expect(rows[1].errors[0]).toContain("既に登録");
    expect(rows[2].errors).toHaveLength(2);
  });
  it("produces templates and checks headers", () => {
    expect(templateCsv("sales").split("\r\n")[0]).toBe("計上日,案件名,金額,備考");
    expect(missingHeaders("sales", ["計上日", "金額"])).toEqual(["案件名"]);
  });
});
