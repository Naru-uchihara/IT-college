import Papa from "papaparse";
import * as XLSX from "xlsx";

/** UTF-8 として読めなければ Shift_JIS として読む (F-I01) */
export function decodeText(buf: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf).replace(/^﻿/, "");
  } catch {
    return new TextDecoder("shift_jis").decode(buf);
  }
}

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
}

function clean(rows: Record<string, unknown>[]): Record<string, string>[] {
  return rows
    .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.trim(), v == null ? "" : String(v).trim()])))
    .filter((r) => Object.values(r).some((v) => v !== ""));
}

export async function parseImportFile(file: File): Promise<ParsedFile> {
  const buf = await file.arrayBuffer();
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const wb = XLSX.read(buf, { cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { raw: false, dateNF: "yyyy-mm-dd", defval: "" });
    const headers = (XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 })[0] ?? []).map((h) => String(h).trim());
    return { headers, rows: clean(rows) };
  }
  if (name.endsWith(".csv")) {
    const result = Papa.parse<Record<string, string>>(decodeText(buf), { header: true, skipEmptyLines: "greedy" });
    return { headers: (result.meta.fields ?? []).map((h) => h.trim()), rows: clean(result.data) };
  }
  throw new Error("対応していないファイル形式です(.csv / .xlsx)");
}
