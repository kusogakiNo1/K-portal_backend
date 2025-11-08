import { AppDataSource } from "../../AppDataSource";
import { Member } from "../../entity/Member";
import { MemberTag } from "../../entity/MemberTag";
import { IMember } from "../../types/IMember";
import { IMemberTag } from "../../types/IMemberTag";
import { throwInternalServerError } from "../../util/ErrorUtils";

export class GetAllMembersService {
  private memberRepository = AppDataSource.getRepository(Member);
  private memberTagRepository = AppDataSource.getRepository(MemberTag);

  async getAllMembers(): Promise<IMember[] | void> {
    const memberResults = await this.memberRepository.find({
      select: {
        id: true,
        name: true,
        birthday: true,
        imagePath: true,
        catchCopy: true,
        description: true,
        color: true,
        accentColor: true,
      },
    });
    const memberTagResults = await this.memberTagRepository.find({
      select: {
        id: true,
        memberId: true,
        name: true,
      },
    });
    if (!memberResults || !memberTagResults) {
      // 全権取得で1件も取得できない = DBにデータがないor何かしらの理由でDB接続失敗のため、500エラーを投げる
      throwInternalServerError(
        "DBにメンバーのデータが入っていない、もしくはDB接続に失敗している可能性があります"
      );
    }
    // memberTagデータをmemberIdごとにグループ化する
    const tagsGropuById = new Map<number, IMemberTag[]>();
    memberTagResults.forEach((tag) => {
      if (!tagsGropuById.has(tag.memberId)) {
        tagsGropuById.set(tag.memberId, []);
      }
      tagsGropuById.get(tag.memberId)!.push({ id: tag.id, name: tag.name });
    });

    // memberデータとmemberTagデータを結合
    const completedMemberResults = memberResults.map((member) => {
      return {
        ...member,
        tags: tagsGropuById.get(member.id) || [],
      };
    });

    return completedMemberResults;
  }
}
