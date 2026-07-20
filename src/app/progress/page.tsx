import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/progress/progress-dashboard";

export const metadata: Metadata = { title: "学習記録" };

export default function ProgressPage() {
  return <ProgressDashboard />;
}
