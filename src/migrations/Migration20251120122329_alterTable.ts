import { Migration } from '@mikro-orm/migrations';

export class Migration20251120122329_alterTable extends Migration {
    override up(): void {
        this.addSql(
            `alter table "chat_keys" add constraint "chat_keys_public_key_hash_foreign" foreign key ("public_key_hash") references "public_keys" ("public_key_hash") on update cascade;`,
        );
        this.addSql(`alter table "public_keys" add column "name" varchar(32) not null;`);
    }

    override down(): void {
        this.addSql(`alter table "public_keys" drop column "name";`);
        this.addSql(`alter table "chat_keys" drop constraint "chat_keys_public_key_hash_foreign";`);
    }
}
