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

  /**
   * 2つの数値を加算します。
   * @param params バリデーション確認したいパラメータ
   * @returns validationErrors(バリデーションエラー)、params(バリデーション通過後のパラメータ)
   */
  async validate(params: object): Promise<any> {
    const validation = plainToInstance(GetNewsValidation, params);
    const validationErrors = await validate(validation);
    // バリデーション結果と、バリデーション通過後のパラメータを返す
    return { validationErrors, params };
  }

  /**
   * お知らせ情報を取得
   * @param category お知らせのカテゴリー
   * @param limit
   * @param offset
   * @returns お知らせ情報
   */
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
    // limitで件数を絞らなかった場合の、総件数を取得
    const newsCounts = await this.newsRepository.countNews(category);
    return {
      totalcount: Number(newsCounts),
      count: newsResults.length,
      news: newsResults,
    };
  }
}
