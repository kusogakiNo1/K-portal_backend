import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("News")
export class News {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", name: "title", length: 30, nullable: false })
  title!: string;

  /*
  category
  1：お知らせ
  2：イベント
  3：ニュース
  4：その他
  */
  @Column({ type: "tinyint", name: "category", nullable: false })
  category!: number;

  @Column({ type: "date", name: "date", nullable: false })
  date!: Date;

  @Column({
    type: "varchar",
    name: "thumbnail_path",
    length: 255,
    nullable: false,
  })
  thumbnailPath!: string;

  @Column({ type: "text", name: "detail" })
  detail!: string;

  @Column({ type: "boolean", name: "deleted_flag", default: false })
  deletedFlag!: boolean;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    name: "deleted_at",
  })
  deletedAt!: Date;
}
