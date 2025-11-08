import { describe, beforeAll, afterAll, expect, test } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { AppDataSource } from "../../src/AppDataSource";
import { ValidationMsg } from "../../src/constants/ValidationMessages";
import { HttpStatus } from "../../src/constants/HttpStatus";
import { GetOneUserService } from "../../src/service/user/GetOneUserService";
import { User } from "../../src/entity/User";

const getOneUserService = new GetOneUserService();

let alreadyRegisteredUser;

describe("ユーザー情報取得(1件)API テスト【👍：正常系 🆖：異常系】", () => {
  beforeAll(async () => {
    // すべてのテストケースの前に実行される処理
    // DB接続
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize().catch((err) => {
        console.error("DB接続失敗:", err);
      });
    }
    // 確認に用いるデータを登録
    alreadyRegisteredUser = await AppDataSource.getRepository(User).save({
      name: "登録 済み太郎",
      email: "alreadyRegisterd@test.com",
      password: "password123",
      age: 20,
    });
  });

  afterAll(async () => {
    // すべてのテストケースの後に実行される処理
    // DB切断
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy().catch((err) => {
        console.error("DB切断失敗:", err);
      });
    }
  });

  describe("バリデーションテスト", () => {
    test("🆖 idがundefinedの場合、400エラーが返ってくることの確認", async () => {
      // idはパスパラメータにつき、nullやundefinedを指定したAPI実行ができないので、直接validate関数を実行して確認
      const response = await getOneUserService.validate({});

      expect(response[0].constraints).toMatchObject({
        isDefined: ValidationMsg.id.unspecified,
      });
    });
    test("🆖 idがnullの場合、400エラーが返ってくることの確認", async () => {
      // idはパスパラメータにつき、nullやundefinedを指定したAPI実行ができないので、直接validate関数を実行して確認
      const response = await getOneUserService.validate({ id: null });

      expect(response[0].constraints).toMatchObject({
        isDefined: ValidationMsg.id.unspecified,
      });
    });
    test("🆖 idが空文字の場合、400エラーが返ってくることの確認", async () => {
      // idはパスパラメータにつき、nullやundefinedを指定したAPI実行ができないので、直接validate関数を実行して確認
      const response = await getOneUserService.validate({ id: "" });

      expect(response[0].constraints).toMatchObject({
        isNotEmpty: ValidationMsg.id.unspecified,
      });
    });
    test("🆖 idに文字を指定した場合、400エラーが返ってくることの確認", async () => {
      const response = await request(app).get("/user/a");

      expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
      expect(response.body).toEqual({
        message: HttpStatus.BAD_REQUEST.message,
        detail: "Validation failed: " + ValidationMsg.id.notInt,
      });
    });
  });
  describe("レスポンステスト", () => {
    test("👍 存在するユーザーidを指定し、200が返ってくることの確認", async () => {
      const response = await request(app).get(
        `/user/${alreadyRegisteredUser.id}`
      );

      expect(response.status).toStrictEqual(HttpStatus.OK.code);
      expect(response.body).toEqual({
        id: alreadyRegisteredUser.id,
        name: alreadyRegisteredUser.name,
        email: alreadyRegisteredUser.email,
        age: alreadyRegisteredUser.age,
        deletedFlag: alreadyRegisteredUser.deletedFlag,
      });
    });
    test("🆖 存在しないユーザーidを指定し、404が返ってくることの確認", async () => {
      const response = await request(app).get("/user/9999999999");

      expect(response.status).toStrictEqual(HttpStatus.NOT_FOUND.code);
      expect(response.body).toEqual({
        message: HttpStatus.NOT_FOUND.message,
        detail: "指定したid(id : 9999999999)のユーザーが見つかりませんでした",
      });
    });
  });
});
