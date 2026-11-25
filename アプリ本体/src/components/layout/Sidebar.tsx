"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "../icons";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** 完全一致で強調するか */
  exact?: boolean;
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "売上管理",
    items: [
      { href: "/sales", label: "ダッシュボード", icon: "dashboard", exact: true },
      { href: "/sales/details", label: "売上詳細", icon: "table" },
    ],
  },
  { label: "案件管理", items: [{ href: "/projects", label: "案件一覧", icon: "briefcase" }] },
  { label: "人事管理", items: [{ href: "/employees", label: "社員一覧", icon: "users" }] },
];

export function Sidebar({ email, onNavigate, onLogout }: { email: string; onNavigate?: () => void; onLogout: () => void }) {
  const pathname = usePathname();
  const isActive = (item: NavItem) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <nav aria-label="メインメニュー" className="flex h-full w-60 flex-col gap-1 bg-sidebar px-4 py-6">
      <div className="flex items-center gap-2.5 pb-6 pl-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-brand font-bold text-white">業</span>
        <span className="font-bold text-white">業務管理システム</span>
      </div>
      {groups.map((g) => (
        <div key={g.label}>
          <p className="px-3 pt-4 pb-1 text-xs text-sidebar-text">{g.label}</p>
          <ul className="flex flex-col gap-1">
            {g.items.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "bg-brand text-white" : "text-sidebar-text hover:bg-sidebar-item hover:text-white"
                    }`}
                  >
                    <Icon name={item.icon} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="flex-1" />
      <div className="border-t border-sidebar-item pt-3">
        <div className="flex items-center gap-2.5 px-3 pb-1">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-item text-sm text-white">
            {email.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 truncate text-sm text-white" title={email}>
            {email}
          </span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-text hover:bg-sidebar-item hover:text-white"
        >
          <Icon name="logout" />
          ログアウト
        </button>
      </div>
    </nav>
  );
}
