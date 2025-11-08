import { HttpError } from "../error/HttpError";
import { HttpStatus } from "../constants/HttpStatus";

// エラーの形式変換や、エラーハンドリングにかかわる便利関数をまとめたファイル

/**
 * 複数のバリデーションメッセージをまとめて、一つのバリデーションエラー(400)を投げる
 * @param validationErrors
 */
export const throwValidationError = (validationErrors: any): void => {
  // 複数のバリデーションメッセージを一つにまとめる
  const errorDetails = validationErrors
    .map((validationErrors: { constraints: any }) =>
      Object.values(validationErrors.constraints ?? {})
    )
    .flat()
    .join(", ");
  throw new HttpError(
    HttpStatus.BAD_REQUEST.code,
    HttpStatus.BAD_REQUEST.message,
    `Validation failed: ${errorDetails}`
  );
};

/**
 * 404レスポンスのメッセージ部分を成形する
 * @param detail レスポンスしたい詳細なメッセージ（「指定したidのユーザーが見つかりませんでした」など）
 * @return 成形したレスポンスメッセージ
 */
export const createNotFoundMessage = (
  detail: string
): { message: string; detail: string } => {
  return {
    message: HttpStatus.NOT_FOUND.message,
    detail: detail,
  };
};

/**
 * エラーメッセージを指定して、500エラーを投げる
 * @param validationErrors
 */
export const throwInternalServerError = (detailMessage: string): void => {
  throw new HttpError(
    HttpStatus.INTERNAL_SERVER_ERROR.code,
    HttpStatus.INTERNAL_SERVER_ERROR.message,
    detailMessage
  );
};
