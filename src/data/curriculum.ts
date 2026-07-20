import type { Chapter, Course } from "@/types";

/**
 * コース・章のマスタデータ。
 * MVP ではテクノロジ系の第11章・第13章・第14章のみ教材を持つ。
 */

export const courses: Course[] = [
  {
    id: "intro",
    slug: "intro",
    title: "導入",
    description: "ITパスポート試験の概要と学習の進め方",
    order: 0,
    available: false,
  },
  {
    id: "strategy",
    slug: "strategy",
    title: "ストラテジ系",
    description: "企業活動・法務・経営戦略など(第1章〜第5章)",
    order: 1,
    available: false,
  },
  {
    id: "management",
    slug: "management",
    title: "マネジメント系",
    description: "開発技術・プロジェクトマネジメントなど(第6章〜第8章)",
    order: 2,
    available: false,
  },
  {
    id: "technology",
    slug: "technology",
    title: "テクノロジ系",
    description: "基礎理論・ハードウェア・ネットワークなど(第9章〜第15章)",
    order: 3,
    available: true,
  },
];

export const chapters: Chapter[] = [
  {
    id: "ch11",
    courseId: "technology",
    code: "11",
    title: "ハードウェア",
    order: 1,
  },
  {
    id: "ch13",
    courseId: "technology",
    code: "13",
    title: "データベース",
    order: 2,
  },
  {
    id: "ch14",
    courseId: "technology",
    code: "14",
    title: "ネットワーク",
    order: 3,
  },
];
