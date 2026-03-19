import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('group_binding')
export class GroupBinding {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Enterprise WeChat group chat id (chatid), or single-chat identifier */
  @Column({ length: 128, unique: true })
  wecomChatId!: string;

  /** group | single */
  @Column({ length: 16, default: 'group' })
  chatType!: string;

  /** Coze Bot ID (same skill = same bot_id in plan) */
  @Column({ length: 64 })
  botId!: string;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ length: 255, nullable: true })
  remark?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
