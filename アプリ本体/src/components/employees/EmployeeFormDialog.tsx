"use client";

import { useState } from "react";
import { normalizeDate } from "@/domain/dates";
import { todayIso } from "@/domain/format";
import { parseAmount } from "@/domain/importers";
import { saveEmployee, useAppData } from "@/lib/store";
import { EMPLOYEE_STATUSES, type Employee, type EmployeeStatus } from "@/types";
import { Button } from "../ui/Button";
import { Field, SelectInput, TextInput } from "../ui/Field";
import { Modal } from "../ui/Modal";

/** 社員の登録・基本情報の編集 */
export function EmployeeFormDialog({ employee, onClose, onSaved }: { employee: Employee | null; onClose: () => void; onSaved?: (id: string) => void }) {
  const data = useAppData();
  const [f, setF] = useState({
    employeeNo: employee?.employeeNo ?? "",
    name: employee?.name ?? "",
    nameKana: employee?.nameKana ?? "",
    department: employee?.department ?? "",
    position: employee?.position ?? "",
    hireDate: employee?.hireDate ?? todayIso(),
    email: employee?.email ?? "",
    phone: employee?.phone ?? "",
    status: employee?.status ?? ("在籍" as EmployeeStatus),
    salary: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  const departments = [...new Set(data.employees.map((e) => e.department))];
  const positions = [...new Set(data.employees.map((e) => e.position))];

  const submit = () => {
    const e: Record<string, string> = {};
    if (!f.employeeNo.trim()) e.employeeNo = "社員番号を入力してください";
    else if (data.employees.some((x) => x.employeeNo === f.employeeNo.trim() && x.id !== employee?.id)) e.employeeNo = "この社員番号は既に使われています";
    if (!f.name.trim()) e.name = "氏名を入力してください";
    if (!f.department.trim()) e.department = "部署を入力してください";
    if (!normalizeDate(f.hireDate)) e.hireDate = "入社日を入力してください";
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "メールアドレスの形式が正しくありません";
    const salary = f.salary ? parseAmount(f.salary) : null;
    if (f.salary && (salary === null || salary < 0)) e.salary = "数値で入力してください";
    setErrors(e);
    if (Object.keys(e).length) return;
    const id = saveEmployee({
      id: employee?.id,
      employeeNo: f.employeeNo.trim(),
      name: f.name.trim(),
      nameKana: f.nameKana.trim(),
      department: f.department.trim(),
      position: f.position.trim(),
      hireDate: f.hireDate,
      email: f.email.trim(),
      phone: f.phone.trim(),
      status: f.status,
      skills: employee?.skills ?? [],
      qualifications: employee?.qualifications ?? [],
      salaryHistory: employee?.salaryHistory ?? (salary !== null ? [{ effectiveFrom: f.hireDate, amount: salary, reason: "入社" }] : []),
    });
    onSaved?.(id);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={employee ? "基本情報を編集" : "社員を登録"}
      footer={
        <>
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose}>キャンセル</Button>
          <Button onClick={submit}>保存</Button>
        </>
      }
    >
      <form className="grid grid-cols-1 gap-4 px-7 py-5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Field label="社員番号" required error={errors.employeeNo}><TextInput value={f.employeeNo} onChange={set("employeeNo")} /></Field>
        <Field label="在籍状況">
          <SelectInput value={f.status} onChange={set("status")}>
            {EMPLOYEE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectInput>
        </Field>
        <Field label="氏名" required error={errors.name}><TextInput value={f.name} onChange={set("name")} /></Field>
        <Field label="氏名(カナ)"><TextInput value={f.nameKana} onChange={set("nameKana")} /></Field>
        <Field label="部署" required error={errors.department}>
          <TextInput list="departments" value={f.department} onChange={set("department")} />
        </Field>
        <Field label="役職">
          <TextInput list="positions" value={f.position} onChange={set("position")} />
        </Field>
        <Field label="入社日" required error={errors.hireDate}><TextInput type="date" value={f.hireDate} onChange={set("hireDate")} /></Field>
        <Field label="電話番号"><TextInput type="tel" value={f.phone} onChange={set("phone")} /></Field>
        <Field label="メールアドレス" error={errors.email} className="sm:col-span-2"><TextInput type="email" value={f.email} onChange={set("email")} /></Field>
        {!employee && (
          <Field label="給料(月額・円)" error={errors.salary}><TextInput inputMode="numeric" value={f.salary} onChange={set("salary")} /></Field>
        )}
        <datalist id="departments">{departments.map((d) => <option key={d} value={d} />)}</datalist>
        <datalist id="positions">{positions.map((d) => <option key={d} value={d} />)}</datalist>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
