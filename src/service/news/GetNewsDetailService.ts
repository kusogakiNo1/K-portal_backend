import { NewsRepository } from "../../repository/NewsRepository";
import { GetNewsDetailValidation } from "../../validation/news/GetNewsDetailValidation";
import { DateUtils } from "../../util/DateUtils";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { HttpError } from "../../error/HttpError";
import { HttpStatus } from "../../constants/HttpStatus";

interface NewsDetailAPIResponse {
  id: number;
  title: string;
  category: number;
  date: string; // YYYY-MM-DD形式の文字列
  thumbnailPath: string;
  detail: string;
}

export class GetNewsDetailService {
  private newsRepository = new NewsRepository();

  /**
   * パラメータのバリデーションを実行します。
   * @param params バリデーション確認したいパラメータ
   * @returns validationErrors(バリデーションエラー)
   */
  async validate(params: object): Promise<any> {
    const validation = plainToInstance(GetNewsDetailValidation, params);
    return await validate(validation);
  }

  /**
   * お知らせ情報を取得
   * @param category お知らせのカテゴリー
   * @param limit
   * @param offset
   * @returns お知らせ情報
   */
  async getNewsDetail(id: string): Promise<NewsDetailAPIResponse> {
    // Newsテーブルからデータを取得（categoryの指定がある場合は、categoryで絞る）
    const newsDetail = await this.newsRepository.getNewsDetail(id);

    // 指定したidのお知らせが存在しない場合は、404エラーをスロー
    if (!newsDetail) {
      throw new HttpError(
        HttpStatus.NOT_FOUND.code,
        HttpStatus.NOT_FOUND.message,
        "指定したIDのお知らせが見つかりませんでした"
      );
    }

    // 日付を文字列形式に変換
    const formattedNewsDetail: NewsDetailAPIResponse = {
      ...newsDetail,
      date: DateUtils.formatToDateString(newsDetail.date),
    };

    return formattedNewsDetail;
  }
}
