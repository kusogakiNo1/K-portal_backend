import { IsInt, IsDefined } from "class-validator";
import { Type } from "class-transformer";
import { ValidationMsg } from "../../constants/ValidationMessages";

// お知らせ詳細情報取得APIのバリデーションを定義

export class GetNewsDetailValidation {
  @IsDefined({ message: ValidationMsg.id.unspecified })
  @Type(() => Number)
  @IsInt({ message: ValidationMsg.id.notInt })
  id?: string;
}
