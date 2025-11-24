export interface INews {
  id: number;
  title: string;
  category: string;
  date: Date;
  thumbnailPath: string;
}

export interface INewsDetails {
  id: number;
  title: string;
  category: string;
  date: Date;
  thumbnailPath: string;
  detail: string;
}
