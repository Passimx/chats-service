import { Migration } from '@mikro-orm/migrations';

export class Migration20251026104416_AddTableChatKeys extends Migration {
    up(): void {
        this.addSql(
            'create table "chat_keys" ("id" uuid not null default uuid_generate_v4(), "created_at" timestamptz not null default now(), "chat_id" uuid not null, "public_key" varchar(255) not null, "encryption_key" varchar(255) not null, "received" boolean not null default false, constraint "chat_keys_pkey" primary key ("id"));',
        );
        this.addSql(
            'create index "chat_keys_public_key_chat_id_index" on "chat_keys" using btree ("public_key", "chat_id");',
        );
        this.addSql(
            'alter table "chat_keys" add constraint "chat_keys_chat_id_public_key_unique" unique ("chat_id", "public_key");',
        );

        this.addSql('alter table "chats" alter column "title" type varchar(255) using ("title"::varchar(255));');
        this.addSql('alter table "chats" alter column "title" drop not null;');
    }

    down(): void {
        this.addSql('drop table if exists "chat_keys" cascade;');

        this.addSql('alter table "chats" alter column "title" type varchar(255) using ("title"::varchar(255));');
        this.addSql('alter table "chats" alter column "title" set not null;');
    }
}
