-- updated_atの自動更新用トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- membersテーブル
CREATE TABLE members (
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
BEFORE UPDATE ON members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- member_tagsテーブル
CREATE TABLE member_tags (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL,
  name VARCHAR(30) NOT NULL,
  deleted_flag SMALLINT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT fk_member_tags_member_id
    FOREIGN KEY (member_id) REFERENCES members(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX idx_member_tags_member_id ON member_tags(member_id);

CREATE TRIGGER update_member_tags_updated_at
BEFORE UPDATE ON member_tags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- newsテーブル
CREATE TABLE news (
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
BEFORE UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();