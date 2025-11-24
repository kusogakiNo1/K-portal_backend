import {
  describe,
  beforeAll,
  afterAll,
  expect,
  test,
  vi,
  afterEach,
  beforeEach,
} from "vitest";
import request from "supertest";
import { app } from "../../app";
import { AppDataSource } from "../../src/AppDataSource";
import { HttpStatus } from "../../src/constants/HttpStatus";
import { Member } from "../../src/entity/Member";
import { MemberTag } from "../../src/entity/MemberTag";
import { GetAllMembersService } from "../../src/service/member/GetAllMembersService";
import { HttpError } from "../../src/error/HttpError";

// MemberエンティティのNOT NULL制約を満たすダミーデータ
const dummyMemberData = {
  birthday: new Date("2000-01-01"),
  imagePath: "/images/test.png",
  catchCopy: "テストキャッチコピー",
  description: "テスト説明文。",
  color: "#FFFFFF",
  accentColor: "#000000",
};

describe("メンバー情報全件取得API", () => {
  // DB接続を初期化
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });
  // DB接続を閉じる
  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  // 各テストの前にDBをクリーンアップ
  beforeEach(async () => {
    await AppDataSource.getRepository(MemberTag).delete({});
    await AppDataSource.getRepository(Member).delete({});
  });
  // テストごとにモックをクリア
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Repository テスト", () => {
    const getAllMembersService = new GetAllMembersService();

    test("No.1 [正常系] DB にメンバーとタグのデータが存在する場合、正しく結合されたデータが返ってくること", async () => {
      // 前提条件
      const member1 = await AppDataSource.getRepository(Member).save({
        ...dummyMemberData,
        name: "タグ無し",
      });
      const member2 = await AppDataSource.getRepository(Member).save({
        ...dummyMemberData,
        name: "タグ一つ",
      });
      const member3 = await AppDataSource.getRepository(Member).save({
        ...dummyMemberData,
        name: "タグ複数",
      });
      await AppDataSource.getRepository(MemberTag).save({
        memberId: member2.id,
        name: "タグ1",
      });
      await AppDataSource.getRepository(MemberTag).save({
        memberId: member3.id,
        name: "タグA",
      });
      await AppDataSource.getRepository(MemberTag).save({
        memberId: member3.id,
        name: "タグB",
      });

      // 操作
      const result = await getAllMembersService.getAllMembers();

      // 期待する結果
      expect(result).toBeDefined();
      if (!result) return; // Type guard

      expect(result).toHaveLength(3);
      const resMem1 = result.find((m) => m.id === member1.id);
      expect(resMem1).toBeDefined();
      if (!resMem1) return;
      expect(resMem1.tags).toHaveLength(0);

      const resMem2 = result.find((m) => m.id === member2.id);
      expect(resMem2).toBeDefined();
      if (!resMem2) return;
      expect(resMem2.tags).toHaveLength(1);
      expect(resMem2.tags[0].name).toBe("タグ1");

      const resMem3 = result.find((m) => m.id === member3.id);
      expect(resMem3).toBeDefined();
      if (!resMem3) return;
      expect(resMem3.tags).toHaveLength(2);
      expect(resMem3.tags.map((t) => t.name)).toEqual(
        expect.arrayContaining(["タグA", "タグB"])
      );
    });

    test("No.2 [異常系] Member テーブルが空の場合、500 エラーがスローされること", async () => {
      expect.assertions(4);
      // 前提条件：DBは空
      // DB定義上、Memberテーブルに存在しないメンバーのタグは作成できないので、Member・MemberTag両テーブルとも空の状態で確認を実施する。

      // 操作 & 期待する結果
      try {
        await getAllMembersService.getAllMembers();
      } catch (e) {
        expect(e).toBeInstanceOf(HttpError);
        if (e instanceof HttpError) {
          expect(e.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR.code);
          expect(e.message).toBe(HttpStatus.INTERNAL_SERVER_ERROR.message);
          expect(e.detail).toBe(
            "DBにメンバーのデータが入っていない、もしくはDB接続に失敗している可能性があります"
          );
        }
      }
    });

    test("No.3 [異常系] MemberTag テーブルが空の場合、500 エラーがスローされること", async () => {
      expect.assertions(4);
      // 前提条件
      await AppDataSource.getRepository(Member).save({
        ...dummyMemberData,
        name: "メンバーだけ",
      });

      // 操作 & 期待する結果
      try {
        await getAllMembersService.getAllMembers();
      } catch (e) {
        expect(e).toBeInstanceOf(HttpError);
        if (e instanceof HttpError) {
          expect(e.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR.code);
          expect(e.message).toBe(HttpStatus.INTERNAL_SERVER_ERROR.message);
          expect(e.detail).toBe(
            "DBにメンバーのデータが入っていない、もしくはDB接続に失敗している可能性があります"
          );
        }
      }
    });

    test("No.4 [異常系] Member テーブルと MemberTag テーブルが両方とも空の場合、500 エラーがスローされること", async () => {
      expect.assertions(4);
      // 操作 & 期待する結果
      try {
        await getAllMembersService.getAllMembers();
      } catch (e) {
        expect(e).toBeInstanceOf(HttpError);
        if (e instanceof HttpError) {
          expect(e.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR.code);
          expect(e.message).toBe(HttpStatus.INTERNAL_SERVER_ERROR.message);
          expect(e.detail).toBe(
            "DBにメンバーのデータが入っていない、もしくはDB接続に失敗している可能性があります"
          );
        }
      }
    });
  });

  describe("インテグレーションテスト", () => {
    test("No.1 [正常系] データが存在する場合、200 OK とメンバー情報の JSON 配列が返ってくること", async () => {
      // 前提条件
      const member = await AppDataSource.getRepository(Member).save({
        ...dummyMemberData,
        name: "メンバー",
      });
      await AppDataSource.getRepository(MemberTag).save({
        memberId: member.id,
        name: "タグ",
      });

      // 操作
      const response = await request(app).get("/members");

      // 期待する結果
      expect(response.status).toStrictEqual(HttpStatus.OK.code);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe("メンバー");
      expect(response.body[0].tags).toHaveLength(1);
      expect(response.body[0].tags[0].name).toBe("タグ");
    });

    test("No.2 [異常系] DB にメンバーデータが存在しない場合、500 エラーが返ってくること", async () => {
      // 前提条件：DBは空

      // 操作
      const response = await request(app).get("/members");

      // 期待する結果
      expect(response.status).toStrictEqual(
        HttpStatus.INTERNAL_SERVER_ERROR.code
      );
      expect(response.body.message).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR.message
      );
      expect(response.body.detail).toBe(
        "DBにメンバーのデータが入っていない、もしくはDB接続に失敗している可能性があります"
      );
    });

    test("No.3 [異常系] DB 接続自体に失敗した場合、500 エラーが返ってくること", async () => {
      // 前提条件
      const mockError = new Error("DB connection error");
      vi.spyOn(AppDataSource.getRepository(Member), "find").mockRejectedValue(
        mockError
      );

      // 操作
      const response = await request(app).get("/members");
      // 期待する結果
      expect(response.status).toStrictEqual(
        HttpStatus.INTERNAL_SERVER_ERROR.code
      );
    });
  });
});
