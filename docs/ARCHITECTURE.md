# newapp アーキテクチャ

## URL
- Frontend: https://newapp-frontend.pages.dev
- Backend: https://newapp-backend.wstomo53.workers.dev

## 構成
```
newapp/
├── backend/                    # Cloudflare Workers
│   ├── src/
│   │   ├── index.ts           # エントリ: /, /connect?room={name}
│   │   └── room.ts            # Durable Object: WebSocket中継
│   ├── wrangler.toml          # name=newapp-backend, DO binding=ROOMS
│   └── package.json
├── frontend/                   # Cloudflare Pages (Vite)
│   ├── src/
│   │   ├── main.ts            # WebSocket接続、UI
│   │   └── vite-env.d.ts
│   ├── index.html
│   └── package.json
└── .github/workflows/deploy.yml
```

## Backend API
| パス | 説明 |
|------|------|
| `GET /` | ヘルスチェック |
| `GET /connect?room={name}` | WebSocket接続 (Upgrade必須) |

## WebSocketメッセージ
```typescript
// Server → Client
{ type: "hello", id: string }     // 接続時
{ type: "join", id: string }      // 他者入室
{ type: "leave", id: string }     // 他者退室
{ from: string, ...data }         // 中継メッセージ

// Client → Server
{ type: string, ...data }         // 任意 (fromが付与され中継)
```

## 環境変数
| 変数 | 用途 |
|------|------|
| `VITE_BACKEND_BASE` | バックエンドURL (default: http://localhost:8787) |

## GitHub Secrets
| 名前 | 用途 |
|------|------|
| `CLOUDFLARE_API_TOKEN` | API認証 |
| `CLOUDFLARE_ACCOUNT_ID` | アカウントID |
| `BACKEND_URL` | ビルド時注入 |

## ローカル開発
```bash
# Backend (PC only, Android非対応)
cd backend && npm install && npm run dev  # :8787

# Frontend
cd frontend && npm install && npm run dev  # :5173
```

## デプロイ
`git push origin main` → GitHub Actions自動実行
1. backend: `wrangler deploy`
2. frontend: `vite build` → `pages deploy`

## 拡張

### エンドポイント追加
`backend/src/index.ts`:
```typescript
if (url.pathname === "/api/xxx") {
  return new Response(JSON.stringify({...}), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
```

### 永続化
```toml
# wrangler.toml

# D1 (SQLite)
[[d1_databases]]
binding = "DB"
database_name = "mydb"
database_id = "xxx"

# KV
[[kv_namespaces]]
binding = "KV"
id = "xxx"
```

## Cloudflare無料枠
- Workers: 100,000 req/日
- Durable Objects: 1,000,000 req/月, 1GB storage
