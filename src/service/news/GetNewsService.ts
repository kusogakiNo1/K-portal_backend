import { NewsRepository } from "../../repository/NewsRepository";
import { INews } from "../../types/INews";
import { GetNewsValidation } from "../../validation/news/GetNewsValidation";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

interface NewsResponse {
  totalcount: number;
  count: number;
  news: INews[];
}

export class GetNewsService {
  private newsRepository = new NewsRepository();

  async validate(params: object): Promise<any> {
    const validation = plainToInstance(GetNewsValidation, params);
    const validationErrors = validate(validation);
    // バリデーション結果と、バリデーション通過後のパラメータを返す
    return { validationErrors, params };
  }

  async getNews(
    category?: number,
    limit?: number,
    offset?: number
  ): Promise<NewsResponse> {
    // Newsテーブルからデータを取得（categoryの指定がある場合は、categoryで絞る）
    const newsResults = await this.newsRepository.getNews(
      category,
      limit,
      offset
    );
    // 総件数を取得
    const newsCounts = await this.newsRepository.countNews(category);
    return {
      totalcount: Number(newsCounts),
      count: newsResults.length,
      news: newsResults,
    };
  }
}
