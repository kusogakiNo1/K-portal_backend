-- mysqlの認証方式を、8.0以前のものに変更
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';

-- テーブル作成(テスト用DBのため、テストデータの投入はここでは実施しない)
-- membersテーブル
CREATE TABLE members (
  id INT NOT NULL AUTO_INCREMENT,                    -- 主キー。連番で自動採番
  name VARCHAR(15) NOT NULL,                         -- メンバー名
  birthday DATE NOT NULL,                            -- 誕生日（年は画面側で非表示にする想定）
  image_path VARCHAR(255) NOT NULL,                  -- メンバー画像のパス
  catch_copy VARCHAR(30) NOT NULL,                   -- キャッチコピー
  description TEXT,                          -- メンバーの詳細説明（NULL許可）
  color VARCHAR(7) NOT NULL,                   -- メンバーカラー（カラーコード）
  accent_color VARCHAR(7) NOT NULL,                   -- メンバーカラーの色が濃くなったバージョン（カラーコード）
  deleted_flag TINYINT(1) DEFAULT 0,                 -- 削除フラグ（0 = 未削除, 1 = 削除済）
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,             -- レコード作成日時
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 更新日時
  deleted_at DATETIME NULL,                          -- 論理削除した日時（NULL = 未削除）
  PRIMARY KEY (id)                                   -- 主キー
);

-- member_tagsテーブル
CREATE TABLE member_tags (
  id INT NOT NULL AUTO_INCREMENT,                    -- タグID（主キー。AUTO_INCREMENT）
  member_id INT NOT NULL,                            -- タグの紐付き先となるメンバーID（members.id と外部キー連動）
  name VARCHAR(30) NOT NULL,                         -- タグ名
  deleted_flag TINYINT(1) DEFAULT 0,                 -- 削除フラグ（0 = 未削除）
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,             -- 作成日時
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 更新日時
  deleted_at DATETIME NULL,                          -- 削除日時（NULL = 未削除）
  PRIMARY KEY (id),                      -- 主キー
  INDEX idx_member (member_id),          -- インデックス（検索高速化）
  CONSTRAINT fk_member_tags_member_id
    FOREIGN KEY (member_id) REFERENCES members(id)   -- 外部キー制約
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- newsテーブル
CREATE TABLE news (
  id INT NOT NULL AUTO_INCREMENT,                    -- 主キー
  title VARCHAR(30) NOT NULL,                        -- お知らせタイトル
  category TINYINT(1) NOT NULL,                      -- カテゴリー（1:お知らせ, 2:イベント, 3:ニュース, 4:回答依頼）
  date DATE NOT NULL,                                -- 投稿日
  thumbnail_path VARCHAR(255),                       -- サムネイル画像のパス（1ニュース1画像想定）
  detail TEXT,                                        -- お知らせ詳細文
  deleted_flag TINYINT(1) DEFAULT 0,                 -- 削除フラグ（0 = 未削除）
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,             -- 作成日時
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 更新日時
  deleted_at DATETIME NULL,                          -- 削除日時（NULL = 未削除）

  PRIMARY KEY (id)                                   -- 主キー
);
