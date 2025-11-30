import { NewsRepository } from "../../repository/NewsRepository";
import { INews, INewsResponse } from "../../types/INews";
import { GetNewsValidation } from "../../validation/news/GetNewsValidation";
import { DateUtils } from "../../util/DateUtils";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

interface NewsAPIResponse {
  totalcount: number;
  count: number;
  news: INewsResponse[];
}

export class GetNewsService {
  private newsRepository = new NewsRepository();

  /**
   * パラメータのバリデーションを実行します。
   * @param params バリデーション確認したいパラメータ
   * @returns validationErrors(バリデーションエラー)
   */
  async validate(params: object): Promise<any> {
    const validation = plainToInstance(GetNewsValidation, params);
    return await validate(validation);
  }

  /**
   * お知らせ情報を取得
   * @param category お知らせのカテゴリー
   * @param limit
   * @param offset
   * @returns お知らせ情報
   */
  async getNews(
    category?: string,
    limit?: string,
    offset?: string
  ): Promise<NewsAPIResponse> {
    // Newsテーブルからデータを取得（categoryの指定がある場合は、categoryで絞る）
    const newsResults = await this.newsRepository.getNews(
      category,
      limit,
      offset
    );
    // limitで件数を絞らなかった場合の、総件数を取得
    const newsCounts = await this.newsRepository.countNews(category);

    // 日付を文字列形式に変換
    const formattedNews: INewsResponse[] = newsResults.map((news) => ({
      ...news,
      date: DateUtils.formatToDateString(news.date),
    }));

    return {
      totalcount: Number(newsCounts),
      count: formattedNews.length,
      news: formattedNews,
    };
  }
}
