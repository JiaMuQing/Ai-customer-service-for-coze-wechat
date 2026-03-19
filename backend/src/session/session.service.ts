import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationMessage } from './entities/conversation-message.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(ConversationMessage)
    private readonly repo: Repository<ConversationMessage>,
  ) {}

  async saveMessage(dto: {
    wecomChatId: string;
    wecomUserId: string;
    cozeConversationId?: string;
    role: 'user' | 'assistant';
    content: string;
  }): Promise<ConversationMessage> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findLastConversationId(
    wecomChatId: string,
    wecomUserId: string,
  ): Promise<string | null> {
    const last = await this.repo.findOne({
      where: { wecomChatId, wecomUserId },
      order: { id: 'DESC' },
    });
    return last?.cozeConversationId ?? null;
  }

  async getRecentMessages(
    wecomChatId: string,
    wecomUserId: string,
    limit: number = 20,
  ): Promise<ConversationMessage[]> {
    return this.repo.find({
      where: { wecomChatId, wecomUserId },
      order: { id: 'DESC' },
      take: limit,
    });
  }

  async listForAdmin(wecomChatId?: string, limit: number = 100) {
    const qb = this.repo
      .createQueryBuilder('m')
      .orderBy('m.id', 'DESC')
      .take(limit);
    if (wecomChatId) {
      qb.andWhere('m.wecomChatId = :wecomChatId', { wecomChatId });
    }
    return qb.getMany();
  }
}
