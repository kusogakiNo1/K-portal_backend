import { AppDataSource } from "../AppDataSource";
import { Member } from "../entity/Member";

export class MemberRepository {
  private memberRepository = AppDataSource.getRepository(Member);
}
