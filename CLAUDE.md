# IT-college

ITパスポート基礎学習アプリ(ゲーミフィケーション型)。要件定義書に基づくPhase 1 MVP。

## コマンド

- `npm run dev` — 開発サーバー
- `npm run lint` — ESLint
- `npm run build` — 本番ビルド
- `npm run test` — ユニットテスト(Vitest)
- `npm run test:e2e` — E2Eテスト(Playwright、内部でbuild+startを実行)

## アーキテクチャ

- `src/types/` — 共通型定義(教材・進捗)
- `src/data/` — 静的教材データ(カリキュラム・レッスン・問題)。UIは `src/data/index.ts` のアクセサ経由でのみ参照する
- `src/domain/` — 純粋関数のドメインロジック(ステージ解放判定、復習キュー、XP、連続学習)
- `src/repositories/` — 進捗保存の抽象化。Phase 1はlocalStorage実装。Phase 2でSupabase実装へ差し替える
- `src/lib/progress-service.ts` — 進捗の読み書きを担うシングルトンサービス
- `src/hooks/use-progress.ts` — Reactから進捗を購読するフック
- `src/components/`, `src/app/` — UI。ページはthinなサーバーコンポーネント、実体はクライアントコンポーネント

## ルール

- ステージ解放: 必須問題(`isRequired: true`)をすべて一度以上正解するとクリア、次のレッスンが解放される
- 不正解の問題は自動的に復習キューへ入る(`incorrectCount > 0`)
- 進捗データはバージョン番号付きでlocalStorageへ保存。破損時は初期値へフォールバック
- 教材は独自作成のみ。書籍・問題集の転載禁止
- mainブランチへのpush、Vercel本番デプロイは明示的な承認が必要
