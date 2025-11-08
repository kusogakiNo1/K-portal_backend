import { describe, beforeAll, afterAll, expect, test } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { AppDataSource } from "../../src/AppDataSource";
import { ValidationMsg } from "../../src/constants/ValidationMessages";
import { HttpStatus } from "../../src/constants/HttpStatus";
import { User } from "../../src/entity/User";

const alreadyRegisteredUser = {
  name: "登録 済み太郎",
  email: "alreadyRegisterd@test.com",
  password: "password123",
  age: 20,
};

const createdUserIds: number[] = [];

describe("ユーザー登録API テスト【👍：正常系 🆖：異常系】", () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      // DB接続
      await AppDataSource.initialize().catch((err) => {
        console.error("DB接続失敗:", err);
      });
      // 確認に用いるデータを登録
      AppDataSource.getRepository(User).save(alreadyRegisteredUser);
    }
  });

  afterAll(async () => {
    // 登録したデータを削除
    await AppDataSource.getRepository(User).delete({});
    if (AppDataSource.isInitialized) {
      // DB切断
      await AppDataSource.destroy().catch((err) => {
        console.error("DB切断失敗:", err);
      });
    }
  });

  describe("バリデーションテスト", () => {
    describe("ユーザー名（name）", () => {
      test("👍 nameが1文字の場合、200が返ってくること", async () => {
        const requestBody = {
          name: "a",
          email: "test1@example.com",
          password: "password123",
          age: 20,
        };

        const response = await request(app).post("/user").send(requestBody);

        expect(response.status).toStrictEqual(200);
        expect(response.body.data).toMatchObject({
          name: requestBody.name,
          email: requestBody.email,
          age: requestBody.age,
        });
        // 登録したデータを削除
        await AppDataSource.getRepository(User).delete({
          id: response.body.data.id,
        });
      });

      test("👍 nameが20文字の場合、200が返ってくること", async () => {
        const requestBody = {
          name: "a".repeat(20),
          email: "test2@example.com",
          password: "password123",
          age: 20,
        };

        const response = await request(app).post("/user").send(requestBody);

        expect(response.status).toStrictEqual(200);
        expect(response.body.data).toMatchObject({
          name: requestBody.name,
          email: requestBody.email,
          age: requestBody.age,
        });
      });
      test("🆖 nameが未定義の場合、400エラーが返ってくること", async () => {
        const newUser = {
          email: "test@example.com",
          password: "password123",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.userName.unspecified
        );
      });

      test("🆖 nameが空文字の場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "",
          email: "test@example.com",
          password: "password123",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.userName.unspecified
        );
      });

      test("🆖 nameが21文字以上の場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "a".repeat(21),
          email: "test@example.com",
          password: "password123",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.userName.invalidLength
        );
      });
    });

    describe("メールアドレス（email）", () => {
      test("👍 RFCに準拠した一般的な形式のemailの場合、200が返ってくること", async () => {
        const requestBody = {
          name: "testuser",
          email: "test3@example.com",
          password: "password123",
          age: 20,
        };
        const response = await request(app).post("/user").send(requestBody);

        expect(response.status).toStrictEqual(200);
        expect(response.body.data).toMatchObject({
          name: requestBody.name,
          email: requestBody.email,
          age: requestBody.age,
        });
        // 登録したデータを削除
        await AppDataSource.getRepository(User).delete({
          id: response.body.data.id,
        });
      });
      test("🆖 emailが未定義の場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          password: "password123",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(ValidationMsg.email.unspecified);
      });

      test("🆖 emailが空文字の場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "",
          password: "password123",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(ValidationMsg.email.unspecified);
      });

      test("🆖 emailが256文字以上の場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "a".repeat(247) + "@test.com",
          password: "password123",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.email.invalidLength
        );
      });

      test("🆖 emailの形式が不正な場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "invalid-email",
          password: "password123",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.email.invalidFormat
        );
      });

      test("🆖 emailが既に登録済みの場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "登録 済み太郎",
          email: "alreadyRegisterd@test.com",
          password: "password123",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(ValidationMsg.email.notUnique);
      });
    });

    describe("パスワード（password）", () => {
      test("👍 passwordが8文字の英数字混合の場合、200が返ってくること", async () => {
        const requestBody = {
          name: "testuser",
          email: "test4@example.com",
          password: "aB123456",
          age: 20,
        };

        const response = await request(app).post("/user").send(requestBody);

        expect(response.status).toStrictEqual(200);
        expect(response.body.data).toMatchObject({
          name: requestBody.name,
          email: requestBody.email,
          age: requestBody.age,
        });
        // 登録したデータを削除
        await AppDataSource.getRepository(User).delete({
          id: response.body.data.id,
        });
      });

      test("👍 passwordが255文字の英数字混合の場合、200が返ってくること", async () => {
        const requestBody = {
          name: "testuser",
          email: "test5@example.com",
          password: "a".repeat(254) + "1",
          age: 20,
        };

        const response = await request(app).post("/user").send(requestBody);

        expect(response.status).toStrictEqual(200);
        expect(response.body.data).toMatchObject({
          name: requestBody.name,
          email: requestBody.email,
          age: requestBody.age,
        });
        // 登録したデータを削除
        await AppDataSource.getRepository(User).delete({
          id: response.body.data.id,
        });
      });

      test("🆖 passwordが未定義の場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "test@example.com",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.password.unspecified
        );
      });

      test("🆖 passwordが空文字の場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "test@example.com",
          password: "",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.password.unspecified
        );
      });

      test("🆖 passwordが7文字以下の場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "test@example.com",
          password: "aB1$",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.password.invalidLength
        );
      });

      test("🆖 passwordが256文字以上の場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "test@example.com",
          password: "a".repeat(256),
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.password.invalidLength
        );
      });

      test("🆖 passwordが数字のみの場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "test@example.com",
          password: "1".repeat(8),
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.password.invalidFormat
        );
      });

      test("🆖 passwordが英字のみの場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "test@example.com",
          password: "a".repeat(8),
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.password.invalidFormat
        );
      });

      test("🆖 passwordに記号が含まれる場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "test@example.com",
          password: "password123!",
          age: 20,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(
          ValidationMsg.password.invalidFormat
        );
      });
    });

    describe("年齢（age）", () => {
      test("👍 ageが0の場合、200が返ってくること", async () => {
        const requestBody = {
          name: "testuser",
          email: "test6@example.com",
          password: "password123",
          age: 0,
        };

        const response = await request(app).post("/user").send(requestBody);

        expect(response.status).toStrictEqual(200);
        expect(response.body.data).toMatchObject({
          name: requestBody.name,
          email: requestBody.email,
          age: requestBody.age,
        });
        // 登録したデータを削除
        await AppDataSource.getRepository(User).delete({
          id: response.body.data.id,
        });
      });

      test("👍 ageが正の整数の場合、200が返ってくること", async () => {
        const requestBody = {
          name: "testuser",
          email: "test7@example.com",
          password: "password123",
          age: 100,
        };

        const response = await request(app).post("/user").send(requestBody);

        expect(response.status).toStrictEqual(200);
        expect(response.body.data).toMatchObject({
          name: requestBody.name,
          email: requestBody.email,
          age: requestBody.age,
        });
        // 登録したデータを削除
        await AppDataSource.getRepository(User).delete({
          id: response.body.data.id,
        });
      });
      test("🆖 ageが未定義の場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "test@example.com",
          password: "password123",
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(ValidationMsg.age.unspecified);
      });

      test("🆖 ageが負の数の場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "test@example.com",
          password: "password123",
          age: -1,
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(ValidationMsg.age.invalidFormat);
      });

      test("🆖 ageが数値でない場合、400エラーが返ってくること", async () => {
        const newUser = {
          name: "testuser",
          email: "test@example.com",
          password: "password123",
          age: "a",
        };
        const response = await request(app).post("/user").send(newUser);

        expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
        expect(response.body.message).toEqual(HttpStatus.BAD_REQUEST.message);
        expect(response.body.detail).toContain(ValidationMsg.age.notInt);
      });
    });
  });
  describe("インテグレーションテスト", () => {
    describe("バリデーションに引っかからないパラメータでAPI実行後", () => {
      test("200が返り、DBに渡したパラメータ通りのユーザー情報が登録されていること", async () => {
        const requestBody = {
          name: "Numasaka Susuru",
          email: "tintinkaikai@example.com",
          password: "supernova1923",
          age: 25,
        };

        const response = await request(app).post("/user").send(requestBody);
        createdUserIds.push(response.body.data.id);

        expect(response.status).toStrictEqual(200);
        expect(response.body.data).toMatchObject({
          name: requestBody.name,
          email: requestBody.email,
          age: requestBody.age,
        });

        // データがDBに登録されていることを確認
        const createdUser = await AppDataSource.getRepository(User).findOneBy({
          id: response.body.data.id,
        });
        expect(createdUser).toMatchObject({
          name: requestBody.name,
          email: requestBody.email,
          age: requestBody.age,
        });
      });
    });
  });
});
