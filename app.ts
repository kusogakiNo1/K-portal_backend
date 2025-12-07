import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();
console.log("🐯 app.ts started");

import express from "express";
import cors from "cors";
import { supabase } from "./src/supabaseClient";
import { HttpError } from "./src/error/HttpError";
import { throwValidationError } from "./src/util/ErrorUtils";
import { HttpStatus } from "./src/constants/HttpStatus";
import { GetAllMembersService, GetNewsService } from "./src/service";
import { GetNewsDetailService } from "./src/service/news/GetNewsDetailService";

export const app = express();

// CORS周りの設定
const corsOptions = {
  origin: "http://localhost:3000", // 許可するオリジン
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // 許可するHTTPメソッド
  credentials: true, // Cookieなどの認証情報を許可するか
  allowedHeaders: "Content-Type,Authorization", // 許可するリクエストヘッダー
};
app.use(cors(corsOptions));

app.listen(Number(process.env.PORT), () => {
  console.log(`🥛 Server listening on port ${process.env.PORT}`);
});

// このミドルウェアを使わないとボディがパースされない
app.use(express.json());

// ヘルスチェック
app.get("/health", (req, res) => {
  res.send("Hello Kusogaki!");
});

// DB接続チェック (Supabase)
app.get("/health/db", async (req, res) => {
  try {
    const { error } = await supabase
      .from("members")
      .select("count", { count: "exact", head: true });
    if (error) throw error;
    res.send("Supabase DB is Healthy!");
  } catch (err) {
    console.error("DB接続失敗:", err);
    res.status(500).send("DB Connection Failed");
  }
});

// 以下、APIエンドポイントたち

// メンバー情報全件取得API
app.get("/members", async (req, res, next) => {
  try {
    const getAllMembersService = new GetAllMembersService();
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
    const getNewsService = new GetNewsService();
    // バリデーション確認
    const { category, limit, offset } = req.query;
    const validationErrors = await getNewsService.validate({
      category,
      limit,
      offset,
    });
    // 一つでもバリデーションに引っかかっていた場合は、バリデーションエラーをthrow！
    if (validationErrors.length > 0) throwValidationError(validationErrors);

    // 本処理
    const result = await getNewsService.getNews(
      category as string | undefined,
      limit as string | undefined,
      offset as string | undefined
    );

    // レスポンスを返す
    res.status(HttpStatus.OK.code).json(result);
  } catch (err) {
    next(err);
  }
});

// お知らせ詳細情報取得API
app.get("/news/:id", async (req, res, next) => {
  try {
    const getNewsDetailService = new GetNewsDetailService();
    // バリデーション確認
    const { id } = req.params;
    const validationErrors = await getNewsDetailService.validate({ id });
    // 一つでもバリデーションに引っかかっていた場合は、バリデーションエラーをthrow！
    if (validationErrors.length > 0) throwValidationError(validationErrors);

    // 本処理
    const result = await getNewsDetailService.getNewsDetail(id);

    // レスポンスを返す
    res.status(HttpStatus.OK.code).json(result);
  } catch (err) {
    next(err);
  }
});

// エラー処理用ミドルウェア
app.use((err: HttpError, req, res, next) => {
  console.error(err);
  if (
    !err.statusCode ||
    err.statusCode == null ||
    !(typeof err.statusCode === "number")
  ) {
    // stasusコードがない時（ネットワークエラー時など）は500に丸める
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).json({
      message: HttpStatus.INTERNAL_SERVER_ERROR.message,
      detail: err.detail,
    });
  }
  return res
    .status(err.statusCode)
    .json({ message: err.message, detail: err.detail });
});
