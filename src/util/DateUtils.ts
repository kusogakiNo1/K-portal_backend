/**
 * 日付関連のユーティリティ関数
 */
export class DateUtils {
  /**
   * Date型やISO文字列をYYYY-MM-DD形式の文字列に変換
   * @param date Date型またはISO文字列
   * @returns YYYY-MM-DD形式の文字列
   */
  static formatToDateString(date: Date | string): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      throw new Error("Invalid date provided");
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
}
