// 通常のErrorクラスを継承したエラークラス。
// エラーメッセージだけではなく、httpステータスコードやそれに対応した情報も保持することが出来る。
export class HttpError extends Error {
  public statusCode: number;
  public detail?: string;

  constructor(
    statusCode: number, // エラーのhttpステータスコード（400や404など）
    message: string, // エラーの、httpステータスコードに関連するメッセージ（BAD_REQUESTやNOT_FOUNDなど）
    detail?: string // 任意：エラーの詳細メッセージ（「idは数字で指定してください」「予期せぬエラーが発生しました」など）
  ) {
    super(message);
    this.statusCode = statusCode;
    this.detail = detail;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
