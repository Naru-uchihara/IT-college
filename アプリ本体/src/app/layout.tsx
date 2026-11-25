import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "業務管理システム",
  description: "売上・案件・人事を管理する社内業務管理システム",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
