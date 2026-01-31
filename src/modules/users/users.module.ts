import { forwardRef, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ChatsModule } from '../chats/chats.module';
import { QueueModule } from '../queue/queue.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from './entities/user.entity';
import { SessionEntity } from './entities/session.entity';

@Module({
    imports: [forwardRef(() => ChatsModule), MikroOrmModule.forFeature([UserEntity, SessionEntity]), QueueModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService, MikroOrmModule],
})
export class UsersModule {}
