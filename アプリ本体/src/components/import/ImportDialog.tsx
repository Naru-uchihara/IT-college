"use client";

import { useState } from "react";
import {
  IMPORT_COLUMNS,
  IMPORT_TITLES,
  missingHeaders,
  templateCsv,
  validateRows,
  type EmployeeImport,
  type ImportEntity,
  type ProjectImport,
  type RowResult,
  type SaleImport,
} from "@/domain/importers";
import { downloadText } from "@/lib/download";
import { getData, importEmployees, importProjects, importSales } from "@/lib/store";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

type AnyRow = RowResult<SaleImport | ProjectImport | EmployeeImport>;

/** CSV/Excel 一括取り込み (4.4)。テンプレート → ファイル選択 → プレビュー → 登録 */
export function ImportDialog({ entity, open, onClose }: { entity: ImportEntity; open: boolean; onClose: () => void }) {
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<AnyRow[] | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<number | null>(null);
  const title = IMPORT_TITLES[entity];
  const columns = IMPORT_COLUMNS[entity];

  const reset = () => {
    setFileName("");
    setRows(null);
    setError("");
    setDone(null);
  };
  const close = () => {
    reset();
    onClose();
  };

  const onFile = async (file: File | undefined) => {
    reset();
    if (!file) return;
    setFileName(file.name);
    try {
      // CSV/Excel のパーサーは取り込み時にだけ読み込む
      const { parseImportFile } = await import("@/lib/file-import");
      const parsed = await parseImportFile(file);
      const missing = missingHeaders(entity, parsed.headers);
      if (missing.length) {
        setError(`必須の列がありません: ${missing.join("、")}。テンプレートの見出し行を使ってください。`);
        return;
      }
      if (parsed.rows.length === 0) {
        setError("データ行がありません。");
        return;
      }
      setRows(validateRows(entity, parsed.rows, getData()) as AnyRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ファイルを読み込めませんでした。");
    }
  };

  const valid = rows?.filter((r) => r.value) ?? [];
  const invalidCount = (rows?.length ?? 0) - valid.length;

  const commit = () => {
    const values = valid.map((r) => r.value);
    if (entity === "sales") importSales(values as SaleImport[]);
    if (entity === "projects") importProjects(values as ProjectImport[]);
    if (entity === "employees") importEmployees(values as EmployeeImport[]);
    setDone(values.length);
    setRows(null);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title={`${title}のCSV/Excel取り込み`}
      sub="対応形式: .csv(UTF-8 / Shift_JIS)、.xlsx"
      footer={
        <>
          <Button variant="secondary" icon="download" onClick={() => downloadText(`${title}_テンプレート.csv`, templateCsv(entity))}>
            テンプレートをダウンロード
          </Button>
          <div className="flex-1" />
          <Button variant="secondary" onClick={close}>
            {done !== null ? "閉じる" : "キャンセル"}
          </Button>
          {rows && (
            <Button onClick={commit} disabled={valid.length === 0}>
              エラーのない {valid.length} 件を登録
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4 px-7 py-5">
        <div className="rounded-lg bg-subtle p-4 text-xs text-muted">
          <p className="mb-1 font-medium text-ink">列(1行目は見出し)</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {columns.map((c) => (
              <li key={c.label}>
                {c.label}
                {c.required && <span className="text-red-600">*</span>}
                {c.hint && <span>({c.hint})</span>}
              </li>
            ))}
          </ul>
        </div>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-6 text-sm text-muted hover:border-brand">
          <span className="font-medium text-ink">{fileName || "ファイルを選択"}</span>
          <span>クリックして .csv / .xlsx を選択</span>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="sr-only"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {done !== null && <p role="status" className="text-sm text-green-700">{done} 件を登録しました。</p>}
        {rows && (
          <>
            <p className="text-sm">
              全 {rows.length} 件中、登録できる行 <span className="font-bold text-green-700">{valid.length} 件</span>
              {invalidCount > 0 && (
                <>
                  、エラー <span className="font-bold text-red-700">{invalidCount} 件</span>(エラーの行は登録されません)
                </>
              )}
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-subtle text-xs text-muted">
                  <tr>
                    <th className="px-3 py-2 whitespace-nowrap">行</th>
                    <th className="px-3 py-2 whitespace-nowrap">結果</th>
                    {columns.map((c) => (
                      <th key={c.label} className="px-3 py-2 whitespace-nowrap">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.rowNumber} className={`border-t border-border ${r.errors.length ? "bg-red-50" : ""}`}>
                      <td className="px-3 py-2 text-muted tabular-nums">{r.rowNumber}</td>
                      <td className="px-3 py-2">
                        {r.errors.length ? (
                          <ul className="min-w-48 text-xs text-red-700">
                            {r.errors.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs whitespace-nowrap text-green-700">OK</span>
                        )}
                      </td>
                      {columns.map((c) => (
                        <td key={c.label} className="px-3 py-2 whitespace-nowrap">{r.raw[c.label]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
