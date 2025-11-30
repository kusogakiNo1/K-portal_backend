import {
  describe,
  beforeAll,
  beforeEach,
  afterAll,
  expect,
  test,
  vi,
} from "vitest";
import request from "supertest";
import { app } from "../../app";
import { AppDataSource } from "../../src/AppDataSource";
import { News } from "../../src/entity/News";
import { GetNewsDetailService } from "../../src/service/news/GetNewsDetailService";
import { ValidationMsg } from "../../src/constants/ValidationMessages";
import { HttpStatus } from "../../src/constants/HttpStatus";
import { NewsRepository } from "../../src/repository/NewsRepository";

const getNewsDetailService = new GetNewsDetailService();
const newsRepository = new NewsRepository();

describe("お知らせ詳細情報取得API テスト【👍：正常系 🆖：異常系】", () => {
  beforeAll(async () => {
    // すべてのテストケースの前に実行される処理
    // DB接続
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize().catch((err) => {
        console.error("DB接続失敗:", err);
      });
    }
  });

  // 各テストの前にDBをクリーンアップして、テスト用データを投入
  beforeEach(async () => {
    // 他のテストファイルとの競合を避けるため、少し待機
    await new Promise((resolve) => setTimeout(resolve, 10));

    // テーブルをリセット（データ削除＋主キー採番初期化）
    await AppDataSource.query("TRUNCATE TABLE news");

    // テスト用データを投入（IDは自動採番）
    await AppDataSource.getRepository(News).save([
      {
        title: "ローカル環境準備完了",
        category: 1,
        date: new Date("2025-11-08"),
        thumbnailPath: "../images/thumbnail/announcement1.png",
        detail:
          "ローカル環境の準備が整いました！さあ、あなたも開発者になって、K-portalを盛り上げていきましょう！",
      },
      {
        title: "クソガキグランプリ開催",
        category: 2,
        date: new Date("2026-01-01"),
        thumbnailPath: "../images/thumbnail/event1.png",
        detail:
          "新年明けましておめでとうございます！今年も、何卒よろしくお願いいたします。...さて、早速ですが、クソガキグランプリの開催が決定したので、お知らせします。",
      },
      {
        title: "沼坂さん活動休止",
        category: 3,
        date: new Date("2026-03-01"),
        thumbnailPath: "../images/thumbnail/news1.png",
        detail:
          "沼坂さんが、年内で活動休止されるとのことです。今のうちに、遊んでおきましょう！",
      },
    ]);
  });

  afterAll(async () => {
    // すべてのテストケースの後に実行される処理
    // テーブルをリセット（データ削除＋主キー採番初期化）
    await AppDataSource.query("TRUNCATE TABLE news");
  });

  describe("バリデーションテスト", () => {
    test("👍 有効な値（1, 100）の場合、エラーにならないこと", async () => {
      // 有効な値のテスト
      const response1 = await getNewsDetailService.validate({ id: "1" });
      expect(response1.length).toBe(0);

      const response100 = await getNewsDetailService.validate({ id: "100" });
      expect(response100.length).toBe(0);
    });
    test("🆖 idがundefinedの場合、400エラーが返ってくることの確認", async () => {
      // idはパスパラメータにつき、nullやundefinedを指定したAPI実行ができないので、直接validate関数を実行して確認
      const response = await getNewsDetailService.validate({});

      expect(response[0].constraints).toMatchObject({
        isDefined: ValidationMsg.id.unspecified,
      });
    });
    test("🆖 idが空文字の場合、400エラーが返ってくることの確認", async () => {
      // idはパスパラメータにつき、nullやundefinedを指定したAPI実行ができないので、直接validate関数を実行して確認
      const response = await getNewsDetailService.validate({ id: "" });

      expect(response[0].constraints).toMatchObject({
        matches: ValidationMsg.id.notInt,
      });
    });
    test("🆖 idに文字を指定した場合、400エラーが返ってくることの確認", async () => {
      const response = await request(app).get("/news/abc");

      expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
      expect(response.body).toEqual({
        message: HttpStatus.BAD_REQUEST.message,
        detail: "Validation failed: " + ValidationMsg.id.notInt,
      });
    });
    test("🆖 小数点を含む値の場合、400エラーが返ってくることの確認", async () => {
      const response = await request(app).get("/news/20.5");

      expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
      expect(response.body).toEqual({
        message: HttpStatus.BAD_REQUEST.message,
        detail: "Validation failed: " + ValidationMsg.id.notInt,
      });
    });
    test("🆖 負の数の場合、400エラーが返ってくることの確認", async () => {
      const response = await request(app).get("/news/-1");

      expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
      expect(response.body).toEqual({
        message: HttpStatus.BAD_REQUEST.message,
        detail: "Validation failed: " + ValidationMsg.id.notInt,
      });
    });
  });

  describe("Repository テスト", () => {
    test("👍 getNewsDetail: 存在するIDで詳細データが取得できること", async () => {
      const newsDetail = await newsRepository.getNewsDetail("1");
      expect(newsDetail).toBeDefined();
      expect(newsDetail!.id).toBe(1);
      expect(newsDetail!.title).toBe("ローカル環境準備完了");
    });
    test("👍 getNewsDetail: 存在しないIDでundefinedが返ること", async () => {
      const newsDetail = await newsRepository.getNewsDetail("9999");
      expect(newsDetail).toBeUndefined();
    });
    test("👍 getNewsDetail: 取得データに全ての項目が含まれていること", async () => {
      const newsDetail = await newsRepository.getNewsDetail("1");
      expect(newsDetail).toBeDefined();
      expect(newsDetail).toHaveProperty("id");
      expect(newsDetail).toHaveProperty("title");
      expect(newsDetail).toHaveProperty("category");
      expect(newsDetail).toHaveProperty("date");
      expect(newsDetail).toHaveProperty("thumbnailPath");
      expect(newsDetail).toHaveProperty("detail");
    });
  });

  describe("インテグレーションテスト", () => {
    test("👍 存在するお知らせIDを指定し、200が返ってくることの確認", async () => {
      const response = await request(app).get("/news/1");

      expect(response.status).toStrictEqual(HttpStatus.OK.code);
      expect(response.body).toEqual({
        id: 1,
        title: "ローカル環境準備完了",
        category: 1,
        date: "2025-11-08",
        thumbnailPath: "../images/thumbnail/announcement1.png",
        detail:
          "ローカル環境の準備が整いました！さあ、あなたも開発者になって、K-portalを盛り上げていきましょう！",
      });
    });
    test("👍 レスポンスの日付がYYYY-MM-DD形式で返ってくることの確認", async () => {
      const response = await request(app).get("/news/1");

      expect(response.status).toStrictEqual(HttpStatus.OK.code);
      expect(response.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
    test("👍 レスポンスに必要な項目が全て含まれていることの確認", async () => {
      const response = await request(app).get("/news/1");

      expect(response.status).toStrictEqual(HttpStatus.OK.code);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("title");
      expect(response.body).toHaveProperty("category");
      expect(response.body).toHaveProperty("date");
      expect(response.body).toHaveProperty("thumbnailPath");
      expect(response.body).toHaveProperty("detail");
    });
    test("🆖 無効なIDでリクエストした場合、400が返ってくることの確認", async () => {
      const response = await request(app).get("/news/abc");

      expect(response.status).toStrictEqual(HttpStatus.BAD_REQUEST.code);
      expect(response.body).toEqual({
        message: HttpStatus.BAD_REQUEST.message,
        detail: "Validation failed: " + ValidationMsg.id.notInt,
      });
    });
    test("🆖 存在しないお知らせIDを指定し、404が返ってくることの確認", async () => {
      const response = await request(app).get("/news/9999");

      expect(response.status).toStrictEqual(HttpStatus.NOT_FOUND.code);
      expect(response.body).toEqual({
        message: HttpStatus.NOT_FOUND.message,
        detail: "指定したIDのお知らせが見つかりませんでした",
      });
    });
    test("🆖 DB接続に失敗した場合、500 Internal Server Errorが返ってくること", async () => {
      const getNewsDetailMock = vi
        .spyOn(NewsRepository.prototype, "getNewsDetail")
        .mockRejectedValue(new Error("DB connection error"));

      const response = await request(app).get("/news/1");
      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR.code);
      expect(response.body.message).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR.message
      );

      getNewsDetailMock.mockRestore();
    });
  });
});
