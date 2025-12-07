import { supabase } from "../supabaseClient";
import { INews, INewsDetails } from "../types/INews";

export class NewsRepository {
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
    const limitNum = limit ? Number(limit) : 15;
    const offsetNum = offset ? Number(offset) : 0;

    let query = supabase
      .from("news")
      .select("id, title, category, date, thumbnail_path")
      .eq("deleted_flag", 0)
      .order("date", { ascending: false })
      .range(offsetNum, offsetNum + limitNum - 1);

    // categoryが指定されている場合は、categoryで絞り込み
    if (category) {
      query = query.eq("category", Number(category));
    }

    const { data, error } = await query;

    if (error) {
      console.error("News取得エラー:", error);
      throw new Error("お知らせ情報の取得に失敗しました");
    }

    // スネークケースからキャメルケースへ変換
    return (data || []).map((news: any) => ({
      id: news.id,
      title: news.title,
      category: news.category,
      date: news.date,
      thumbnailPath: news.thumbnail_path,
    }));
  }

  /**
   * お知らせ情報の総件数を取得
   * @param category お知らせのカテゴリー
   * @returns お知らせ情報の総件数
   */
  async countNews(category?: string): Promise<number> {
    let query = supabase
      .from("news")
      .select("*", { count: "exact", head: true })
      .eq("deleted_flag", 0);

    // categoryが指定されている場合は、categoryで絞り込み
    if (category) {
      query = query.eq("category", Number(category));
    }

    const { count, error } = await query;

    if (error) {
      console.error("Newsカウントエラー:", error);
      throw new Error("お知らせ情報の件数取得に失敗しました");
    }

    return count || 0;
  }

  /**
   * お知らせ詳細情報を取得
   * @param id お知らせID
   * @returns お知らせ詳細情報
   */
  async getNewsDetail(id: string): Promise<INewsDetails | undefined> {
    const { data, error } = await supabase
      .from("news")
      .select("id, title, category, date, thumbnail_path, detail")
      .eq("id", Number(id))
      .eq("deleted_flag", 0)
      .single();

    if (error) {
      console.error("News詳細取得エラー:", error);
      return undefined;
    }

    if (!data) {
      return undefined;
    }

    // スネークケースからキャメルケースへ変換
    return {
      id: data.id,
      title: data.title,
      category: data.category,
      date: data.date,
      thumbnailPath: data.thumbnail_path,
      detail: data.detail,
    };
  }
}
