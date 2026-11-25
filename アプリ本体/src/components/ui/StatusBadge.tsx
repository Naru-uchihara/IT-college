import type { ProjectStatus } from "@/types";

type BadgeKind = ProjectStatus | "納期間近" | "期限超過";

const colors: Record<BadgeKind, string> = {
  見積中: "bg-slate-100 text-slate-600",
  進行中: "bg-blue-100 text-blue-700",
  納品済: "bg-green-100 text-green-700",
  請求済: "bg-violet-100 text-violet-700",
  失注: "bg-red-100 text-red-700",
  納期間近: "bg-amber-100 text-amber-700",
  期限超過: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: BadgeKind }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap ${colors[status]}`}>
      {status}
    </span>
  );
}
