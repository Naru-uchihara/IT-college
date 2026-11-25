"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { login } from "@/lib/session";
import { Button } from "./ui/Button";
import { Field, TextInput } from "./ui/Field";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("メールアドレスの形式が正しくありません");
    if (!password) return setError("パスワードを入力してください");
    login(email);
    const next = params.get("next");
    router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/sales");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8" noValidate>
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand font-bold text-white">業</span>
          <h1 className="text-lg font-bold">業務管理システム</h1>
        </div>
        <div className="flex flex-col gap-4">
          <Field label="メールアドレス">
            <TextInput type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="パスワード">
            <TextInput type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <Button type="submit" className="mt-2 w-full">
            ログイン
          </Button>
          <p className="text-xs text-muted">※ 開発用の仮ログインです。任意のメールアドレスとパスワードでログインできます。</p>
        </div>
      </form>
    </div>
  );
}
