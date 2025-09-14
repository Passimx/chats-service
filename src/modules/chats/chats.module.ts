import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { QueueModule } from '../queue/queue.module';
import { ChatsService } from './services/chats.service';
import { ChatEntity } from './entities/chat.entity';
import { MessageEntity } from './entities/message.entity';
import { ChatsController } from './controllers/chats.controller';
import { MessagesController } from './controllers/messages.controller';
import { MessagesService } from './services/messages.service';

@Module({
    imports: [MikroOrmModule.forFeature([ChatEntity, MessageEntity]), QueueModule],
    providers: [ChatsService, MessagesService],

    controllers: [ChatsController, MessagesController],
})
export class ChatsModule {}
