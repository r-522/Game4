# デプロイ手順 - 魂番長

## ローカル起動手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/r-522/game4.git
cd game4

# 2. 依存関係をインストール
npm install

# 3. 環境変数を設定
cp .env.example .env.local
# .env.local を編集してSupabaseの値を設定

# 4. 開発サーバー起動
npm run dev
# → http://localhost:3000 でアクセス可能
```

## Vercel デプロイ手順

### 方法1: Vercel CLI

```bash
# Vercel CLIをインストール
npm install -g vercel

# デプロイ
vercel

# 環境変数を設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 本番デプロイ
vercel --prod
```

### 方法2: GitHub連携（推奨）

1. GitHub にコードをプッシュ
2. https://vercel.com/new にアクセス
3. GitHubリポジトリを選択
4. Environment Variables を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 「Deploy」をクリック

## CI/CD パイプライン

`.github/workflows/ci.yml` により、以下が自動実行されます：

- **push時**: TypeCheck → Test → Build
- **PR時**: 同上

## 運用マニュアル

### ゲームデータのバックアップ

Supabaseダッシュボードから定期的にエクスポート：
```
Database > Backups > Create Backup
```

### パフォーマンス監視

- Vercel Analytics を有効化推奨
- Supabase Dashboard でDBパフォーマンスを監視

### コンテンツ更新

1. `src/data/` 配下のファイルを編集
2. テストを実行: `npm test`
3. ビルド確認: `npm run build`
4. GitHubにプッシュ → Vercelが自動デプロイ
