import { forwardRef, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ChatsModule } from '../chats/chats.module';
import { PublicKeyEntity } from './entities/public-key.entity';
import { KeysService } from './keys.service';
import { KeysController } from './keys.controller';
import { ChatKeyEntity } from './entities/chat-key.entity';

@Module({
    imports: [forwardRef(() => ChatsModule), MikroOrmModule.forFeature([PublicKeyEntity, ChatKeyEntity])],
    controllers: [KeysController],
    providers: [KeysService],
    exports: [MikroOrmModule],
})
export class KeysModule {}
