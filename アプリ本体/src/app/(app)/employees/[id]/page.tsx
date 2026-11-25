import { EmployeeDetail } from "@/components/employees/EmployeeDetail";

export const metadata = { title: "社員詳細 | 業務管理システム" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EmployeeDetail id={id} />;
}
