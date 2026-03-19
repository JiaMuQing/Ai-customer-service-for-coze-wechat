import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupBindingService } from './group-binding.service';

@Controller('group-binding')
@UseGuards(AuthGuard('jwt'))
export class GroupBindingController {
  constructor(private readonly service: GroupBindingService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(
    @Body()
    dto: {
      wecomChatId: string;
      chatType?: string;
      botId: string;
      remark?: string;
    },
  ) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { botId?: string; enabled?: boolean; remark?: string },
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
