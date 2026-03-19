import { Module } from '@nestjs/common';
import { WecomController } from './wecom.controller';
import { WecomService } from './wecom.service';
import { GroupBindingModule } from '../group-binding/group-binding.module';
import { CozeModule } from '../coze/coze.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [GroupBindingModule, CozeModule, SessionModule],
  controllers: [WecomController],
  providers: [WecomService],
})
export class WecomModule {}
