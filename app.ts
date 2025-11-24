import * as dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
console.log("🐯 app.ts started");

import express from "express";
import { Request } from "express";
import cors from "cors";
import { AppDataSource } from "./src/AppDataSource";
import { HttpError } from "./src/error/HttpError";
import { throwValidationError } from "./src/util/ErrorUtils";
import { HttpStatus } from "./src/constants/HttpStatus";
import { GetAllMembersService, GetNewsService } from "./src/service";

export const app = express();

// CORS周りの設定
const corsOptions = {
  origin: "http://localhost:3000", // 許可するオリジン
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 許可するHTTPメソッド
  credentials: true, // Cookieなどの認証情報を許可するか
  allowedHeaders: "Content-Type,Authorization", // 許可するリクエストヘッダー
};
app.use(cors(corsOptions));

const getAllMembersService = new GetAllMembersService();
const getNewsService = new GetNewsService();

app.listen(Number(process.env.PORT), () => {
  console.log(`🥛 Server listening on port ${process.env.PORT}`);
});

// このミドルウェアを使わないとボディがパースされない
app.use(express.json());

// ヘルスチェック
app.get("/health", (req, res) => {
  res.send("Hello Kusogaki!");
});

// DB接続
if (!AppDataSource.isInitialized) {
  AppDataSource.initialize().catch((err) => {
    console.error("DB接続失敗:", err);
  });
}

// DB接続チェック
app.get("/health/db", (req, res) => {
  res.send("DB is Healthy!");
});

// 以下、APIエンドポイントたち

// メンバー情報全件取得API
app.get("/members", async (req, res, next) => {
  try {
    // バリデーション確認は無し（仕様上、渡されるパラメータが無いので）
    // 本処理
    const result = await getAllMembersService.getAllMembers();

    // レスポンスを返す
    res.status(HttpStatus.OK.code).json(result);
  } catch (err) {
    next(err);
  }
});

// お知らせ情報取得API
app.get("/news", async (req, res, next) => {
  try {
    // バリデーション確認
    const { category, limit, offset } = req.query;
    const validationResult = await getNewsService.validate({
      category,
      limit,
      offset,
    });
    if (validationResult.validationErrors.length > 0)
      // バリデーションエラーをthrow！
      throwValidationError(validationResult.validationErrors);

    // 本処理
    const result = await getNewsService.getNews(
      validationResult.params.category,
      validationResult.params.limit,
      validationResult.params.offset
    );

    // レスポンスを返す
    res.status(HttpStatus.OK.code).json(result);
  } catch (err) {
    next(err);
  }
});

// DB切断
if (AppDataSource.isInitialized) {
  AppDataSource.destroy().catch((err) => {
    console.error("DB切断失敗:", err);
  });
}

// エラー処理用ミドルウェア
app.use((err: HttpError, req, res, next) => {
  console.error(err);
  return res
    .status(err.statusCode)
    .json({ message: err.message, detail: err.detail });
});
