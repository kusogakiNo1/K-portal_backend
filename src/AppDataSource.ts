// data-source.ts
import * as dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";
import { Member } from "./entity/Member";
import { MemberTag } from "./entity/MemberTag";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER_NAME,
  password: process.env.DB_USER_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Member, MemberTag],
  synchronize: true, // 本番では false にすること！
});
