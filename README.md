# IT College

ITパスポートの基礎を、Duolingo風の縦型学習パスとクイズで少しずつ身につける学習アプリ(Phase 1 MVP)。

## 特徴

- **縦型学習パス**: レッスンをステージとして順番に進む。必須問題をすべて正解するまで次のステージはロック
- **学習カード → 確認クイズ**: 短い解説を読んでから4択クイズで理解度を確認。正解・不正解の理由を必ず表示
- **誤答復習**: 間違えた問題は自動で復習キューへ。章・レッスンで絞り込んで何度でも再挑戦できる
- **XPと連続学習日数**: 学習の継続を後押しするゲーミフィケーション
- **localStorage保存**: ログイン不要。進捗はブラウザに保存され、再読み込み後も維持される

## MVP収録範囲(テクノロジ系)

| 章                  | レッスン                                                 |
| ------------------- | -------------------------------------------------------- |
| 第11章 ハードウェア | 11-01 コンピュータの種類 / 11-02 コンピュータの5つの役割 |
| 第13章 データベース | 13-01 データベースの基本 / 13-02 関係データベース        |
| 第14章 ネットワーク | 14-01 LANとWAN / 14-02 ネットワーク機器                  |

各レッスン: 学習カード4枚・独自作成の4択問題5問(うち必須問題3問)。

## 始め方

```bash
npm install
npm run dev
```

http://localhost:3000 を開く。

## コマンド

| コマンド           | 内容                                               |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | 開発サーバー起動                                   |
| `npm run build`    | 本番ビルド                                         |
| `npm run start`    | 本番サーバー起動                                   |
| `npm run lint`     | ESLint                                             |
| `npm run test`     | ユニット/コンポーネントテスト(Vitest)              |
| `npm run test:e2e` | E2Eテスト(Playwright。内部で build + start を実行) |
| `npm run format`   | Prettierで整形                                     |

## 技術構成

- Next.js (App Router) / TypeScript / Tailwind CSS
- Zod(localStorageデータの検証)/ Lucide React(アイコン)
- Vitest + React Testing Library / Playwright

## アーキテクチャ

```text
src/
├─ app/           # ページ(App Router)
├─ components/    # UIコンポーネント
├─ data/          # 静的教材データ(独自作成)
├─ domain/        # 純粋関数のドメインロジック(解放判定・復習・XP)
├─ repositories/  # 進捗保存の抽象化(Phase 2でSupabaseへ差し替え)
├─ lib/           # 進捗サービス
├─ hooks/         # Reactフック
└─ types/         # 共通型定義
```

進捗の保存は `ProgressRepository` インタフェースで抽象化されており、Phase 2ではlocalStorage実装をSupabase実装へ差し替えるだけでDB同期へ移行できる設計です(`.env.example` 参照)。

## ライセンス・教材について

学習カード・問題はすべて本アプリのために独自作成したオリジナル教材です。書籍・市販問題集の転載は含まれません。
