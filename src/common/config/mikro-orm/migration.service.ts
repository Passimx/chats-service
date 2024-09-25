import { Injectable } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

@Injectable()
export class MigrationService {
    constructor(private readonly orm: MikroORM) {}

    async migrate() {
        const migrator = this.orm.getMigrator();
        await migrator.up();
    }
}
