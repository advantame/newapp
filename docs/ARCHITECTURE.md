# システムアーキテクチャ

## 全体構成

```
┌────────────────────────────────────────────────────────────────┐
│                       Cloudflare Edge                          │
│                                                                │
│  ┌───────────────────────┐    ┌─────────────────────────────┐  │
│  │   Cloudflare Pages    │    │   Cloudflare Workers        │  │
│  │                       │    │                             │  │
│  │  newapp-frontend      │    │  newapp-backend             │  │
│  │  .pages.dev           │    │  .wstomo53.workers.dev      │  │
│  │                       │    │                             │  │
│  │  - index.html         │    │  ┌───────────────────────┐  │  │
│  │  - main.js (build)    │    │  │   Durable Object      │  │  │
│  └───────────────────────┘    │  │   (Room)              │  │  │
│           │                   │  │                       │  │  │
│           │ 静的配信          │  │  - WebSocket管理       │  │  │
│           ▼                   │  │  - メッセージ中継      │  │  │
│      ┌─────────┐              │  └───────────────────────┘  │  │
│      │ Browser │◄─WebSocket──►│                             │  │
│      └─────────┘              └─────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## ディレクトリ構成

```
newapp/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
│
├── backend/                    # Cloudflare Workers
│   ├── src/
│   │   ├── index.ts           # Worker エントリポイント
│   │   └── room.ts            # Durable Object (WebSocket中継)
│   ├── wrangler.toml          # Cloudflare設定
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                   # Cloudflare Pages
│   ├── src/
│   │   ├── main.ts            # アプリケーションコード
│   │   └── vite-env.d.ts      # Vite型定義
│   ├── index.html             # HTMLエントリ
│   ├── vite.config.ts         # Viteビルド設定
│   ├── tsconfig.json
│   └── package.json
│
├── docs/
│   └── ARCHITECTURE.md        # 本ドキュメント
│
├── .gitignore
└── README.md
```

## コンポーネント詳細

### Frontend (Cloudflare Pages)

| 項目 | 値 |
|------|-----|
| URL | https://newapp-frontend.pages.dev |
| フレームワーク | Vite + TypeScript |
| ビルド出力 | `frontend/dist/` |

**ファイル構成:**

| ファイル | 責務 |
|---------|------|
| `index.html` | HTMLエントリ、スタイル定義 |
| `src/main.ts` | WebSocket接続、UI制御 |
| `src/vite-env.d.ts` | 環境変数の型定義 |

**環境変数:**

| 変数 | 用途 | デフォルト |
|------|------|-----------|
| `VITE_BACKEND_BASE` | バックエンドURL | `http://localhost:8787` |

### Backend (Cloudflare Workers)

| 項目 | 値 |
|------|-----|
| URL | https://newapp-backend.wstomo53.workers.dev |
| エントリ | `src/index.ts` |

**エンドポイント:**

| パス | メソッド | 説明 |
|------|---------|------|
| `/` | GET | ヘルスチェック |
| `/connect?room={name}` | GET (Upgrade) | WebSocket接続 |

### Durable Object (Room)

| 項目 | 値 |
|------|-----|
| クラス名 | `Room` |
| ファイル | `src/room.ts` |
| バインディング名 | `ROOMS` |

**責務:**
- ルームごとのWebSocket接続管理
- クライアントへのID割り当て
- メッセージの全クライアントへのブロードキャスト
- 入退室通知

**メッセージ形式:**

```typescript
// サーバー → クライアント
{ type: "hello", id: string }        // 接続時、自分のID
{ type: "join", id: string }         // 他ユーザー入室
{ type: "leave", id: string }        // 他ユーザー退室
{ from: string, ...data }            // 他ユーザーからのメッセージ

// クライアント → サーバー
{ type: string, ...data }            // 任意のメッセージ（fromが付与されて中継）
```

## デプロイフロー

```
git push (main)
      │
      ▼
┌─────────────────────────────────────────┐
│         GitHub Actions                   │
│                                         │
│  1. deploy-backend                      │
│     ├─ npm install                      │
│     └─ wrangler deploy                  │
│              │                          │
│              ▼                          │
│  2. deploy-frontend (depends on 1)      │
│     ├─ npm install                      │
│     ├─ npm run build                    │
│     │   (BACKEND_URL Secret を注入)      │
│     ├─ pages project create (初回のみ)  │
│     └─ pages deploy                     │
│                                         │
└─────────────────────────────────────────┘
      │
      ▼
┌───────────────────┐  ┌───────────────────┐
│ Workers deployed  │  │ Pages deployed    │
│ newapp-backend    │  │ newapp-frontend   │
└───────────────────┘  └───────────────────┘
```

## GitHub Secrets

| 名前 | 用途 |
|------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API認証 |
| `CLOUDFLARE_ACCOUNT_ID` | アカウント識別 |
| `BACKEND_URL` | フロントエンドビルド時に注入するバックエンドURL |

## ローカル開発

### PC環境 (Linux/Mac/Windows)

```bash
# ターミナル1: バックエンド
cd backend
npm install
npm run dev
# → http://localhost:8787

# ターミナル2: フロントエンド
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Termux/Android環境

`wrangler` (workerd) がAndroid非対応のため、ローカルでバックエンドは動きません。

**開発フロー:**
1. コード編集
2. `git push` でデプロイ
3. 本番URLで確認

**フロントエンドのみローカル確認:**
```bash
cd frontend
npm install
npm run dev
# バックエンドは本番URLを使用
```

## Cloudflare設定

### wrangler.toml

```toml
name = "newapp-backend"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[durable_objects]
bindings = [
  { name = "ROOMS", class_name = "Room" }
]

[[migrations]]
tag = "v1"
new_sqlite_classes = ["Room"]  # 無料プラン必須
```

### 無料プランの制限

| リソース | 制限 |
|---------|------|
| Workers リクエスト | 100,000/日 |
| Durable Objects リクエスト | 1,000,000/月 |
| Durable Objects ストレージ | 1 GB |
| WebSocket接続 | 制限なし (タイムアウトあり) |

## 拡張ガイド

### 新しいエンドポイントを追加

`backend/src/index.ts` を編集:

```typescript
if (url.pathname === "/api/hello") {
  return new Response(JSON.stringify({ message: "Hello!" }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
  });
}
```

### 永続化が必要な場合

**オプション1: Durable Object内SQLite**
```typescript
// room.ts内で
this.ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS ...");
```

**オプション2: D1 (外部SQLite)**
```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "mydb"
database_id = "xxx"
```

**オプション3: KV (キーバリュー)**
```toml
# wrangler.toml
[[kv_namespaces]]
binding = "KV"
id = "xxx"
```

### フロントエンドにライブラリ追加

```bash
cd frontend
npm install <package>
```

Viteが自動でバンドルします。

## トラブルシューティング

| 症状 | 原因 | 対処 |
|------|------|------|
| WebSocket接続失敗 | BACKEND_URL設定ミス | GitHub Secrets確認 |
| デプロイ失敗 (new_sqlite_classes) | 無料プラン制限 | wrangler.tomlにmigrations追加 |
| Pages project not found | 初回デプロイ | workflowの `pages project create` が実行される |
| ローカルでbackend動かない | Android非対応 | PC環境を使用するか本番でテスト |

## 関連リンク

- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Durable Objects ドキュメント](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Vite ドキュメント](https://vitejs.dev/)
