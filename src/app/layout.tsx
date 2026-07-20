import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, GraduationCap, Home, Map, RotateCcw } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "IT College - ITパスポート基礎学習",
    template: "%s | IT College",
  },
  description:
    "ITパスポートの基礎を、学習パスとクイズで少しずつ身につける学習アプリ",
};

const navItems = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/learn", label: "学習パス", icon: Map },
  { href: "/review", label: "復習", icon: RotateCcw },
  { href: "/progress", label: "学習記録", icon: BarChart3 },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-4 py-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg text-lg font-bold text-brand-strong"
            >
              <GraduationCap aria-hidden="true" className="h-6 w-6" />
              IT College
            </Link>
            <nav aria-label="メインナビゲーション">
              <ul className="flex items-center gap-1 sm:gap-2">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-brand-strong sm:flex-row sm:gap-1.5 sm:text-sm"
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          IT College - ITパスポート基礎学習アプリ(学習用オリジナル教材)
        </footer>
      </body>
    </html>
  );
}
