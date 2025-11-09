-- -- mysqlの認証方式を、8.0以前のものに変更
-- ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';

-- ローカル環境→ローカル環境コンテナ内のmysqlにログインしようとする際、外部ネットワークからのログインとみなされてしまいログインできない
-- 上記の事象を避けるため、外部ネットワークのユーザーにも'k-portal' データベースの全ての権限を付与する
GRANT ALL PRIVILEGES ON `k-portal`.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON `k-portal`.* TO 'user'@'%';
-- 権限の変更を即座に反映させる
FLUSH PRIVILEGES;

-- テーブル作成＆初期データ投入
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
INSERT INTO members (name, birthday, image_path, catch_copy, description, color, accent_color)
VALUES
('布河原 よしかず', '2020-07-07', '../images/members/nunogawara/card.png', '苦粗餓鬼の始祖', '当初は沼坂さんが描いた江崎の似顔絵に過ぎなかったが、謎の求心力によって「布河原よしかず」という別の存在と化した。まだまだ謎多き存在ではあるが、こいつが居なければ今の俺たちは存在しなかった、そう断言してもいいだろう。', '#3B82F6', '#1E40AF'),
('江崎 貴博', '1999-07-25', '../images/members/ezaki/card.png', 'Battle Spirits', '超高級宿泊施設「天竺」のオーナー。困難に立ち向かう意志（Battle Spirits）を武器に、医者として数多の患者を救っている。あだ名をつけられすぎて、本当の自分を見失いそうになっている。', '#10B981', '#047857'),
('沼坂 啜', '1999-08-17', '../images/members/numasaka/card.png', 'むりょうの生みの親', '昼はしごでき営業マン、そして夜は一之江のエンターテイナー。彼が生み出した流行語は数知れず、今日も自慢の体力で湯水のようにお金を使ってイクー。', '#F59E0B', '#D97706'),
('徳永', '1999-08-28', '../images/members/tokugonagaru/card.png', 'デスヴォイス', '天下の名門、京都大学卒業（一浪一留）。イカした頭脳と痺れるデスヴォイスで、今日も数多の女性（通称：トクゴナgirl）を沼らせ中。飴と鞭の超絶テクは、時にメンバーにも及ぶ。', '#EC4899', '#BE185D'),
('郷良', '1999-05-03', '../images/members/gora/card.png', '笑いのニューウェーブ', '2025年年始に突如参画したかと思えば、あれよあれよという間に大活躍した超新星。組織のローション、じゃなかった潤滑油として、苦粗餓鬼を新たな次元に導くのは彼かもしれない。', '#EF4444', '#DC2626');

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
INSERT INTO member_tags (member_id, name)
VALUES
(1, 'よしかず（ガチ）'),
(1, 'みんな知っててみんなよく知らない'),
(2, 'よしかず'),
(2, 'かっちゃん'),
(2, 'ゼアキ皇子様'),
(2, '姫路の田中圭'),
(2, '蛭子能収の隠し子'),
(2, '日赤王子'),
(2, '生涯年収'),
(2, '世宇子中'),
(2, 'よしうん太'),
(2, 'ザッキー杯参加者募集中'),
(3, '沼坂さん'),
(3, '営業成績一位'),
(3, 'むりょう'),
(3, 'お⚪︎⚪︎⚪︎'),
(3, '乙尼慰'),
(3, 'JK'),
(3, '石窟寺院'),
(3, 'チンチンカイカイ'),
(3, '啜屋麺助'),
(3, '吉原ラメント'),
(4, 'トクゴナガル'),
(4, 'デスヴォイス'),
(4, '噯気（ゲップ）'),
(4, 'メンズコーチ顔'),
(4, 'やれっつってんだろ'),
(4, '松葉崩し'),
(4, '飴と鞭'),
(4, '罪と罰'),
(4, '縦型動画の才能ある'),
(5, 'ゴゥラ'),
(5, 'ゴリラ'),
(5, '強羅温泉'),
(5, '大久保が産んだ奇才'),
(5, 'JA'),
(5, '次男坊');

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
INSERT INTO news (title, category, date, thumbnail_path, detail)
VALUES
('ローカル環境準備完了', 1, '2025-11-08', '../images/thumbnail/notification1.png', 'ローカル環境の準備が整いました！さあ、あなたも開発者になって、K-portalを盛り上げていきましょう！'),
('クソガキグランプリ開催', 2, '2026-01-01', '../images/thumbnail/event1.png', '新年明けましておめでとうございます！今年も、何卒よろしくお願いいたします。...さて、早速ですが、クソガキグランプリの開催が決定したので、お知らせします。日時：2026年8月30日　場所：ららぽーと豊洲　内容：ピザの踊り食い　皆様のご参加お待ちしております。'),
('沼坂さん活動休止', 3, '2026-03-01', '../images/thumbnail/news1.png', '沼坂さんが、年内で活動休止されるとのことです。今のうちに、遊んでおきましょう！'),
('【アンケート】好きな手すり', 4, '2026-12-13', '../images/thumbnail/survey.png', 'この度、皆様の意識調査も兼ねて、好きな手すりをお伺いしたいと考えています。つきましては、以下の回答フォームからご回答お願いいたします。');
