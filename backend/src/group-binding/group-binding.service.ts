import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupBinding } from './entities/group-binding.entity';

@Injectable()
export class GroupBindingService {
  constructor(
    @InjectRepository(GroupBinding)
    private readonly repo: Repository<GroupBinding>,
  ) {}

  async findByWecomChatId(wecomChatId: string): Promise<GroupBinding | null> {
    return this.repo.findOne({
      where: { wecomChatId, enabled: true },
    });
  }

  async findAll(): Promise<GroupBinding[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async create(dto: {
    wecomChatId: string;
    chatType?: string;
    botId: string;
    remark?: string;
  }): Promise<GroupBinding> {
    const entity = this.repo.create({
      wecomChatId: dto.wecomChatId,
      chatType: dto.chatType ?? 'group',
      botId: dto.botId,
      remark: dto.remark,
    });
    return this.repo.save(entity);
  }

  async update(
    id: number,
    dto: { botId?: string; enabled?: boolean; remark?: string },
  ): Promise<GroupBinding> {
    await this.repo.update(id, dto as Partial<GroupBinding>);
    const one = await this.repo.findOne({ where: { id } });
    if (!one) throw new Error('GroupBinding not found');
    return one;
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
