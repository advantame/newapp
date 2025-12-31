# 関数の本質 - 高校数学ビジュアル学習

数学が苦手な高校生のための、関数を「本質から理解する」インタラクティブ演習サイト

## コンセプト

> 「中国語の部屋」からの脱却 - 解法暗記ではなく、体感で理解する

- 数式を"見る"のではなく"触る"体験
- パラメータを変化させてグラフの変化を観察
- 段階的に抽象度を上げていく多階層設計

## URL

| 種別 | URL |
|------|-----|
| Frontend | https://newapp-frontend.pages.dev |
| Backend | https://newapp-backend.wstomo53.workers.dev |

## 機能

### Level 0: グラフ生成（レーザー刻印）
- xを変化させると点が打たれ、グラフが生成される様子を視覚化
- 「関数 = 入力に対して出力が決まる」を体感
- 一次・二次・三次・三角関数を選択可能

### Level 2: 二次関数パラメータ
- y = a(x - p)² + q の各パラメータをスライダーで操作
- a: 開き具合、p: 横移動、q: 縦移動の役割を分離して理解
- 頂点座標と軸をリアルタイム表示

### Level 3: 単位円と三角関数
- 単位円上の点が回転し、sin/cosが生まれる様子を視覚化
- 円の回転と正弦波が同期するアニメーション
- 特殊角（30°, 45°, 60°など）をワンクリックで確認

## 構成

```
newapp/
├── backend/                    # Cloudflare Workers
│   └── src/
│       ├── index.ts           # APIエントリ
│       └── room.ts            # WebSocket（将来の拡張用）
├── frontend/                   # Vite + TypeScript
│   ├── src/
│   │   ├── main.ts            # エントリポイント
│   │   ├── styles/
│   │   │   └── global.css     # ダークモードスタイル
│   │   ├── components/
│   │   │   └── Canvas.ts      # グラフ描画基盤
│   │   └── visualizers/
│   │       ├── LaserGraph.ts      # レーザー刻印グラフ
│   │       ├── QuadraticParam.ts  # 二次関数パラメータ
│   │       └── UnitCircle.ts      # 単位円アニメーション
│   └── index.html
└── .github/workflows/deploy.yml
```

## ローカル開発

```bash
# フロントエンド
cd frontend && npm install && npm run dev

# バックエンド (PC環境のみ)
cd backend && npm install && npm run dev
```

## デプロイ

mainブランチにpushで自動デプロイ

**必要なGitHub Secrets:**
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `BACKEND_URL`

## 技術スタック

- **Frontend**: Vite + TypeScript + Canvas API
- **Backend**: Cloudflare Workers + Durable Objects
- **Hosting**: Cloudflare Pages / Workers

## ロードマップ

- [x] Phase 1: コアビジュアライザー
  - [x] レーザー刻印グラフ
  - [x] 二次関数パラメータスライダー
  - [x] 単位円アニメーション
- [ ] Phase 2: コンテンツ拡充
  - [ ] 平方完成アニメーション
  - [ ] 判別式ビジュアライザ
  - [ ] 三角関数の波形パラメータ
- [ ] Phase 3: 融合問題
  - [ ] 三角関数×二次関数の融合
  - [ ] 進捗保存システム

## ドキュメント

- [アーキテクチャ詳細](docs/ARCHITECTURE.md)
