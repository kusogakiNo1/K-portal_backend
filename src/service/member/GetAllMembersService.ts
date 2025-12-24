import { supabase } from "../../supabaseClient";
import { IMember } from "../../types/IMember";
import { IMemberTag } from "../../types/IMemberTag";
import { throwInternalServerError } from "../../util/ErrorUtils";

export class GetAllMembersService {
  async getAllMembers(): Promise<IMember[] | void> {
    // Supabaseからメンバーとタグのデータを取得
    // 本来、DBからのデータ取得処理はRepositoryに記載するのが正しいが、全件取得ということもありServiceに記載する。
    const { data: members, error: membersError } = await supabase
      .from("members")
      .select("*")
      .eq("deleted_flag", 0);

    const { data: memberTags, error: tagsError } = await supabase
      .from("member_tags")
      .select("*")
      .eq("deleted_flag", 0);

    if (membersError || tagsError) {
      console.error("DB取得エラー:", membersError || tagsError);
      throwInternalServerError(
        "DBからのデータ取得に失敗しました"
      );
      return;
    }

    if (!members || members.length === 0 || !memberTags || memberTags.length === 0) {
      throwInternalServerError(
        "DBにメンバーのデータが入っていない、もしくはDB接続に失敗している可能性があります"
      );
      return;
    }

    // memberTagデータをmemberIdごとにグループ化する
    const tagsGroupById = new Map<number, IMemberTag[]>();
    memberTags.forEach((tag: any) => {
      const memberId = tag.member_id;
      if (!tagsGroupById.has(memberId)) {
        tagsGroupById.set(memberId, []);
      }
      tagsGroupById.get(memberId)!.push({ id: tag.id, name: tag.name });
    });

    // memberデータとmemberTagデータを結合、スネークケースからキャメルケースへ変換
    const completedMemberResults: IMember[] = members.map((member: any) => {
      return {
        id: member.id,
        name: member.name,
        birthday: member.birthday,
        imagePath: member.image_path,
        catchCopy: member.catch_copy,
        description: member.description,
        color: member.color,
        accentColor: member.accent_color,
        tags: tagsGroupById.get(member.id) || [],
      };
    });

    return completedMemberResults;
  }
}
