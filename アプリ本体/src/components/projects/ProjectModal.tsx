"use client";

import { useState } from "react";
import { normalizeDate } from "@/domain/dates";
import { formatDate, formatYen, todayIso } from "@/domain/format";
import { parseAmount } from "@/domain/importers";
import { clampProgress, deadlineState } from "@/domain/projects";
import { sumAmount } from "@/domain/sales";
import { addCustomer, deleteProject, saveProject, useAppData } from "@/lib/store";
import { PROJECT_STATUSES, type Project, type ProjectMember, type ProjectStatus } from "@/types";
import { Button, IconButton } from "../ui/Button";
import { ProgressBar } from "../ui/Card";
import { Field, SelectInput, TextArea, TextInput } from "../ui/Field";
import { ConfirmDialog, Modal } from "../ui/Modal";
import { StatusBadge } from "../ui/StatusBadge";

/** 案件詳細ポップアップ (S-05)。projectId が null なら新規登録 */
export function ProjectModal({ projectId, onClose }: { projectId: string | null; onClose: () => void }) {
  const data = useAppData();
  const project = projectId ? data.projects.find((p) => p.id === projectId) : undefined;
  const [mode, setMode] = useState<"view" | "edit">(projectId ? "view" : "edit");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (projectId && !project) return null;
  if (mode === "edit") {
    return <ProjectForm project={project ?? null} onCancel={() => (project ? setMode("view") : onClose())} onSaved={() => (project ? setMode("view") : onClose())} />;
  }
  const p = project!;
  const customer = data.customers.find((c) => c.id === p.customerId);
  const deadline = deadlineState(p, todayIso());
  const sales = data.sales.filter((s) => s.projectId === p.id).sort((a, b) => a.recordedOn.localeCompare(b.recordedOn));
  const members = [...p.members].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title={
          <>
            <span>{p.name}</span>
            <StatusBadge status={p.status} />
          </>
        }
        sub={customer?.name ?? "(不明な顧客)"}
        footer={
          <>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>削除</Button>
            <div className="flex-1" />
            <Button variant="secondary" onClick={onClose}>閉じる</Button>
            <Button icon="edit" onClick={() => setMode("edit")}>編集する</Button>
          </>
        }
      >
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 border-b border-border px-7 py-5 sm:grid-cols-2">
          <Info label="契約金額"><span className="font-medium tabular-nums">{formatYen(p.contractAmount)}</span></Info>
          <Info label="開始日">{formatDate(p.startDate)}</Info>
          <Info label="納期">
            <span className="font-medium">{formatDate(p.dueDate)}</span>
            {deadline === "soon" && <StatusBadge status="納期間近" />}
            {deadline === "overdue" && <StatusBadge status="期限超過" />}
          </Info>
          <Info label="進捗率"><ProgressBar value={p.progress} width="w-40" /></Info>
        </dl>
        <section className="border-b border-border px-7 py-5">
          <h3 className="mb-3 font-bold">担当者</h3>
          {members.length === 0 ? (
            <p className="text-sm text-muted">未設定</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {members.map((m) => {
                const e = data.employees.find((x) => x.id === m.employeeId);
                return (
                  <li key={m.employeeId} className={`flex items-center gap-2 rounded-full py-1 pr-3 pl-1 ${m.isPrimary ? "bg-brand-soft" : "bg-subtle"}`}>
                    <span className={`flex size-7 items-center justify-center rounded-full text-xs text-white ${m.isPrimary ? "bg-brand" : "bg-muted"}`}>
                      {e?.name.slice(0, 1) ?? "?"}
                    </span>
                    <span className="text-sm font-medium">{e?.name ?? "(削除された社員)"}</span>
                    {m.role && <span className="text-xs text-muted">{m.role}</span>}
                    {m.isPrimary && <span className="text-xs text-blue-700">主担当</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="border-b border-border px-7 py-5">
          <h3 className="mb-2 font-bold">案件詳細</h3>
          <p className="text-sm whitespace-pre-wrap">{p.description || "—"}</p>
        </section>
        <section className="px-7 py-5">
          <div className="mb-3 flex items-center">
            <h3 className="flex-1 font-bold">関連売上</h3>
            <span className="text-sm font-medium tabular-nums">合計 {formatYen(sumAmount(sales))}</span>
          </div>
          {sales.length === 0 ? (
            <p className="text-sm text-muted">まだ売上は登録されていません</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {sales.map((s) => (
                <li key={s.id} className="flex gap-4">
                  <span className="text-muted tabular-nums">{formatDate(s.recordedOn)}</span>
                  <span className="flex-1">{s.note || "—"}</span>
                  <span className="font-medium tabular-nums">{formatYen(s.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Modal>
      <ConfirmDialog
        open={confirmDelete}
        title="案件を削除しますか?"
        message={
          <>
            「{p.name}」を削除します。
            {sales.length > 0 && <>紐づく売上明細 {sales.length} 件も削除されます。</>}
          </>
        }
        onConfirm={() => {
          deleteProject(p.id);
          setConfirmDelete(false);
          onClose();
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 flex items-center gap-2 text-sm">{children}</dd>
    </div>
  );
}

const NEW_CUSTOMER = "__new__";

function ProjectForm({ project, onCancel, onSaved }: { project: Project | null; onCancel: () => void; onSaved: () => void }) {
  const data = useAppData();
  const [name, setName] = useState(project?.name ?? "");
  const [customerId, setCustomerId] = useState(project?.customerId ?? "");
  const [newCustomer, setNewCustomer] = useState("");
  const [amount, setAmount] = useState(project ? String(project.contractAmount) : "");
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "見積中");
  const [startDate, setStartDate] = useState(project?.startDate ?? "");
  const [dueDate, setDueDate] = useState(project?.dueDate ?? "");
  const [progress, setProgress] = useState(String(project?.progress ?? 0));
  const [description, setDescription] = useState(project?.description ?? "");
  const [members, setMembers] = useState<ProjectMember[]>(project?.members ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const available = data.employees.filter((e) => !members.some((m) => m.employeeId === e.id));
  const updateMember = (i: number, patch: Partial<ProjectMember>) =>
    setMembers((ms) => ms.map((m, j) => (j === i ? { ...m, ...patch } : patch.isPrimary ? { ...m, isPrimary: false } : m)));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "案件名を入力してください";
    if (!customerId || (customerId === NEW_CUSTOMER && !newCustomer.trim())) e.customer = "顧客を選択または入力してください";
    const amt = parseAmount(amount);
    if (amt === null || amt < 0) e.amount = "契約金額を数値で入力してください";
    const prog = parseAmount(progress);
    if (prog === null || prog < 0 || prog > 100) e.progress = "0〜100で入力してください";
    if (startDate && !normalizeDate(startDate)) e.startDate = "日付が正しくありません";
    if (dueDate && !normalizeDate(dueDate)) e.dueDate = "日付が正しくありません";
    if (startDate && dueDate && dueDate < startDate) e.dueDate = "納期は開始日以降にしてください";
    setErrors(e);
    if (Object.keys(e).length) return;
    const cid = customerId === NEW_CUSTOMER ? (data.customers.find((c) => c.name === newCustomer.trim())?.id ?? addCustomer(newCustomer.trim())) : customerId;
    const ms = members.length && !members.some((m) => m.isPrimary) ? members.map((m, i) => ({ ...m, isPrimary: i === 0 })) : members;
    saveProject({
      id: project?.id,
      name: name.trim(),
      customerId: cid,
      contractAmount: amt!,
      status,
      startDate: startDate || null,
      dueDate: dueDate || null,
      progress: clampProgress(prog!),
      description: description.trim(),
      members: ms,
    });
    onSaved();
  };

  return (
    <Modal
      open
      onClose={onCancel}
      title={project ? "案件を編集" : "新規案件"}
      footer={
        <>
          <div className="flex-1" />
          <Button variant="secondary" onClick={onCancel}>キャンセル</Button>
          <Button onClick={submit}>保存</Button>
        </>
      }
    >
      <form className="grid grid-cols-1 gap-4 px-7 py-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Field label="案件名" required error={errors.name} className="sm:col-span-2">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="顧客" required error={errors.customer}>
          <SelectInput value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">選択してください</option>
            {data.customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value={NEW_CUSTOMER}>+ 新しい顧客を追加</option>
          </SelectInput>
        </Field>
        {customerId === NEW_CUSTOMER ? (
          <Field label="新しい顧客名" required>
            <TextInput value={newCustomer} onChange={(e) => setNewCustomer(e.target.value)} />
          </Field>
        ) : (
          <div className="hidden sm:block" />
        )}
        <Field label="契約金額(円)" required error={errors.amount}>
          <TextInput inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="ステータス" required>
          <SelectInput value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="開始日" error={errors.startDate}>
          <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
        <Field label="納期" error={errors.dueDate}>
          <TextInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <Field label="進捗率(%)" error={errors.progress}>
          <TextInput type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(e.target.value)} />
        </Field>
        <div className="hidden sm:block" />
        <Field label="案件詳細" className="sm:col-span-2">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="mb-1 text-xs text-muted">担当者</legend>
          {members.map((m, i) => {
            const e = data.employees.find((x) => x.id === m.employeeId);
            return (
              <div key={m.employeeId} className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2">
                <span className="min-w-24 flex-1 text-sm font-medium">{e?.name ?? "(削除された社員)"}</span>
                <TextInput aria-label={`${e?.name ?? ""}の役割`} placeholder="役割(例: PM)" value={m.role} onChange={(ev) => updateMember(i, { role: ev.target.value })} className="w-36" />
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" name="primary" checked={m.isPrimary} onChange={() => updateMember(i, { isPrimary: true })} />
                  主担当
                </label>
                <IconButton icon="trash" label={`${e?.name ?? ""}を外す`} onClick={() => setMembers((ms) => ms.filter((_, j) => j !== i))} />
              </div>
            );
          })}
          {available.length > 0 && (
            <SelectInput
              aria-label="担当者を追加"
              value=""
              onChange={(e) => e.target.value && setMembers((ms) => [...ms, { employeeId: e.target.value, role: "", isPrimary: ms.length === 0 }])}
              className="sm:w-64"
            >
              <option value="">+ 担当者を追加</option>
              {available.map((e) => (
                <option key={e.id} value={e.id}>{e.name}({e.department})</option>
              ))}
            </SelectInput>
          )}
        </fieldset>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
