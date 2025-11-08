import { AppDataSource } from "../../AppDataSource";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateUserValidation } from "../../validation/user/CreateUserValidation";
import { User } from "../../entity/User";
import { IUser } from "../../types/IUser";

type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  age: number;
};

export class CreateUserService {
  private userRepository = AppDataSource.getRepository(User);

  async validate(userData: CreateUserRequest): Promise<any> {
    const validation = plainToInstance(CreateUserValidation, userData);
    return validate(validation);
  }

  async createUser(userData: CreateUserRequest): Promise<IUser | {}> {
    const user = new User();

    // トランザクション開始
    await AppDataSource.transaction(async (manager) => {
      user.name = userData.name;
      user.email = userData.email;
      user.password = userData.password;
      user.age = userData.age;

      await manager.save(user); // DBに登録
    });

    // 作成したユーザーのidを取得
    const userId = await this.userRepository.findOneBy({
      email: userData.email,
    });

    const createdUserData: IUser = {
      id: user.id,
      name: userData.name,
      email: userData.email,
      age: userData.age,
      deletedFlag: user.deletedFlag, // 作成したばかりなので確定でfalse
    };
    return { message: "create success!", data: createdUserData };
  }
}
