# newapp

Cloudflare Workers + Pages フルスタックテンプレート

## URL

| 種別 | URL |
|------|-----|
| Frontend | https://newapp-frontend.pages.dev |
| Backend | https://newapp-backend.wstomo53.workers.dev |

## 構成

```
newapp/
├── backend/          # Cloudflare Workers + Durable Objects
│   └── src/
│       ├── index.ts  # エントリポイント
│       └── room.ts   # WebSocket中継 (Durable Object)
├── frontend/         # Vite + TypeScript
│   └── src/
│       └── main.ts   # アプリケーション
└── .github/workflows/deploy.yml  # 自動デプロイ
```

## ローカル開発

```bash
# バックエンド (PC環境のみ)
cd backend && npm install && npm run dev

# フロントエンド (別ターミナル)
cd frontend && npm install && npm run dev
```

## デプロイ

mainブランチにpushで自動デプロイ

**必要なGitHub Secrets:**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `BACKEND_URL`

## ドキュメント

- [アーキテクチャ詳細](docs/ARCHITECTURE.md) - 構成、開発ガイド、拡張方法
