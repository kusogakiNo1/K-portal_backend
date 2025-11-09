import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Member } from "./Member";

@Entity("member_tags")
export class MemberTag {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", name: "member_id", nullable: false })
  memberId!: number;

  @Column({ type: "varchar", name: "name", length: 30, nullable: false })
  name!: string;

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

  // 外部キーの設定 (members:member_tags = 多:1)
  @ManyToOne(() => Member, (member) => member.id)
  // 外部キーとして使用するカラムを TypeORM に指定
  @JoinColumn({ name: "member_id" })
  member!: Member; // memberTag.member.nameみたいなノリで、そのメンバーidの名前を参照できるようになるっぽい。
}
