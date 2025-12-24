import {
  describe,
  afterAll,
  expect,
  test,
  vi,
  afterEach,
  beforeEach,
} from "vitest";
import request from "supertest";
import { app } from "../../app";
import { HttpStatus } from "../../src/constants/HttpStatus";
import { GetAllMembersService } from "../../src/service/member/GetAllMembersService";
import { HttpError } from "../../src/error/HttpError";
import { supabase } from "../../src/supabaseClient";

// MemberエンティティのNOT NULL制約を満たすダミーデータ
const dummyMemberData = {
  name: "テストメンバー",
  birthday: "2000-01-01",
  image_path: "/images/test.png",
  catch_copy: "テストキャッチコピー",
  description: "テスト説明文。",
  color: "#FFFFFF",
  accent_color: "#000000",
};

describe("メンバー情報全件取得API", () => {
  // すべてのテストケースの後に実行される処理
  afterAll(async () => {
    // テスト用データを削除
    await supabase.from("member_tags").delete().neq("id", 0);
    await supabase.from("members").delete().neq("id", 0);
  });

  // 各テストの前にDBをクリーンアップ
  beforeEach(async () => {
    await supabase.from("member_tags").delete().neq("id", 0);
    await supabase.from("members").delete().neq("id", 0);
  });

  // テストごとにモックをクリア
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Repository テスト", () => {
    const getAllMembersService = new GetAllMembersService();

    test("No.1 [正常系] DB にメンバーとタグのデータが存在する場合、正しく結合されたデータが返ってくること", async () => {
      // 前提条件
      const { data: members } = await supabase
        .from("members")
        .insert([
          {
            ...dummyMemberData,
            name: "タグ無し",
          },
          {
            ...dummyMemberData,
            name: "タグ一つ",
          },
          {
            ...dummyMemberData,
            name: "タグ複数",
          },
        ])
        .select("id");

      if (!members || members.length < 3) {
        throw new Error("Failed to insert test data");
      }

      await supabase.from("member_tags").insert([
        { member_id: members[0].id, name: "タグ1" },
        { member_id: members[1].id, name: "タグA" },
        { member_id: members[1].id, name: "タグB" },
      ]);

      // 操作
      const result = await getAllMembersService.getAllMembers();

      // 期待する結果
      expect(result).toBeDefined();
      if (!result) return; // Type guard

      expect(result).toHaveLength(3);
      const resMem1 = result.find((m) => m.id === members[0].id);
      expect(resMem1).toBeDefined();
      if (!resMem1) return;
      expect(resMem1.tags).toHaveLength(1);
      expect(resMem1.tags[0].name).toBe("タグ1");

      const resMem2 = result.find((m) => m.id === members[1].id);
      expect(resMem2).toBeDefined();
      if (!resMem2) return;
      expect(resMem2.tags).toHaveLength(2);
      expect(resMem2.tags.map((t) => t.name)).toEqual(
        expect.arrayContaining(["タグA", "タグB"])
      );

      const resMem3 = result.find((m) => m.id === members[2].id);
      expect(resMem3).toBeDefined();
      if (!resMem3) return;
      expect(resMem3.tags).toHaveLength(0);
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
      await supabase.from("members").insert({
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
      const { data: members } = await supabase
        .from("members")
        .insert({
          ...dummyMemberData,
          name: "メンバー",
        })
        .select("id");

      if (!members || members.length === 0) {
        throw new Error("Failed to insert test data");
      }

      await supabase.from("member_tags").insert({
        member_id: members[0].id,
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
      vi.spyOn(GetAllMembersService.prototype, "getAllMembers").mockRejectedValue(
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
