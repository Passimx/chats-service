import { Module } from '@nestjs/common';
import { getMikroOrmModule } from '../common/config/mikro-orm/mikro-orm.module';
import { MigrationService } from '../common/config/mikro-orm/migration.service';

@Module({
    imports: [getMikroOrmModule()],
    providers: [MigrationService],
})
export class AppModule {}
