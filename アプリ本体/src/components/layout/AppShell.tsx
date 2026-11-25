"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { logout, useSession } from "@/lib/session";
import { Icon } from "../icons";
import { Sidebar } from "./Sidebar";

/** ログイン必須の共通レイアウト (F-C01)。左サイドバー + メイン */
export function AppShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (session === null) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [session, router, pathname]);

  if (session === "loading" || session === null) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">読み込み中…</div>;
  }

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
        <Sidebar email={session.email} onLogout={handleLogout} />
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="h-full shadow-xl">
            <Sidebar email={session.email} onNavigate={() => setMenuOpen(false)} onLogout={handleLogout} />
          </div>
          <button type="button" aria-label="メニューを閉じる" className="flex-1 bg-ink/45" onClick={() => setMenuOpen(false)} />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
          <button type="button" aria-label="メニューを開く" onClick={() => setMenuOpen(true)} className="rounded-md p-1 text-ink hover:bg-subtle">
            <Icon name="menu" size={24} />
          </button>
          <span className="font-bold">業務管理システム</span>
        </header>
        <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
