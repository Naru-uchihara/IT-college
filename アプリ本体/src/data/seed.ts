import type { AppData, Customer, Employee, Project, Sale, SalesTarget } from "@/types";

/**
 * ダミーデータ。Supabase接続前の開発用。
 * 内容はすべて架空のもの。
 */

export const DATA_VERSION = 1;

const audit = {
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  updatedBy: "system",
};

const customers: Customer[] = [
  { id: "c1", name: "ABC商事株式会社" },
  { id: "c2", name: "みどり物産株式会社" },
  { id: "c3", name: "東和製作所" },
  { id: "c4", name: "さくら銀行" },
  { id: "c5", name: "ひかり不動産" },
  { id: "c6", name: "青空交通" },
].map((c) => ({ ...c, ...audit }));

const employees: Employee[] = [
  {
    id: "e1", employeeNo: "E0001", name: "山田 太郎", nameKana: "ヤマダ タロウ", department: "営業部", position: "部長",
    hireDate: "2012-04-01", email: "t.yamada@example.co.jp", phone: "090-0000-0001", status: "在籍",
    skills: ["営業", "PM"], qualifications: [{ name: "中小企業診断士", acquiredOn: "2019-11-01" }],
    salaryHistory: [
      { effectiveFrom: "2012-04-01", amount: 250000, reason: "入社" },
      { effectiveFrom: "2020-04-01", amount: 520000, reason: "部長昇格" },
      { effectiveFrom: "2025-04-01", amount: 620000, reason: "定期昇給" },
    ],
  },
  {
    id: "e2", employeeNo: "E0002", name: "佐藤 花子", nameKana: "サトウ ハナコ", department: "開発部", position: "課長",
    hireDate: "2015-04-01", email: "h.sato@example.co.jp", phone: "090-0000-0002", status: "在籍",
    skills: ["React", "TypeScript", "AWS", "PM"],
    qualifications: [
      { name: "応用情報技術者試験", acquiredOn: "2016-12-01" },
      { name: "AWS Certified Solutions Architect – Associate", acquiredOn: "2021-08-01" },
      { name: "PMP", acquiredOn: "2024-03-01" },
    ],
    salaryHistory: [
      { effectiveFrom: "2015-04-01", amount: 230000, reason: "入社" },
      { effectiveFrom: "2022-04-01", amount: 390000, reason: "主任昇格" },
      { effectiveFrom: "2024-04-01", amount: 420000, reason: "定期昇給" },
      { effectiveFrom: "2026-04-01", amount: 480000, reason: "課長昇格" },
    ],
  },
  {
    id: "e3", employeeNo: "E0003", name: "鈴木 一郎", nameKana: "スズキ イチロウ", department: "開発部", position: "主任",
    hireDate: "2017-10-01", email: "i.suzuki@example.co.jp", phone: "090-0000-0003", status: "在籍",
    skills: ["Java", "SQL"], qualifications: [{ name: "基本情報技術者試験", acquiredOn: "2018-06-01" }],
    salaryHistory: [
      { effectiveFrom: "2017-10-01", amount: 240000, reason: "入社" },
      { effectiveFrom: "2023-04-01", amount: 400000, reason: "主任昇格" },
    ],
  },
  {
    id: "e4", employeeNo: "E0004", name: "高橋 美咲", nameKana: "タカハシ ミサキ", department: "デザイン部", position: "主任",
    hireDate: "2018-04-01", email: "m.takahashi@example.co.jp", phone: "090-0000-0004", status: "在籍",
    skills: ["Figma", "UI設計"], qualifications: [],
    salaryHistory: [
      { effectiveFrom: "2018-04-01", amount: 230000, reason: "入社" },
      { effectiveFrom: "2024-04-01", amount: 380000, reason: "主任昇格" },
    ],
  },
  {
    id: "e5", employeeNo: "E0005", name: "伊藤 健太", nameKana: "イトウ ケンタ", department: "開発部", position: "一般",
    hireDate: "2020-04-01", email: "k.ito@example.co.jp", phone: "090-0000-0005", status: "在籍",
    skills: ["Python", "データ分析"], qualifications: [{ name: "統計検定2級", acquiredOn: "2022-07-01" }],
    salaryHistory: [
      { effectiveFrom: "2020-04-01", amount: 230000, reason: "入社" },
      { effectiveFrom: "2025-04-01", amount: 320000, reason: "定期昇給" },
    ],
  },
  {
    id: "e6", employeeNo: "E0006", name: "渡辺 翔", nameKana: "ワタナベ ショウ", department: "開発部", position: "一般",
    hireDate: "2021-04-01", email: "s.watanabe@example.co.jp", phone: "090-0000-0006", status: "在籍",
    skills: ["セキュリティ", "Linux"], qualifications: [{ name: "情報処理安全確保支援士", acquiredOn: "2024-06-01" }],
    salaryHistory: [
      { effectiveFrom: "2021-04-01", amount: 230000, reason: "入社" },
      { effectiveFrom: "2025-04-01", amount: 300000, reason: "定期昇給" },
    ],
  },
  {
    id: "e7", employeeNo: "E0007", name: "中村 結衣", nameKana: "ナカムラ ユイ", department: "管理部", position: "課長",
    hireDate: "2016-07-01", email: "y.nakamura@example.co.jp", phone: "090-0000-0007", status: "在籍",
    skills: ["経理", "労務"], qualifications: [{ name: "日商簿記2級", acquiredOn: "2015-11-01" }],
    salaryHistory: [
      { effectiveFrom: "2016-07-01", amount: 260000, reason: "入社" },
      { effectiveFrom: "2023-04-01", amount: 450000, reason: "課長昇格" },
    ],
  },
  {
    id: "e8", employeeNo: "E0008", name: "小林 大輔", nameKana: "コバヤシ ダイスケ", department: "営業部", position: "一般",
    hireDate: "2023-04-01", email: "d.kobayashi@example.co.jp", phone: "090-0000-0008", status: "在籍",
    skills: ["営業"], qualifications: [],
    salaryHistory: [{ effectiveFrom: "2023-04-01", amount: 280000, reason: "入社" }],
  },
].map((e) => ({ ...e, ...audit }) as Employee);

const projects: Project[] = [
  {
    id: "p1", name: "基幹システム刷新 第3フェーズ", customerId: "c1", contractAmount: 38000000, status: "進行中",
    startDate: "2026-04-01", dueDate: "2027-03-31", progress: 65,
    description: "販売・購買・在庫を統合する基幹システムの刷新。第3フェーズでは会計連携と帳票を開発する。",
    members: [
      { employeeId: "e1", role: "PM", isPrimary: true },
      { employeeId: "e2", role: "開発リーダー", isPrimary: false },
      { employeeId: "e3", role: "開発", isPrimary: false },
    ],
  },
  {
    id: "p2", name: "ECサイト構築", customerId: "c2", contractAmount: 12000000, status: "進行中",
    startDate: "2026-07-01", dueDate: "2026-11-30", progress: 90,
    description: "自社ECサイトの新規構築。商品管理・決済・会員機能を含む。12月のセール開始に合わせて11月末に本番公開予定。現在は受け入れテスト中。",
    members: [
      { employeeId: "e2", role: "PM", isPrimary: true },
      { employeeId: "e5", role: "開発", isPrimary: false },
      { employeeId: "e6", role: "開発", isPrimary: false },
    ],
  },
  {
    id: "p3", name: "在庫管理アプリ開発", customerId: "c3", contractAmount: 9500000, status: "進行中",
    startDate: "2026-06-15", dueDate: "2026-11-20", progress: 85,
    description: "工場向けの在庫管理アプリ(タブレット対応)。バーコード読み取りによる入出庫登録。",
    members: [{ employeeId: "e3", role: "PM", isPrimary: true }],
  },
  {
    id: "p4", name: "セキュリティ診断", customerId: "c4", contractAmount: 2500000, status: "進行中",
    startDate: "2026-11-01", dueDate: "2026-12-02", progress: 70,
    description: "インターネットバンキング周辺システムの脆弱性診断と報告書作成。",
    members: [{ employeeId: "e6", role: "診断担当", isPrimary: true }],
  },
  {
    id: "p5", name: "データ分析基盤構築", customerId: "c2", contractAmount: 15400000, status: "進行中",
    startDate: "2026-09-01", dueDate: "2027-02-28", progress: 30,
    description: "販売データを集約するデータ分析基盤とダッシュボードの構築。",
    members: [{ employeeId: "e5", role: "開発リーダー", isPrimary: true }],
  },
  {
    id: "p6", name: "社内ポータル改修", customerId: "c4", contractAmount: 6800000, status: "納品済",
    startDate: "2026-05-01", dueDate: "2026-10-31", progress: 100,
    description: "行員向け社内ポータルのデザイン刷新とスマートフォン対応。",
    members: [{ employeeId: "e4", role: "デザイン", isPrimary: true }],
  },
  {
    id: "p7", name: "採用サイトリニューアル", customerId: "c5", contractAmount: 3600000, status: "請求済",
    startDate: "2026-08-01", dueDate: "2026-11-15", progress: 100,
    description: "新卒・中途採用サイトのリニューアル。",
    members: [
      { employeeId: "e2", role: "PM", isPrimary: true },
      { employeeId: "e4", role: "デザイン", isPrimary: false },
    ],
  },
  {
    id: "p8", name: "モバイルアプリ開発", customerId: "c6", contractAmount: 18000000, status: "見積中",
    startDate: "2027-01-10", dueDate: "2027-06-30", progress: 0,
    description: "乗車券購入・運行情報アプリの新規開発。見積提出済み。",
    members: [
      { employeeId: "e1", role: "営業", isPrimary: true },
      { employeeId: "e8", role: "営業", isPrimary: false },
    ],
  },
  {
    id: "p9", name: "業務RPA導入", customerId: "c3", contractAmount: 4200000, status: "失注",
    startDate: null, dueDate: null, progress: 0,
    description: "経理業務のRPA化。他社に決定。",
    members: [{ employeeId: "e3", role: "提案", isPrimary: true }],
  },
  {
    id: "p10", name: "旧基幹システム保守", customerId: "c1", contractAmount: 30000000, status: "請求済",
    startDate: "2024-04-01", dueDate: "2026-03-31", progress: 100,
    description: "刷新前の基幹システムの運用保守(2年契約)。",
    members: [{ employeeId: "e3", role: "保守リーダー", isPrimary: true }],
  },
  {
    id: "p11", name: "コールセンター業務改善", customerId: "c4", contractAmount: 14000000, status: "請求済",
    startDate: "2024-10-01", dueDate: "2025-09-30", progress: 100,
    description: "問い合わせ管理システムの導入と業務フローの見直し。",
    members: [{ employeeId: "e1", role: "PM", isPrimary: true }],
  },
  {
    id: "p12", name: "物流管理システム導入", customerId: "c3", contractAmount: 18000000, status: "請求済",
    startDate: "2025-01-15", dueDate: "2025-12-20", progress: 100,
    description: "倉庫間の物流管理システムの導入。",
    members: [{ employeeId: "e3", role: "PM", isPrimary: true }],
  },
  {
    id: "p13", name: "会員アプリ保守", customerId: "c2", contractAmount: 9600000, status: "請求済",
    startDate: "2025-04-01", dueDate: "2026-06-30", progress: 100,
    description: "会員向けスマートフォンアプリの運用保守。",
    members: [{ employeeId: "e5", role: "保守", isPrimary: true }],
  },
].map((p) => ({ ...p, ...audit }) as Project);

/** 月別売上合計(万円)。2024-12 〜 2026-11 */
const MONTHLY_TOTALS_MAN: Record<string, number> = {
  "2024-12": 900, "2025-01": 940, "2025-02": 820, "2025-03": 1010, "2025-04": 960, "2025-05": 1050,
  "2025-06": 1020, "2025-07": 1100, "2025-08": 1080, "2025-09": 1150, "2025-10": 1120, "2025-11": 1110,
  "2025-12": 980, "2026-01": 1020, "2026-02": 870, "2026-03": 1150, "2026-04": 1080, "2026-05": 1210,
  "2026-06": 1130, "2026-07": 1290, "2026-08": 1180, "2026-09": 1340, "2026-10": 1260,
};

const projectCustomer = Object.fromEntries(projects.map((p) => [p.id, p.customerId]));

/** その月に契約期間がかかっている案件 */
function activeProjectsIn(ym: string): Project[] {
  return projects.filter((p) => p.startDate && p.dueDate && p.startDate.slice(0, 7) <= ym && p.dueDate.slice(0, 7) >= ym);
}

function generatedSales(): Sale[] {
  const out: Sale[] = [];
  Object.entries(MONTHLY_TOTALS_MAN).forEach(([ym, man], i) => {
    const active = activeProjectsIn(ym);
    const total = man * 10000;
    const a = Math.round((total * 0.5) / 10000) * 10000;
    const b = Math.round((total * 0.3) / 10000) * 10000;
    const parts = [a, b, total - a - b];
    parts.forEach((amount, j) => {
      const projectId = active[(i + j) % active.length].id;
      out.push({
        id: `s-${ym}-${j + 1}`,
        projectId,
        customerId: projectCustomer[projectId],
        recordedOn: `${ym}-${String(10 + j * 8).padStart(2, "0")}`,
        amount,
        note: j === 0 ? "月次請求" : "",
        ...audit,
      });
    });
  });
  return out;
}

const november2026: Sale[] = [
  ["2026-11-05", "p1", 3200000, "月次請求"],
  ["2026-11-08", "p2", 2400000, "中間金"],
  ["2026-11-10", "p3", 1850000, ""],
  ["2026-11-12", "p6", 980000, "保守費 11月分"],
  ["2026-11-15", "p1", 650000, ""],
  ["2026-11-18", "p7", 1200000, "納品完了"],
  ["2026-11-20", "p5", 1100000, ""],
  ["2026-11-25", "p3", 600000, "追加見積分"],
  ["2026-11-28", "p4", 500000, ""],
].map(([recordedOn, projectId, amount, note], i) => ({
  id: `s-2026-11-${i + 1}`,
  projectId: projectId as string,
  customerId: projectCustomer[projectId as string],
  recordedOn: recordedOn as string,
  amount: amount as number,
  note: note as string,
  ...audit,
}));

/** 2026年度(4月始まり)の月別目標 */
const targets: SalesTarget[] = [
  ["2026-04", 10500000], ["2026-05", 10800000], ["2026-06", 11000000], ["2026-07", 11200000],
  ["2026-08", 11300000], ["2026-09", 11500000], ["2026-10", 11800000], ["2026-11", 12000000],
  ["2026-12", 11400000], ["2027-01", 11000000], ["2027-02", 11200000], ["2027-03", 11600000],
].map(([yearMonth, amount]) => ({ yearMonth: yearMonth as string, amount: amount as number }));

export function createSeedData(): AppData {
  return structuredClone({
    version: DATA_VERSION,
    customers,
    employees,
    projects,
    sales: [...generatedSales(), ...november2026],
    targets,
  });
}
