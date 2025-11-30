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
import { GetNewsService } from "../../src/service/news/GetNewsService";
import { ValidationMsg } from "../../src/constants/ValidationMessages";
import { HttpStatus } from "../../src/constants/HttpStatus";
import { NewsRepository } from "../../src/repository/NewsRepository";

const getNewsService = new GetNewsService();
const newsRepository = new NewsRepository();

describe("お知らせ情報取得API テスト【👍：正常系 🆖：異常系】", () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  });

  // 各テストの前にDBをクリーンアップして、テスト用データを投入
  beforeEach(async () => {
    // 他のテストファイルとの競合を避けるため、少し待機
    await new Promise((resolve) => setTimeout(resolve, 5));

    // テーブルをリセット（データ削除＋主キー採番初期化）
    await AppDataSource.query("TRUNCATE TABLE news");

    // テスト用データを投入（IDは自動採番）
    await AppDataSource.getRepository(News).save([
      {
        title: "News 1",
        category: 1,
        date: new Date("2025-01-01"),
        thumbnailPath: "/1.jpg",
        detail: "Detail 1",
      },
      {
        title: "News 2",
        category: 2,
        date: new Date("2025-01-02"),
        thumbnailPath: "/2.jpg",
        detail: "Detail 2",
      },
      {
        title: "News 3",
        category: 1,
        date: new Date("2025-01-03"),
        thumbnailPath: "/3.jpg",
        detail: "Detail 3",
      },
    ]);
  });

  afterAll(async () => {
    // すべてのテストケースの後に実行される処理
    // テーブルをリセット（データ削除＋主キー採番初期化）
    await AppDataSource.query("TRUNCATE TABLE news");
  });

  describe("バリデーションテスト（Unit）", () => {
    describe("category", () => {
      test("👍 有効な値（1）の場合、エラーにならないこと", async () => {
        const validationErrors = await getNewsService.validate({
          category: 1,
        });
        expect(validationErrors.length).toBe(0);
      });
      test("👍 未定義の場合、エラーにならないこと", async () => {
        const validationErrors = await getNewsService.validate({});
        expect(validationErrors.length).toBe(0);
      });
      test("🆖 範囲外の値（5）の場合、エラーになること", async () => {
        const validationErrors = await getNewsService.validate({
          category: 5,
        });
        expect(validationErrors[0].constraints.isIn).toBe(
          ValidationMsg.category.invalidFormat
        );
      });
      test("🆖 型が違う（'a'）の場合、エラーになること", async () => {
        const validationErrors = await getNewsService.validate({
          category: "a",
        });
        expect(validationErrors[0].constraints.isInt).toBe(
          ValidationMsg.category.notInt
        );
      });
    });
    describe("limit", () => {
      test("👍 有効な値（100）の場合、エラーにならないこと", async () => {
        const validationErrors = await getNewsService.validate({
          limit: 100,
        });
        expect(validationErrors.length).toBe(0);
      });
      test("👍 未定義の場合、エラーにならないこと", async () => {
        const validationErrors = await getNewsService.validate({});
        expect(validationErrors.length).toBe(0);
      });
      test("🆖 範囲外の値（1001）の場合、エラーになること", async () => {
        const validationErrors = await getNewsService.validate({
          limit: 1001,
        });
        expect(validationErrors[0].constraints.max).toBe(
          ValidationMsg.limit.invalidFormat
        );
      });
      test("🆖 型が違う（'a'）の場合、エラーになること", async () => {
        const validationErrors = await getNewsService.validate({
          limit: "a",
        });
        expect(validationErrors[0].constraints.isInt).toBe(
          ValidationMsg.limit.notInt
        );
      });
    });
    describe("offset", () => {
      test("👍 有効な値（100）の場合、エラーにならないこと", async () => {
        const validationErrors = await getNewsService.validate({
          offset: 100,
        });
        expect(validationErrors.length).toBe(0);
      });
      test("👍 未定義の場合、エラーにならないこと", async () => {
        const validationErrors = await getNewsService.validate({});
        expect(validationErrors.length).toBe(0);
      });
      test("🆖 範囲外の値（-1）の場合、エラーになること", async () => {
        const validationErrors = await getNewsService.validate({
          offset: -1,
        });
        expect(validationErrors[0].constraints.min).toBe(
          ValidationMsg.offset.invalidFormat
        );
      });
      test("🆖 型が違う（'a'）の場合、エラーになること", async () => {
        const validationErrors = await getNewsService.validate({
          offset: "a",
        });
        expect(validationErrors[0].constraints.isInt).toBe(
          ValidationMsg.offset.notInt
        );
      });
    });
  });

  describe("Repository テスト", () => {
    test("👍 getNews: パラメータなしで全件取得できること", async () => {
      const news = await newsRepository.getNews();
      expect(news.length).toBe(3);
    });
    test("👍 getNews: categoryで絞り込みができること", async () => {
      const news = await newsRepository.getNews("1");
      expect(news.length).toBe(2);
      expect(news.every((n) => n.category === 1)).toBe(true);
    });
    test("👍 getNews: limit, offsetでページネーションができること", async () => {
      const news = await newsRepository.getNews(undefined, "1", "1");
      expect(news.length).toBe(1);
      expect(news[0].id).toBe(2);
    });
    test("👍 getNews: 該当データなしで空配列が返ること", async () => {
      const news = await newsRepository.getNews("4");
      expect(news.length).toBe(0);
    });
    test("👍 countNews: 総件数が取得できること", async () => {
      const count = await newsRepository.countNews();
      expect(count).toBe(3);
    });
    test("👍 countNews: category指定で絞り込んだ総件数が取得できること", async () => {
      const count = await newsRepository.countNews("1");
      expect(count).toBe(2);
    });
  });

  describe("インテグレーションテスト", () => {
    test("👍 パラメータなしでリクエストした場合、200 OKと全お知らせ情報が返ってくること", async () => {
      const response = await request(app).get("/news");
      expect(response.status).toBe(HttpStatus.OK.code);
      expect(response.body.totalcount).toBe(3);
      expect(response.body.count).toBe(3);
      expect(response.body.news.length).toBe(3);
    });
    test("👍 category=1でリクエストした場合、200 OKと絞り込まれたお知らせ情報が返ってくること", async () => {
      const response = await request(app).get("/news?category=1");
      expect(response.status).toBe(HttpStatus.OK.code);
      expect(response.body.totalcount).toBe(2);
      expect(response.body.count).toBe(2);
      expect(response.body.news.every((n) => n.category === 1)).toBe(true);
    });
    test("👍 該当データが存在しない場合、200 OKと空のnews配列が返ってくること", async () => {
      const response = await request(app).get("/news?category=4");
      expect(response.status).toBe(HttpStatus.OK.code);
      expect(response.body.totalcount).toBe(0);
      expect(response.body.count).toBe(0);
      expect(response.body.news.length).toBe(0);
    });
    test("🆖 無効なcategoryでリクエストした場合、400 Bad Requestが返ってくること", async () => {
      const response = await request(app).get("/news?category=a");
      expect(response.status).toBe(HttpStatus.BAD_REQUEST.code);
      expect(response.body.message).toBe(HttpStatus.BAD_REQUEST.message);
      expect(response.body.detail).toContain(ValidationMsg.category.notInt);
    });
    test("🆖 DB接続に失敗した場合、500 Internal Server Errorが返ってくること", async () => {
      const getNewsMock = vi
        .spyOn(NewsRepository.prototype, "getNews")
        .mockRejectedValue(new Error("DB error"));
      const response = await request(app).get("/news");
      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR.code);
      expect(response.body.message).toBe(
        HttpStatus.INTERNAL_SERVER_ERROR.message
      );
      getNewsMock.mockRestore();
    });
  });
});
