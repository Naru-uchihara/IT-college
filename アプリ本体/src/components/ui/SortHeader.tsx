"use client";

export type SortDir = "asc" | "desc";

/** クリックで並び替えできる見出しセル (F-S13 / F-P03) */
export function SortHeader<K extends string>({
  label,
  sortKey,
  current,
  dir,
  onSort,
  align = "left",
  className = "",
}: {
  label: string;
  sortKey: K;
  current: K;
  dir: SortDir;
  onSort: (key: K) => void;
  align?: "left" | "right";
  className?: string;
}) {
  const active = current === sortKey;
  return (
    <th
      scope="col"
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-4 py-3 font-normal whitespace-nowrap ${align === "right" ? "text-right" : ""} ${className}`}
    >
      <button type="button" onClick={() => onSort(sortKey)} className={`inline-flex items-center gap-1 hover:text-ink ${active ? "text-ink" : ""}`}>
        {label}
        <span aria-hidden="true" className="text-[10px]">{active ? (dir === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

export function useSortToggle<K extends string>(current: K, dir: SortDir, set: (k: K, d: SortDir) => void) {
  return (key: K) => set(key, current === key && dir === "asc" ? "desc" : "asc");
}
