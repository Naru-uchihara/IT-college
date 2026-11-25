import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "ログイン | 業務管理システム" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
