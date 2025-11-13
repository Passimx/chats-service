import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { QueueModule } from '../queue/queue.module';
import { ChatsService } from './services/chats.service';
import { DialoguesService } from './services/dialogues.service';
import { ChatEntity } from './entities/chat.entity';
import { MessageEntity } from './entities/message.entity';
import { ChatKeyEntity } from './entities/chat-key.entity';
import { ChatsController } from './controllers/chats.controller';
import { MessagesController } from './controllers/messages.controller';
import { DialoguesController } from './controllers/dialogues.controller';
import { MessagesService } from './services/messages.service';

@Module({
    imports: [MikroOrmModule.forFeature([ChatEntity, MessageEntity, ChatKeyEntity]), QueueModule],
    providers: [ChatsService, MessagesService, DialoguesService],
    controllers: [ChatsController, MessagesController, DialoguesController],
})
export class ChatsModule {}
