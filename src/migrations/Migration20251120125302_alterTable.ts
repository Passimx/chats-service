import { Migration } from '@mikro-orm/migrations';

export class Migration20251120125302_alterTable extends Migration {
    override up(): void {
        this.addSql(`alter table "public_keys" alter column "name" type varchar(128) using ("name"::varchar(128));`);
    }

    override down(): void {
        this.addSql(`alter table "public_keys" alter column "name" type varchar(32) using ("name"::varchar(32));`);
    }
}
