-- テスト用のスキーマを作成
CREATE SCHEMA IF NOT EXISTS "test-schema";

-- updated_atの自動更新用トリガー関数（test-schema内に作成）
CREATE OR REPLACE FUNCTION "test-schema".update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- membersテーブル（test-schema内に作成）
CREATE TABLE "test-schema".members (
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
BEFORE UPDATE ON "test-schema".members
FOR EACH ROW
EXECUTE FUNCTION "test-schema".update_updated_at_column();

-- member_tagsテーブル（test-schema内に作成）
CREATE TABLE "test-schema".member_tags (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL,
  name VARCHAR(30) NOT NULL,
  deleted_flag SMALLINT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT fk_member_tags_member_id
    FOREIGN KEY (member_id) REFERENCES "test-schema".members(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX idx_member_tags_member_id ON "test-schema".member_tags(member_id);

CREATE TRIGGER update_member_tags_updated_at
BEFORE UPDATE ON "test-schema".member_tags
FOR EACH ROW
EXECUTE FUNCTION "test-schema".update_updated_at_column();

-- newsテーブル（test-schema内に作成）
CREATE TABLE "test-schema".news (
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
BEFORE UPDATE ON "test-schema".news
FOR EACH ROW
EXECUTE FUNCTION "test-schema".update_updated_at_column();
