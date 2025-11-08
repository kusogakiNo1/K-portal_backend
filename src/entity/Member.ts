import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { MemberTag } from "./MemberTag";

@Entity("members")
export class Member {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", name: "name", length: 15 })
  name!: string;

  @Column({ type: "date", name: "birthday" })
  birthday!: Date;

  @Column({ type: "varchar", name: "image_path" })
  imagePath!: string;

  @Column({ type: "varchar", name: "catch_copy", length: 30 })
  catchCopy!: string;

  @Column({ type: "text", name: "description" })
  description!: string;

  @Column({ type: "varchar", name: "color", length: 7 })
  color!: string;

  @Column({ type: "varchar", name: "accent_color", length: 7 })
  accentColor!: string;

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

  // リレーションの設定
  @OneToMany(() => MemberTag, (memberTag) => memberTag.member)
  tags!: MemberTag[];
}
