import { AppDataSource } from "../AppDataSource";
import { MemberTag } from "../entity/MemberTag";

export class MemberRepository {
  private memberTagRepository = AppDataSource.getRepository(MemberTag);
}
