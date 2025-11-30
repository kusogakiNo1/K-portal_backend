export interface INews {
  id: number;
  title: string;
  category: number;
  date: Date;
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
