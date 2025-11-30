import { IsInt, IsDefined, IsNotEmpty, Matches } from "class-validator";
import { Type } from "class-transformer";
import { ValidationMsg } from "../../constants/ValidationMessages";

// お知らせ詳細情報取得APIのバリデーションを定義

export class GetNewsDetailValidation {
  @IsDefined({ message: ValidationMsg.id.unspecified })
  @IsNotEmpty({ message: ValidationMsg.id.unspecified })
  @Matches(/^[1-9]\d*$/, { message: ValidationMsg.id.notInt })
  id?: string;
}
