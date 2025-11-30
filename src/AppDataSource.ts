// data-source.ts
import * as dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";
import { Member } from "./entity/Member";
import { MemberTag } from "./entity/MemberTag";
import { News } from "./entity/News";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER_NAME,
  password: process.env.DB_USER_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Member, MemberTag, News],
  synchronize: false, // 本番では false にすること！
});
