export interface INews {
  id: number;
  title: string;
  category: number;
  date: Date;
  thumbnailPath: string;
}

/**
 * レスポンス用のニュースインターフェース（日付が文字列型）
 */
export interface INewsResponse {
  id: number;
  title: string;
  category: number;
  date: string; // YYYY-MM-DD形式の文字列
  thumbnailPath: string;
}

export interface INewsDetails {
  id: number;
  title: string;
  category: number;
  date: Date;
  thumbnailPath: string;
  detail: string;
}
