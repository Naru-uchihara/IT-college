"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeDate } from "@/domain/dates";
import { currentSalary, projectsOfEmployee, sortedSalaryHistory, yearsOfService } from "@/domain/employees";
import { formatDate, formatYen, todayIso } from "@/domain/format";
import { parseAmount } from "@/domain/importers";
import { addSalaryRecord, deleteEmployee, saveEmployee, useAppData } from "@/lib/store";
import type { Employee, Qualification } from "@/types";
import { Icon } from "../icons";
import { ProjectModal } from "../projects/ProjectModal";
import { EmployeeFormDialog } from "./EmployeeFormDialog";
import { Button, IconButton } from "../ui/Button";
import { Card, EmptyState } from "../ui/Card";
import { Field, TextInput } from "../ui/Field";
import { ConfirmDialog, Modal } from "../ui/Modal";
import { StatusBadge } from "../ui/StatusBadge";

export function EmployeeDetail({ id }: { id: string }) {
  const data = useAppData();
  const router = useRouter();
  const today = todayIso();
  const [dialog, setDialog] = useState<"edit" | "salary" | "skills" | "delete" | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const employee = data.employees.find((e) => e.id === id);

  if (!employee) {
    return (
      <div className="flex flex-col items-start gap-4">
        <BackLink />
        <EmptyState>社員が見つかりません。削除された可能性があります。</EmptyState>
      </div>
    );
  }
  const e = employee;
  const salary = currentSalary(e.salaryHistory, today);
  const history = sortedSalaryHistory(e.salaryHistory);
  const projects = projectsOfEmployee(data.projects, e.id);
  const customerName = (cid: string) => data.customers.find((c) => c.id === cid)?.name ?? "";

  return (
    <>
      <BackLink />
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl leading-9 font-bold">{e.name}</h1>
          <p className="text-sm text-muted">{[e.department, e.position].filter(Boolean).join(" / ")}</p>
        </div>
        <Button variant="danger" onClick={() => setDialog("delete")}>削除</Button>
        <Button icon="edit" onClick={() => setDialog("edit")}>基本情報を編集</Button>
      </div>

      <div className="flex flex-col items-start gap-5 xl:flex-row">
        <section className="w-full rounded-xl border border-border bg-surface p-6 xl:w-[340px] xl:shrink-0" aria-label="基本情報">
          <div className="flex flex-col items-center gap-2 border-b border-border pb-4">
            <span className="flex size-[72px] items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">{e.name.slice(0, 1)}</span>
            <p className="text-lg font-bold">{e.name}</p>
            <p className="text-xs text-muted">{e.nameKana}</p>
            <span className={`rounded-md px-2.5 py-1 text-sm ${e.status === "在籍" ? "bg-green-100 text-green-700" : "bg-subtle text-slate-600"}`}>{e.status}</span>
          </div>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            {[
              ["社員番号", e.employeeNo],
              ["部署", e.department],
              ["役職", e.position || "—"],
              ["入社日", `${formatDate(e.hireDate)}(勤続${yearsOfService(e.hireDate, today)}年)`],
              ["メールアドレス", e.email || "—"],
              ["電話番号", e.phone || "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="break-all">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted">最終更新: {new Date(e.updatedAt).toLocaleString("ja-JP")}({e.updatedBy})</p>
        </section>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
          <Card
            title="給料"
            actions={
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted">現在の給料(月額)</p>
                  <p className="text-[28px] leading-10 font-bold tabular-nums">{salary ? formatYen(salary.amount) : "—"}</p>
                </div>
                <Button variant="secondary" icon="plus" onClick={() => setDialog("salary")}>給料を変更</Button>
              </div>
            }
          >
            {history.length === 0 ? (
              <EmptyState>給料が登録されていません</EmptyState>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-border">
                    <th scope="col" className="py-2.5 font-normal">適用開始日</th>
                    <th scope="col" className="py-2.5 font-normal">金額(月額)</th>
                    <th scope="col" className="py-2.5 font-normal">変更理由</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={`${h.effectiveFrom}-${i}`} className="border-b border-border last:border-0">
                      <td className="py-2.5 text-muted tabular-nums">{formatDate(h.effectiveFrom)}</td>
                      <td className="py-2.5 font-medium tabular-nums">{formatYen(h.amount)}</td>
                      <td className="py-2.5">{h.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card title="スキル・資格" actions={<Button variant="secondary" icon="edit" onClick={() => setDialog("skills")}>編集</Button>}>
            <div className="flex flex-wrap gap-2">
              {e.skills.length ? (
                e.skills.map((s) => <span key={s} className="rounded-md bg-brand-soft px-2.5 py-1 text-sm text-blue-700">{s}</span>)
              ) : (
                <p className="text-sm text-muted">スキル未登録</p>
              )}
            </div>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {e.qualifications.map((q) => (
                <li key={q.name} className="flex gap-4">
                  <span className="flex-1">{q.name}</span>
                  <span className="text-xs text-muted">{q.acquiredOn ? `${q.acquiredOn.slice(0, 7).replace("-", "/")} 取得` : ""}</span>
                </li>
              ))}
              {e.qualifications.length === 0 && <li className="text-muted">資格未登録</li>}
            </ul>
          </Card>

          <Card title={`参加案件(${projects.length}件)`}>
            {projects.length === 0 ? (
              <EmptyState>参加している案件はありません</EmptyState>
            ) : (
              <ul>
                {projects.map(({ project, member }) => (
                  <li key={project.id} className="border-b border-border last:border-0">
                    <button type="button" onClick={() => setProjectId(project.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 py-3 text-left hover:bg-subtle">
                      <span className="min-w-40 flex-1">
                        <span className="font-medium text-blue-700">{project.name}</span>
                        <span className="ml-2 text-xs text-muted">{customerName(project.customerId)}</span>
                      </span>
                      <span className="text-xs text-muted">{member.isPrimary ? "主担当" : "メンバー"}{member.role && `・${member.role}`}</span>
                      <StatusBadge status={project.status} />
                      <span className="text-sm text-muted tabular-nums">納期 {formatDate(project.dueDate)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {dialog === "edit" && <EmployeeFormDialog employee={e} onClose={() => setDialog(null)} />}
      {dialog === "salary" && <SalaryDialog employee={e} onClose={() => setDialog(null)} />}
      {dialog === "skills" && <SkillsDialog employee={e} onClose={() => setDialog(null)} />}
      {projectId && <ProjectModal projectId={projectId} onClose={() => setProjectId(null)} />}
      <ConfirmDialog
        open={dialog === "delete"}
        title="社員を削除しますか?"
        message={<>「{e.name}」を削除します。担当している案件からも外れます。退職者は削除せず在籍状況を「退職」にすることもできます。</>}
        onConfirm={() => {
          deleteEmployee(e.id);
          router.replace("/employees");
        }}
        onCancel={() => setDialog(null)}
      />
    </>
  );
}


function BackLink() {
  return (
    <Link href="/employees" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
      <Icon name="arrowLeft" size={16} />
      社員一覧
    </Link>
  );
}

/** 給料変更。履歴に1行追加する */
function SalaryDialog({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const [effectiveFrom, setEffectiveFrom] = useState(todayIso());
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!normalizeDate(effectiveFrom)) e.effectiveFrom = "適用開始日を入力してください";
    const n = parseAmount(amount);
    if (n === null || n < 0) e.amount = "金額を数値で入力してください";
    setErrors(e);
    if (Object.keys(e).length) return;
    addSalaryRecord(employee.id, { effectiveFrom, amount: n!, reason: reason.trim() });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="給料を変更"
      sub={`${employee.name} ・ 変更内容は履歴に追加されます`}
      footer={
        <>
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button onClick={submit}>追加</Button>
        </>
      }
    >
      <form className="flex flex-col gap-4 px-7 py-5" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Field label="適用開始日" required error={errors.effectiveFrom}><TextInput type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} /></Field>
        <Field label="金額(月額・円)" required error={errors.amount}><TextInput inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        <Field label="変更理由"><TextInput value={reason} onChange={(e) => setReason(e.target.value)} placeholder="定期昇給" /></Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}

function SkillsDialog({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const [skills, setSkills] = useState<string[]>(employee.skills);
  const [skillInput, setSkillInput] = useState("");
  const [quals, setQuals] = useState<Qualification[]>(employee.qualifications);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  };
  const save = () => {
    const { id, ...rest } = employee;
    saveEmployee({ ...rest, id, skills, qualifications: quals.filter((q) => q.name.trim()).map((q) => ({ ...q, name: q.name.trim() })) });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="スキル・資格を編集"
      footer={
        <>
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button onClick={save}>保存</Button>
        </>
      }
    >
      <div className="flex flex-col gap-6 px-7 py-5">
        <div>
          <p className="mb-2 text-xs text-muted">スキル</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-md bg-brand-soft py-0.5 pr-1 pl-2.5 text-sm text-blue-700">
                {s}
                <button type="button" aria-label={`${s}を削除`} onClick={() => setSkills(skills.filter((x) => x !== s))} className="rounded p-0.5 hover:bg-blue-100">
                  <Icon name="close" size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <TextInput
              aria-label="追加するスキル"
              placeholder="例: React"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button variant="secondary" onClick={addSkill}>追加</Button>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted">資格</p>
          <div className="flex flex-col gap-2">
            {quals.map((q, i) => (
              <div key={i} className="flex items-center gap-2">
                <TextInput aria-label="資格名" placeholder="資格名" value={q.name} onChange={(e) => setQuals(quals.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <TextInput aria-label="取得日" type="date" value={q.acquiredOn} onChange={(e) => setQuals(quals.map((x, j) => (j === i ? { ...x, acquiredOn: e.target.value } : x)))} className="w-44" />
                <IconButton icon="trash" label="資格を削除" onClick={() => setQuals(quals.filter((_, j) => j !== i))} />
              </div>
            ))}
            <Button variant="secondary" icon="plus" className="self-start" onClick={() => setQuals([...quals, { name: "", acquiredOn: "" }])}>資格を追加</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
