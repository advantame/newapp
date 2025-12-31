# newapp

Cloudflare Workers + Pages フルスタックテンプレート

## 構成

- **Backend**: Cloudflare Workers + Durable Objects (WebSocket対応)
- **Frontend**: Vite + TypeScript
- **Deploy**: GitHub Actions → Cloudflare

## ローカル開発

```bash
# バックエンド
cd backend && npm install && npm run dev

# フロントエンド (別ターミナル)
cd frontend && npm install && npm run dev
```

## デプロイ

GitHub Secretsに以下を設定:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

mainブランチにpushで自動デプロイ
