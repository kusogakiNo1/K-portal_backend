import { AppDataSource } from "../../AppDataSource";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { GetOneUserValidation } from "../../validation/user/GetOneUserValidation";
import { User } from "../../entity/User";
import { IUser } from "../../types/IUser";

export class GetOneUserService {
  private userRepository = AppDataSource.getRepository(User);

  async validate(param): Promise<any> {
    const validation = plainToInstance(GetOneUserValidation, param);
    return validate(validation);
  }

  async getOneUserById(id: number): Promise<IUser | {}> {
    const result = await this.userRepository.findOneBy({ id: id });
    if (result) {
      const user: IUser = {
        id: result.id,
        name: result.name,
        email: result.email,
        age: result.age,
        deletedFlag: result.deletedFlag,
      };
      return user;
    } else {
      return {}; // ユーザー情報なし
    }
  }
}
