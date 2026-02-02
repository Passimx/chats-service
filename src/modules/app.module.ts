import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { getMikroOrmModule } from '../common/config/mikro-orm/mikro-orm.module';
import { MigrationService } from '../common/config/mikro-orm/migration.service';
import { AuthGuard } from '../common/guards/auth/auth.guard';
import { ChatsModule } from './chats/chats.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [getMikroOrmModule(), UsersModule, ChatsModule, AuthModule],
    providers: [MigrationService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
