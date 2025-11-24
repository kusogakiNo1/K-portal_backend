import { IsNumber, Min, Max, IsOptional, IsIn } from "class-validator";
import { Type } from "class-transformer";
import { ValidationMsg } from "../../constants/ValidationMessages";

// お知らせ情報取得APIのバリデーションを定義

export class GetNewsValidation {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: ValidationMsg.category.notInt })
  @IsIn([1, 2, 3, 4], {
    message: ValidationMsg.category.invalidFormat,
  })
  category!: number;

  // 未指定時はデフォルト値を設定するようになっているので、必須チェックやnullチェックは行わない
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: ValidationMsg.limit.notInt })
  @Min(0, { message: ValidationMsg.limit.invalidFormat })
  @Max(1000, { message: ValidationMsg.limit.invalidFormat })
  limit?: number;

  // 未指定時はデフォルト値を設定するようになっているので、必須チェックやnullチェックは行わない
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: ValidationMsg.offset.notInt })
  @Min(0, { message: ValidationMsg.offset.invalidFormat })
  offset?: number;
}
