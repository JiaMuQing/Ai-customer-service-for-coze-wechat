import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('conversation_message')
export class ConversationMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  /** WeCom chat id (group or single) */
  @Column({ length: 128 })
  wecomChatId!: string;

  /** WeCom user id (sender) */
  @Column({ length: 128 })
  wecomUserId!: string;

  /** Coze conversation_id for context */
  @Column({ length: 128, nullable: true })
  cozeConversationId?: string;

  /** role: user | assistant */
  @Column({ length: 32 })
  role!: string;

  @Column({ type: 'text' })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
