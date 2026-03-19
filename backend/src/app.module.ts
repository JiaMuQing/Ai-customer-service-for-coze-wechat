import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { WecomModule } from './wecom/wecom.module';
import { CozeModule } from './coze/coze.module';
import { GroupBindingModule } from './group-binding/group-binding.module';
import { SessionModule } from './session/session.module';
import { GroupBinding } from './group-binding/entities/group-binding.entity';
import { ConversationMessage } from './session/entities/conversation-message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USERNAME ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_DATABASE ?? 'ai_customer_service',
      entities: [GroupBinding, ConversationMessage],
      synchronize: true,
    }),
    AuthModule,
    WecomModule,
    CozeModule,
    GroupBindingModule,
    SessionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
