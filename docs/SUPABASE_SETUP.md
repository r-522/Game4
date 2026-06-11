# Supabase セットアップ手順

## 1. プロジェクト作成
1. https://app.supabase.com にアクセス
2. 「New Project」をクリック
3. プロジェクト名: `tamashii-banchou` (任意)
4. リージョン: Asia/Northeast (Japan)

## 2. データベース設定

以下のSQLをSupabase SQL Editorで実行：

```sql
-- セーブデータテーブル
CREATE TABLE saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 3),
  player_data JSONB NOT NULL,
  chapter INTEGER NOT NULL DEFAULT 1,
  playtime INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slot)
);

-- ランキングテーブル
CREATE TABLE rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  level INTEGER NOT NULL,
  banchou_rank TEXT NOT NULL,
  max_combo INTEGER NOT NULL DEFAULT 0,
  playtime INTEGER NOT NULL DEFAULT 0,
  chapter INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security を有効化
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- セーブデータのRLSポリシー
CREATE POLICY "Users can manage their own saves" ON saves
  FOR ALL USING (auth.uid()::text = user_id OR user_id IS NOT NULL);

-- ランキングのRLSポリシー
CREATE POLICY "Anyone can read rankings" ON rankings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their ranking" ON rankings
  FOR INSERT WITH CHECK (true);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_saves_updated_at
  BEFORE UPDATE ON saves
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
```

## 3. 環境変数の設定

1. Supabase Dashboard > Project Settings > API
2. 以下の値を `.env.local` に設定：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Vercel への環境変数設定

Vercel Dashboard > Project > Settings > Environment Variables で上記を追加。
