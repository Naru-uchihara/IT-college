"use client";

import { useSyncExternalStore } from "react";

/**
 * 仮のログイン状態。Supabase Auth 導入までの暫定実装で、
 * 入力されたメールアドレスを localStorage に保存するだけ(パスワードは検証しない)。
 */
export interface Session {
  email: string;
}

const KEY = "app-main:session";
const listeners = new Set<() => void>();
let cached: { raw: string | null; session: Session | null } = { raw: null, session: null };

function read(): Session | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {}
  if (raw !== cached.raw) {
    let session: Session | null = null;
    try {
      session = raw ? (JSON.parse(raw) as Session) : null;
    } catch {}
    cached = { raw, session };
  }
  return cached.session;
}

function emit() {
  listeners.forEach((l) => l());
}

export function login(email: string) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ email }));
  } catch {}
  emit();
}

export function logout() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  emit();
}

export function currentUserEmail(): string {
  return read()?.email ?? "unknown";
}

const UNKNOWN = Symbol("unknown");

/** サーバー描画・ハイドレーション中は "loading" */
export function useSession(): Session | null | "loading" {
  const v = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => UNKNOWN as unknown as Session | null,
  );
  return (v as unknown) === UNKNOWN ? "loading" : v;
}
