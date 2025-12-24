import {
  describe,
  beforeEach,
  afterAll,
  expect,
  test,
  vi,
} from "vitest";
import request from "supertest";
import { app } from "../../app";
import { GetNewsService } from "../../src/service/news/GetNewsService";
import { NewsRepository } from "../../src/repository/NewsRepository";
import { ValidationMsg } from "../../src/constants/ValidationMessages";
import { HttpStatus } from "../../src/constants/HttpStatus";
import { supabase } from "../../src/supabaseClient";

const getNewsService = new GetNewsService();
const newsRepository = new NewsRepository();

describe("お知らせ一覧取得API テスト【👍：正常系 🆖：異常系】", () => {
  // 各テストの前にDBをクリーンアップして、テスト用データを投入
  beforeEach(async () => {
    // テスト用データを削除
    await supabase.from("news").delete().neq("id", 0);

    // テスト用データを投入
    await supabase.from("news").insert([
      {
        title: "お知らせ1",
        category: 1,
        date: "2025-01-01",
        thumbnail_path: "/images/news1.jpg",
        detail: "お知らせ1の詳細",
      },
      {
        title: "お知らせ2",
        category: 2,
        date: "2025-01-02",
        thumbnail_path: "/images/news2.jpg",
        detail: "お知らせ2の詳細",
      },
      {
        title: "お知らせ3",
        category: 1,
        date: "2025-01-03",
        thumbnail_path: "/images/news3.jpg",
        detail: "お知らせ3の詳細",
      },
      {
        title: "お知らせ4",
        category: 3,
        date: "2025-01-04",
        thumbnail_path: "/images/news4.jpg",
        detail: "お知らせ4の詳細",
      },
      {
        title: "お知らせ5",
        category: 1,
        date: "2025-01-05",
        thumbnail_path: "/images/news5.jpg",
        detail: "お知らせ5の詳細",
      },
      {
        title: "お知らせ6",
        category: 2,
        date: "2025-01-06",
        thumbnail_path: "/images/news6.jpg",
        detail: "お知らせ6の詳細",
      },
      {
        title: "お知らせ7",
        category: 1,
        date: "2025-01-07",
        thumbnail_path: "/images/news7.jpg",
        detail: "お知らせ7の詳細",
      },
      {
        title: "お知らせ8",
        category: 2,
        date: "2025-01-08",
        thumbnail_path: "/images/news8.jpg",
        detail: "お知らせ8の詳細",
      },
      {
        title: "お知らせ9",
        category: 3,
        date: "2025-01-09",
        thumbnail_path: "/images/news9.jpg",
        detail: "お知らせ9の詳細",
      },
      {
        title: "お知らせ10",
        category: 1,
        date: "2025-01-10",
        thumbnail_path: "/images/news10.jpg",
        detail: "お知らせ10の詳細",
      },
    ]);
  });

  afterAll(async () => {
    // テスト後のクリーンアップ
    await supabase.from("news").delete().neq("id", 0);
  });

  describe("バリデーションテスト", () => {
    describe("categoryパラメータ", () => {
      test("No.1 [正常系] 有効な値（1, 2, 3, 4）が渡されること", async () => {
        const response1 = await getNewsService.validate({ category: "1" });
        expect(response1.length).toBe(0);

        const response2 = await getNewsService.validate({ category: "2" });
        expect(response2.length).toBe(0);

        const response3 = await getNewsService.validate({ category: "3" });
        expect(response3.length).toBe(0);

        const response4 = await getNewsService.validate({ category: "4" });
        expect(response4.length).toBe(0);
      });

      test("No.2 [正常系] パラメータが渡されないこと", async () => {
        const response = await getNewsService.validate({});
        expect(response.length).toBe(0);
      });

      test("No.3 [異常系] 有効範囲外の値（0, 5）が渡されること", async () => {
        const response0 = await getNewsService.validate({ category: "0" });
        expect(response0.length).toBeGreaterThan(0);
        expect(response0[0].constraints).toHaveProperty("isIn");
        expect(response0[0].constraints.isIn).toBe(ValidationMsg.category.invalidFormat);

        const response5 = await getNewsService.validate({ category: "5" });
        expect(response5.length).toBeGreaterThan(0);
        expect(response5[0].constraints).toHaveProperty("isIn");
        expect(response5[0].constraints.isIn).toBe(ValidationMsg.category.invalidFormat);
      });

      test("No.4 [異常系] 型が異なる値（\"a\", true）が渡されること", async () => {
        const responseA = await getNewsService.validate({ category: "a" });
        expect(responseA.length).toBeGreaterThan(0);
        expect(responseA[0].constraints).toHaveProperty("isInt");
        expect(responseA[0].constraints.isInt).toBe(ValidationMsg.category.notInt);

        const responseTrue = await getNewsService.validate({ category: "true" });
        expect(responseTrue.length).toBeGreaterThan(0);
        expect(responseTrue[0].constraints).toHaveProperty("isInt");
      });
    });

    describe("limitパラメータ", () => {
      test("No.5 [正常系] 有効な値（0, 500, 1000）が渡されること", async () => {
        const response0 = await getNewsService.validate({ limit: "0" });
        expect(response0.length).toBe(0);

        const response500 = await getNewsService.validate({ limit: "500" });
        expect(response500.length).toBe(0);

        const response1000 = await getNewsService.validate({ limit: "1000" });
        expect(response1000.length).toBe(0);
      });

      test("No.6 [正常系] パラメータが渡されないこと", async () => {
        const response = await getNewsService.validate({});
        expect(response.length).toBe(0);
      });

      test("No.7 [異常系] 有効範囲外の値（-1, 1001）が渡されること", async () => {
        const responseMinus1 = await getNewsService.validate({ limit: "-1" });
        expect(responseMinus1.length).toBeGreaterThan(0);
        expect(responseMinus1[0].constraints).toHaveProperty("min");
        expect(responseMinus1[0].constraints.min).toBe(ValidationMsg.limit.invalidFormat);

        const response1001 = await getNewsService.validate({ limit: "1001" });
        expect(response1001.length).toBeGreaterThan(0);
        expect(response1001[0].constraints).toHaveProperty("max");
        expect(response1001[0].constraints.max).toBe(ValidationMsg.limit.invalidFormat);
      });

      test("No.8 [異常系] 型が異なる値（\"a\", true）が渡されること", async () => {
        const responseA = await getNewsService.validate({ limit: "a" });
        expect(responseA.length).toBeGreaterThan(0);
        expect(responseA[0].constraints).toHaveProperty("isInt");
        expect(responseA[0].constraints.isInt).toBe(ValidationMsg.limit.notInt);

        const responseTrue = await getNewsService.validate({ limit: "true" });
        expect(responseTrue.length).toBeGreaterThan(0);
        expect(responseTrue[0].constraints).toHaveProperty("isInt");
      });
    });

    describe("offsetパラメータ", () => {
      test("No.9 [正常系] 有効な値（0, 100）が渡されること", async () => {
        const response0 = await getNewsService.validate({ offset: "0" });
        expect(response0.length).toBe(0);

        const response100 = await getNewsService.validate({ offset: "100" });
        expect(response100.length).toBe(0);
      });

      test("No.10 [正常系] パラメータが渡されないこと", async () => {
        const response = await getNewsService.validate({});
        expect(response.length).toBe(0);
      });

      test("No.11 [異常系] 有効範囲外の値（-1）が渡されること", async () => {
        const responseMinus1 = await getNewsService.validate({ offset: "-1" });
        expect(responseMinus1.length).toBeGreaterThan(0);
        expect(responseMinus1[0].constraints).toHaveProperty("min");
        expect(responseMinus1[0].constraints.min).toBe(ValidationMsg.offset.invalidFormat);
      });

      test("No.12 [異常系] 型が異なる値（\"a\", true）が渡されること", async () => {
        const responseA = await getNewsService.validate({ offset: "a" });
        expect(responseA.length).toBeGreaterThan(0);
        expect(responseA[0].constraints).toHaveProperty("isInt");
        expect(responseA[0].constraints.isInt).toBe(ValidationMsg.offset.notInt);

        const responseTrue = await getNewsService.validate({ offset: "true" });
        expect(responseTrue.length).toBeGreaterThan(0);
        expect(responseTrue[0].constraints).toHaveProperty("isInt");
      });
    });
  });

  describe("Repository テスト", () => {
    test("No.1 [正常系] パラメータ指定なしでgetNewsを呼び出した場合、全件取得できること", async () => {
      const result = await newsRepository.getNews();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(10); // 10件投入したので10件返る
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("title");
      expect(result[0]).toHaveProperty("category");
      expect(result[0]).toHaveProperty("date");
      expect(result[0]).toHaveProperty("thumbnailPath");
    });

    test("No.2 [正常系] categoryを指定してgetNewsを呼び出した場合、絞り込みができること", async () => {
      const result = await newsRepository.getNews("1");

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5); // category=1は5件
      result.forEach((news) => {
        expect(news.category).toBe(1);
      });
    });

    test("No.3 [正常系] limit, offsetを指定してgetNewsを呼び出した場合、ページネーションができること", async () => {
      const result = await newsRepository.getNews(undefined, "3", "2");

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3); // limit=3なので3件返る
      // offsetが2なので、3番目から5番目のデータが取得される（日付降順）
    });

    test("No.4 [正常系] 該当データが存在しない場合、空配列が返ること", async () => {
      const result = await newsRepository.getNews("4");

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0); // category=4のデータは投入していないので0件
    });

    test("No.5 [正常系] countNewsを呼び出した場合、総件数が取得できること", async () => {
      const result = await newsRepository.countNews();

      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
      expect(result).toBe(10); // 10件投入したので10
    });

    test("No.6 [正常系] categoryを指定してcountNewsを呼び出した場合、絞り込んだ総件数が取得できること", async () => {
      const result = await newsRepository.countNews("1");

      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
      expect(result).toBe(5); // category=1は5件
    });
  });

  describe("インテグレーションテスト", () => {
    test("No.1 [正常系] パラメータなしでリクエストした場合、200 OK とお知らせ情報全件が返ってくること", async () => {
      const response = await request(app).get("/news");

      expect(response.status).toBe(HttpStatus.OK.code);
      expect(response.body).toHaveProperty("totalcount");
      expect(response.body).toHaveProperty("count");
      expect(response.body).toHaveProperty("news");
      expect(Array.isArray(response.body.news)).toBe(true);
      expect(response.body.totalcount).toBe(10);
      expect(response.body.count).toBe(10);
      expect(response.body.news.length).toBe(10);
    });

    test("No.2 [正常系] 有効なクエリパラメータ付きでリクエストした場合、200 OK と絞り込まれたお知らせ情報が返ってくること", async () => {
      const response = await request(app).get("/news?category=1&limit=3");

      expect(response.status).toBe(HttpStatus.OK.code);
      expect(response.body).toHaveProperty("totalcount");
      expect(response.body).toHaveProperty("count");
      expect(response.body).toHaveProperty("news");
      expect(response.body.totalcount).toBe(5); // category=1の総件数
      expect(response.body.count).toBe(3); // limit=3で取得した件数
      expect(response.body.news.length).toBe(3);
      response.body.news.forEach((news: any) => {
        expect(news.category).toBe(1);
      });
    });

    test("No.3 [異常系] 無効なクエリパラメータでリクエストした場合、400 エラーが返ってくること", async () => {
      const response = await request(app).get("/news?category=a");

      expect(response.status).toBe(HttpStatus.BAD_REQUEST.code);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("detail");
      expect(response.body.message).toBe(HttpStatus.BAD_REQUEST.message);
      expect(response.body.detail).toContain("Validation failed");
    });

    test("No.4 [異常系] DB接続自体に失敗した場合、500 エラーが返ってくること", async () => {
      // newsRepository.getNews()が例外をスローするようにモックする
      const getNewsSpy = vi
        .spyOn(NewsRepository.prototype, "getNews")
        .mockRejectedValue(new Error("DB connection error"));

      const response = await request(app).get("/news");

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR.code);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe(HttpStatus.INTERNAL_SERVER_ERROR.message);

      // モックをリストア
      getNewsSpy.mockRestore();
    });
  });
});
