import { Module } from '@nestjs/common';
import { getMikroOrmModule } from '../common/config/mikro-orm/mikro-orm.module';
import { MigrationService } from '../common/config/mikro-orm/migration.service';
import { ChatsModule } from './chats/chats.module';
import { KeysModule } from './keys/keys.module';

@Module({
    imports: [getMikroOrmModule(), ChatsModule, KeysModule],
    providers: [MigrationService],
})
export class AppModule {}
