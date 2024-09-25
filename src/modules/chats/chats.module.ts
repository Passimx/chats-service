import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ChatsService } from './services/chats.service';
import { ChatEntity } from './entities/chat.entity';
import { MessageEntity } from './entities/message.entity';

@Module({
    imports: [MikroOrmModule.forFeature([ChatEntity, MessageEntity])],
    providers: [ChatsService],
})
export class ChatsModule {}
