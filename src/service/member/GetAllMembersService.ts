import { AppDataSource } from "../../AppDataSource";
import { Member } from "../../entity/Member";
import { IMember } from "../../types/IMember";
import { throwInternalServerError } from "../../util/ErrorUtils";

export class GetAllMembersService {
  private memberRepository = AppDataSource.getRepository(Member);

  async getAllMembers(): Promise<IMember[] | void> {
    const results = await this.memberRepository.find();
    console.log(results);
    if (results) {
      const members = results.map(
        (result): IMember => ({
          id: result.id,
          name: result.name,
          birthday: result.birthday,
          imagePath: result.imagePath,
          catchCopy: result.catchCopy,
          description: result.description,
          color: result.color,
          accentColor: result.accentColor,
        })
      );
      return members;
    } else {
      // 全権取得で1件も取得できない = DBにデータがないor何かしらの理由でDB接続失敗のため、500エラーを投げる
      throwInternalServerError(
        "DBにメンバーのデータが入っていない、もしくはDB接続に失敗している可能性があります"
      );
    }
  }
}
