-- テスト用のスキーマを作成
CREATE SCHEMA IF NOT EXISTS "test_schema";

-- updated_atの自動更新用トリガー関数（test_schema内に作成）
CREATE OR REPLACE FUNCTION "test_schema".update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- membersテーブル（test_schema内に作成）
CREATE TABLE "test_schema".members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(15) NOT NULL,
  birthday DATE NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  catch_copy VARCHAR(30) NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL,
  accent_color VARCHAR(7) NOT NULL,
  deleted_flag SMALLINT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON "test_schema".members
FOR EACH ROW
EXECUTE FUNCTION "test_schema".update_updated_at_column();

-- member_tagsテーブル（test_schema内に作成）
CREATE TABLE "test_schema".member_tags (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL,
  name VARCHAR(30) NOT NULL,
  deleted_flag SMALLINT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT fk_member_tags_member_id
    FOREIGN KEY (member_id) REFERENCES "test_schema".members(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX idx_member_tags_member_id ON "test_schema".member_tags(member_id);

CREATE TRIGGER update_member_tags_updated_at
BEFORE UPDATE ON "test_schema".member_tags
FOR EACH ROW
EXECUTE FUNCTION "test_schema".update_updated_at_column();

-- newsテーブル（test_schema内に作成）
CREATE TABLE "test_schema".news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(30) NOT NULL,
  category SMALLINT NOT NULL,
  date DATE NOT NULL,
  thumbnail_path VARCHAR(255),
  detail TEXT,
  deleted_flag SMALLINT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON "test_schema".news
FOR EACH ROW
EXECUTE FUNCTION "test_schema".update_updated_at_column();




-- 作成したスキーマにアクセスできるように設定
GRANT USAGE ON SCHEMA test_schema TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA test_schema TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA test_schema TO anon, authenticated;

-- 今後作成されるテーブルにも同じ権限を付与
ALTER DEFAULT PRIVILEGES IN SCHEMA test_schema
  GRANT ALL PRIVILEGES ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA test_schema
  GRANT ALL PRIVILEGES ON SEQUENCES TO anon, authenticated;

-- RLSを無効にする
ALTER TABLE test_schema.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_schema.member_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE test_schema.news DISABLE ROW LEVEL SECURITY;

