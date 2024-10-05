import { Module } from '@nestjs/common';
import { getMikroOrmModule } from '../common/config/mikro-orm/mikro-orm.module';
import { MigrationService } from '../common/config/mikro-orm/migration.service';
import { ChatsModule } from './chats/chats.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [getMikroOrmModule(), UsersModule, ChatsModule],
    providers: [MigrationService],
})
export class AppModule {}
