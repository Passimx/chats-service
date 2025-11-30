import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { QueueModule } from '../queue/queue.module';
import { KeysModule } from '../keys/keys.module';
import { ChatsService } from './services/chats.service';
import { ChatEntity } from './entities/chat.entity';
import { MessageEntity } from './entities/message.entity';
import { ChatsController } from './controllers/chats.controller';
import { MessagesController } from './controllers/messages.controller';
import { MessagesService } from './services/messages.service';
import { FileEntity } from './entities/file.entity';
import { FilesController } from './controllers/files.controller';
import { FilesService } from './services/files.service';

@Module({
    imports: [MikroOrmModule.forFeature([ChatEntity, MessageEntity, FileEntity]), QueueModule, KeysModule],
    providers: [ChatsService, MessagesService, FilesService],
    controllers: [ChatsController, MessagesController, FilesController],
    exports: [MikroOrmModule],
})
export class ChatsModule {}
