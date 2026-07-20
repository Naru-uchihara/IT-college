import type { Metadata } from "next";
import { LearningPath } from "@/components/learning-path/learning-path";

export const metadata: Metadata = { title: "学習パス" };

export default function LearnPage() {
  return <LearningPath />;
}
