import { Module } from '@nestjs/common';
import { getMikroOrmModule } from '../common/config/mikro-orm/mikro-orm.module';
import { MigrationService } from '../common/config/mikro-orm/migration.service';
import { ChatsModule } from './chats/chats.module';

@Module({
    imports: [getMikroOrmModule(), ChatsModule],
    providers: [MigrationService],
})
export class AppModule {}
