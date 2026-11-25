"use client";

import { useState } from "react";
import { normalizeDate } from "@/domain/dates";
import { parseAmount } from "@/domain/importers";
import { saveSale, useAppData } from "@/lib/store";
import type { Sale } from "@/types";
import { Button } from "../ui/Button";
import { Field, SelectInput, TextInput } from "../ui/Field";
import { Modal } from "../ui/Modal";

/** 売上明細の登録・編集 (F-S14) */
export function SaleFormDialog({ sale, defaultDate, onClose }: { sale: Sale | null; defaultDate: string; onClose: () => void }) {
  const data = useAppData();
  const [recordedOn, setRecordedOn] = useState(sale?.recordedOn ?? defaultDate);
  const [projectId, setProjectId] = useState(sale?.projectId ?? "");
  const [amount, setAmount] = useState(sale ? String(sale.amount) : "");
  const [note, setNote] = useState(sale?.note ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const customerOf = (pid: string) => {
    const p = data.projects.find((x) => x.id === pid);
    return data.customers.find((c) => c.id === p?.customerId)?.name ?? "—";
  };

  const submit = () => {
    const e: Record<string, string> = {};
    if (!normalizeDate(recordedOn)) e.recordedOn = "計上日を入力してください";
    if (!projectId) e.projectId = "案件を選択してください";
    const n = parseAmount(amount);
    if (n === null) e.amount = "金額を数値で入力してください";
    setErrors(e);
    if (Object.keys(e).length) return;
    saveSale({ id: sale?.id, recordedOn: normalizeDate(recordedOn)!, projectId, amount: n!, note: note.trim() });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={sale ? "売上明細を編集" : "売上を登録"}
      footer={
        <>
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button onClick={submit}>保存</Button>
        </>
      }
    >
      <form className="flex flex-col gap-4 px-7 py-5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Field label="計上日" required error={errors.recordedOn}>
          <TextInput type="date" value={recordedOn} onChange={(e) => setRecordedOn(e.target.value)} />
        </Field>
        <Field label="案件" required error={errors.projectId}>
          <SelectInput value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">選択してください</option>
            {data.projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </SelectInput>
        </Field>
        <p className="-mt-2 text-xs text-muted">顧客: {projectId ? customerOf(projectId) : "—"}</p>
        <Field label="金額(円)" required error={errors.amount}>
          <TextInput inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="2400000" />
        </Field>
        <Field label="備考">
          <TextInput value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
