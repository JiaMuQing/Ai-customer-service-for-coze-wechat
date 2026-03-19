import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupBinding } from './entities/group-binding.entity';
import { GroupBindingController } from './group-binding.controller';
import { GroupBindingService } from './group-binding.service';

@Module({
  imports: [TypeOrmModule.forFeature([GroupBinding])],
  controllers: [GroupBindingController],
  providers: [GroupBindingService],
  exports: [GroupBindingService],
})
export class GroupBindingModule {}
