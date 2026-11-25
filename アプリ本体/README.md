# アプリ本体(社内業務管理システム)

売上管理・案件管理・人事管理のWebアプリ。仕様は [`要件定義書.md`](要件定義書.md)、デザインは [Figma「社内業務管理システム UI」](https://www.figma.com/design/BFwHzKggANCe7dPWpB2cbJ) を参照。

## 起動

```bash
npm install
npm run dev
```

http://localhost:3000 を開き、任意のメールアドレスとパスワードでログインする(開発用の仮ログイン)。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLint |
| `npm test` | ユニットテスト(Vitest) |

## 現在の状態

- データはダミーデータ(`src/data/seed.ts`)で、変更はブラウザの localStorage に保存される。Supabase は未接続
- 初期データに戻すには、ブラウザの開発者ツールで localStorage の `app-main:data` を削除する
- 年度は4月始まりとして実装(要件定義書 Q-04 が未確定のため)
