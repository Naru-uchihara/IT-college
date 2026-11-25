---
name: figma-design
description: このリポジトリのUIをFigma MCPで作成・更新するときの手順とルール。Figmaでの画面作成・修正を頼まれたときに使う。
---

# Figma MCP での作業ルール

## 確認について
- このリポジトリでは、Figma MCP(`mcp__Figma__*`)を使った作業の前に、毎回ユーザーへ確認を取らなくてよい(ユーザーの指示)。
- ツール実行時の許可プロンプトはこのスキルでは制御できない。プロンプトを出さないようにするには、ユーザー自身が設定(`.claude/settings.json` の `permissions.allow` に `mcp__Figma`)を追加する。

## 対象ファイル
- Figmaファイル: 「社内業務管理システム UI」 https://www.figma.com/design/BFwHzKggANCe7dPWpB2cbJ
- ページ `UI` に、左側に `Components`、右側に各画面(1440×1024)を配置している。

## デザインルール
- フォント: Noto Sans JP(Regular / Medium / Bold)
- 色: ローカル変数コレクション `Tokens` の `color/*` を使い、HEXを直書きしない
- 文字: ローカルテキストスタイル(`Heading/H1`〜`Caption/Regular`, `Display/Number`)を使う
- 部品: `Components` 内の既存コンポーネント(Sidebar, NavItem, Button, StatusBadge, StatCard, ProgressBar, SearchInput, Select, icon/*)を再利用する
- 画面の要件は `要件定義書.md` に従う
