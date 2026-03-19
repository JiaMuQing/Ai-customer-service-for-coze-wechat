import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionService } from './session.service';

@Controller('session')
@UseGuards(AuthGuard('jwt'))
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Get('messages')
  listMessages(
    @Query('wecomChatId') wecomChatId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listForAdmin(
      wecomChatId || undefined,
      limit ? parseInt(limit, 10) : 100,
    );
  }
}
