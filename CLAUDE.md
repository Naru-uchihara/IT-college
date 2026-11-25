# IT-college

社内業務管理システム(売上管理・案件管理・人事管理)。要件は `要件定義書.md` を参照。

## Figmaデザイン

- デザインファイル: 「社内業務管理システム UI」 https://www.figma.com/design/BFwHzKggANCe7dPWpB2cbJ
  - ページ `UI` の左側に `Components`、右側に各画面(01 売上ダッシュボード / 02 売上詳細 / 03 案件一覧 / 04 案件詳細ポップアップ / 05 社員一覧 / 06 社員詳細)がある
- セッションを開始したら、最初にFigma MCPで上記ファイルを確認し、最新のデザインを把握してから作業する
- Figmaでの作業ルールは `.claude/skills/figma-design/SKILL.md` を参照

## アプリ本体

アプリのコードは `アプリ本体/` にある(Next.js App Router + TypeScript + Tailwind CSS v4)。コマンドはこのフォルダで実行する。

- `npm run dev` / `npm run build` / `npm run lint` / `npm test`(Vitest)

構成:

- `src/types/` — 共通の型(顧客・社員・案件・売上・目標)
- `src/data/seed.ts` — ダミーデータ
- `src/domain/` — 純粋関数のドメインロジック(集計、納期判定、給料、CSV取り込みの検証)。テストは `domain.test.ts`
- `src/repositories/` — データ保存の抽象化。現在は localStorage 実装。Supabase 接続時はここを差し替える
- `src/lib/store.ts` — データの読み書き。UIはこのモジュールのフック・アクション経由でのみデータを扱う
- `src/lib/session.ts` — 仮ログイン(Supabase Auth 導入まで)
- `src/components/`, `src/app/` — UI。ページは薄いサーバーコンポーネント、実体はクライアントコンポーネント
- 色・フォントは `src/app/globals.css` の `@theme` に Figma の Tokens と同じ値で定義している

## ルール

- 勝手に新しいリポジトリを作成しない。新しいリポジトリを作る必要がある場合は、作成前に必ずユーザーの許可を取る
- 給料の変更は履歴に追加し、上書きしない
- 年度は4月始まりで仮実装(要件定義書 Q-04 確定後に `src/domain/dates.ts` の `FISCAL_YEAR_START_MONTH` を見直す)
