import { AppDataSource } from "../AppDataSource";
import { News } from "../entity/News";
import { INews, INewsDetails } from "../types/INews";

export class NewsRepository {
  private news = AppDataSource.getRepository(News);

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
  ): Promise<INews[]> {
    const qb = this.news
      .createQueryBuilder("news")
      .select("news.id", "id")
      .addSelect("news.title", "title")
      .addSelect("news.category", "category")
      .addSelect("news.date", "date")
      .addSelect("news.thumbnail_path", "thumbnailPath");

    // categoryが指定されている場合は、categoryで絞り込み
    if (category) {
      qb.andWhere("category = :category", { category: Number(category) });
    }
    // 日付の降順でソート
    qb.orderBy("date", "DESC");
    // limit（指定がない場合は、デフォルト値を指定）
    const limitNum = limit ? Number(limit) : 15;
    const offsetNum = offset ? Number(offset) : 0;
    qb.limit(limitNum).offset(offsetNum);
    return qb.getRawMany();
  }

  /**
   * お知らせ情報の総件数を取得
   * @param category お知らせのカテゴリー
   * @returns お知らせ情報の総件数
   */
  async countNews(category?: string): Promise<number> {
    const qb = this.news
      .createQueryBuilder("news")
      .select("COUNT(*)", "totalCount");
    // categoryが指定されている場合は、categoryで絞り込み
    if (category) {
      qb.andWhere("category = :category", { category: Number(category) });
    }

    const result = await qb.getRawOne();
    return Number(result.totalCount);
  }

  /**
   * お知らせ詳細情報を取得
   * @param id お知らせID
   * @returns お知らせ詳細情報
   */
  async getNewsDetail(id: string): Promise<INewsDetails | undefined> {
    const qb = this.news
      .createQueryBuilder("news")
      .select("news.id", "id")
      .addSelect("news.title", "title")
      .addSelect("news.category", "category")
      .addSelect("news.date", "date")
      .addSelect("news.thumbnail_path", "thumbnailPath")
      .addSelect("news.detail", "detail")
      .where("news.id = :id", { id: Number(id) });

    return qb.getRawOne();
  }
}
