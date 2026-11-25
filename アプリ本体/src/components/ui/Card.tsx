import type { ReactNode } from "react";

export function Card({ title, actions, children, className = "" }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-border bg-surface p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {title && <h2 className="flex-1 text-lg font-bold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, sub, tone = "muted" }: { label: string; value: string; sub?: string; tone?: "muted" | "good" | "bad" }) {
  const toneClass = tone === "good" ? "text-green-700" : tone === "bad" ? "text-red-700" : "text-muted";
  return (
    <div className="min-w-0 rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 truncate text-[28px] leading-10 font-bold tabular-nums">{value}</p>
      {sub && <p className={`mt-1 text-xs ${toneClass}`}>{sub}</p>}
    </div>
  );
}

export function ProgressBar({ value, width = "w-20" }: { value: number; width?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 ${width} overflow-hidden rounded bg-subtle`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded bg-brand" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-muted tabular-nums">{value}%</span>
    </div>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl leading-9 font-bold">{title}</h1>
        {sub && <p className="text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-muted">{children}</p>;
}
