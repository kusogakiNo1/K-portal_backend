import { AppDataSource } from "../AppDataSource";
import { News } from "../entity/News";
import { INews } from "../types/INews";

export class NewsRepository {
  private news = AppDataSource.getRepository(News);

  async getNews(
    category?: number,
    limit?: number,
    offset?: number
  ): Promise<INews[]> {
    const qb = this.news
      .createQueryBuilder("news")
      .select("news.id", "id")
      .addSelect("news.title", "title")
      .addSelect("news.category", "category")
      .addSelect("news.date", "date")
      .addSelect("news.thumbnail_path", "thumbnail_path");

    // categoryが指定されている場合は、categoryで絞り込み
    if (category) {
      qb.andWhere("category = :category", { category: category });
    }
    // 日付の降順でソート
    qb.orderBy("date", "DESC");
    // limit（指定がない場合は、デフォルト値を指定）
    qb.limit(limit ?? 15).offset(offset ?? 0);
    return qb.getRawMany();
  }

  async countNews(category?: number): Promise<number> {
    const qb = this.news
      .createQueryBuilder("news")
      .select("COUNT(*)", "totalCount");
    // categoryが指定されている場合は、categoryで絞り込み
    if (category) {
      qb.andWhere("category = :category", { category: category });
    }

    const result = await qb.getRawOne();
    return result.totalCount;
  }
}
