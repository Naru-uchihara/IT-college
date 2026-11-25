"use client";

import { useState } from "react";
import { formatYearMonth } from "@/domain/format";
import { parseAmount } from "@/domain/importers";
import { setTarget } from "@/lib/store";
import { Button } from "../ui/Button";
import { Field, TextInput } from "../ui/Field";
import { Modal } from "../ui/Modal";

/** 月ごとの目標売上の登録・編集 (F-S16) */
export function TargetDialog({ yearMonth, current, onClose }: { yearMonth: string; current: number | null; onClose: () => void }) {
  const [value, setValue] = useState(current !== null ? String(current) : "");
  const [error, setError] = useState("");

  const submit = () => {
    if (value.trim() === "") {
      setTarget(yearMonth, null);
      return onClose();
    }
    const n = parseAmount(value);
    if (n === null || n < 0) return setError("0以上の数値を入力してください");
    setTarget(yearMonth, n);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="目標売上を設定"
      sub={formatYearMonth(yearMonth)}
      footer={
        <>
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button onClick={submit}>保存</Button>
        </>
      }
    >
      <form className="flex flex-col gap-2 px-7 py-5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Field label="目標売上(円)" error={error}>
          <TextInput inputMode="numeric" autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="12000000" />
        </Field>
        <p className="text-xs text-muted">空欄で保存すると目標を削除します。</p>
      </form>
    </Modal>
  );
}
