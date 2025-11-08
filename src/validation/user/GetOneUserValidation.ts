import { IsDefined, IsNotEmpty, IsNumber } from "class-validator";
import { Transform } from "class-transformer";
import { ValidationMsg } from "../../constants/ValidationMessages";

// ユーザー情報取得（1件）APIのバリデーションを定義

export class GetOneUserValidation {
  // idはパスパラメータなので、nullやundefinedの状態でバリデーション処理まで来ることはないかも。。。。
  // とはいえ一応、nullやundefinedの時のバリデーションもチェックしておく
  @Transform(({ value }) =>
    value !== undefined && value !== null && value !== ""
      ? Number(value)
      : value
  )
  @IsDefined({ message: ValidationMsg.id.unspecified })
  @IsNotEmpty({ message: ValidationMsg.id.unspecified })
  @IsNumber({}, { message: ValidationMsg.id.notInt })
  id!: number;
}
