import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
  IsDefined,
  IsNotEmpty,
  Length,
  IsNumber,
  IsEmail,
  Min,
  Matches,
} from "class-validator";
import { User } from "../../entity/User";
import { AppDataSource } from "../../AppDataSource";
import { ValidationMsg } from "../../constants/ValidationMessages";

@ValidatorConstraint({ async: true })
// emailがUNIQUEか否かを確認するバリデーションチェック
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  async validate(email: string, args: ValidationArguments) {
    const user = await AppDataSource.getRepository(User).findOneBy({
      email: email,
    });
    return !user; // userが存在する場合にtrueを返す
  }
  defaultMessage(args: ValidationArguments) {
    return ValidationMsg.email.notUnique;
  }
}

// ユーザー作成APIのバリデーションを定義

export class CreateUserValidation {
  @IsDefined({ message: ValidationMsg.userName.unspecified })
  @IsNotEmpty({ message: ValidationMsg.userName.unspecified })
  @Length(1, 20, {
    message: ValidationMsg.userName.invalidLength,
  })
  name!: string;

  @IsDefined({ message: ValidationMsg.email.unspecified })
  @IsNotEmpty({ message: ValidationMsg.email.unspecified })
  @Length(1, 255, {
    message: ValidationMsg.email.invalidLength,
  })
  @IsEmail({}, { message: ValidationMsg.email.invalidFormat })
  @Validate(IsEmailUniqueConstraint) // UNIQUEかどうかの確認
  email!: string;

  @IsDefined({ message: ValidationMsg.password.unspecified })
  @IsNotEmpty({ message: ValidationMsg.password.unspecified })
  @Length(8, 255, {
    message: ValidationMsg.password.invalidLength,
  })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{8,255}$/, {
    message: ValidationMsg.password.invalidFormat,
  })
  password!: string;

  @IsDefined({ message: ValidationMsg.age.unspecified })
  @IsNotEmpty({ message: ValidationMsg.age.unspecified })
  @IsNumber({}, { message: ValidationMsg.age.notInt })
  @Min(0, { message: ValidationMsg.age.invalidFormat })
  age!: number;
}
