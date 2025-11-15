import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { QueueModule } from '../queue/queue.module';
import { ChatsService } from './services/chats.service';
import { ChatEntity } from './entities/chat.entity';
import { MessageEntity } from './entities/message.entity';
import { FileEntity } from './entities/file.entity';
import { ChatsController } from './controllers/chats.controller';
import { MessagesController } from './controllers/messages.controller';
import { TranscriptionController } from './controllers/transcription.controller';
import { MessagesService } from './services/messages.service';
import { TranscriptionService } from './services/transcription.service';

@Module({
    imports: [MikroOrmModule.forFeature([ChatEntity, MessageEntity, FileEntity]), QueueModule],
    providers: [ChatsService, MessagesService, TranscriptionService],
    controllers: [ChatsController, MessagesController, TranscriptionController],
})
export class ChatsModule {}
