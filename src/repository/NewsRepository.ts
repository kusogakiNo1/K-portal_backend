import { AppDataSource } from "../AppDataSource";
import { News } from "../entity/News";
import { INews } from "../types/INews";

export class NewsRepository {
  private news = AppDataSource.getRepository(News);

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
}
