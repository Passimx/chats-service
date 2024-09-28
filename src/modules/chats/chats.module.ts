import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ChatsService } from './services/chats.service';
import { ChatEntity } from './entities/chat.entity';
import { MessageEntity } from './entities/message.entity';
import { ChatsController } from './chats.controller';

@Module({
    imports: [MikroOrmModule.forFeature([ChatEntity, MessageEntity])],
    providers: [ChatsService],
    controllers: [ChatsController],
})
export class ChatsModule {}
