import { Migration } from '@mikro-orm/migrations';

export class Migration20251112191445_Del extends Migration {
    override up(): void {
        this.addSql(
            `create table "public_keys" ("public_key_hash" varchar(128) not null, "public_key" varchar(4096) not null, constraint "public_keys_pkey" primary key ("public_key_hash"));`,
        );
        this.addSql(
            `create index "public_keys_public_key_hash_index" on "public_keys" using hash ("public_key_hash");`,
        );

        this.addSql(
            `alter table "chat_keys" alter column "public_key_hash" type varchar(128) using ("public_key_hash"::varchar(128));`,
        );
        this.addSql(
            `alter table "chat_keys" alter column "encryption_key" type varchar(4096) using ("encryption_key"::varchar(4096));`,
        );
    }

    override down(): void {
        this.addSql(`drop table if exists "public_keys" cascade;`);

        this.addSql(
            `alter table "chat_keys" alter column "public_key_hash" type varchar(255) using ("public_key_hash"::varchar(255));`,
        );
        this.addSql(
            `alter table "chat_keys" alter column "encryption_key" type varchar(255) using ("encryption_key"::varchar(255));`,
        );
    }
}
