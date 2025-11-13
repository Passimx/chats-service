import { Migration } from '@mikro-orm/migrations';

export class Migration20251113124516_Init extends Migration {
    override up(): void {
        this.addSql('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
        this.addSql('CREATE EXTENSION IF NOT EXISTS btree_gin;');
        this.addSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        this.addSql(
            `create type "chat_type_enum" as enum ('is_open', 'is_shared', 'is_public', 'is_private', 'is_system', 'is_dialogue', 'is_favorites');`,
        );
        this.addSql(`create type "message_type_enum" as enum ('is_system', 'is_user', 'is_created_chat');`);
        this.addSql(`create type "file_type_enum" as enum ('is_voice', 'is_media');`);
        this.addSql(
            `create table "chats" ("id" uuid not null default uuid_generate_v4(), "created_at" timestamptz not null default now(), "title" varchar(255) null, "count_messages" int not null default 0, "type" "chat_type_enum" not null default 'is_open', "max_users_online" int not null default 1, constraint "chats_pkey" primary key ("id"));`,
        );
        this.addSql(`create index "chats_title_index" on "chats" using GIN ("title");`);

        this.addSql(
            `create table "chat_keys" ("id" uuid not null default uuid_generate_v4(), "created_at" timestamptz not null default now(), "public_key_hash" varchar(128) not null, "encryption_key" varchar(4096) not null, "received" boolean not null default false, "chat_id" uuid not null, constraint "chat_keys_pkey" primary key ("id"));`,
        );
        this.addSql(
            `create index "chat_keys_public_key_hash_chat_id_index" on "chat_keys" using btree ("public_key_hash", "chat_id");`,
        );
        this.addSql(
            `alter table "chat_keys" add constraint "chat_keys_chat_id_public_key_hash_unique" unique ("chat_id", "public_key_hash");`,
        );

        this.addSql(
            `create table "messages" ("id" uuid not null default uuid_generate_v4(), "created_at" timestamptz not null default now(), "number" int not null, "message" varchar(4096) null, "type" "message_type_enum" null default 'is_user', "chat_id" uuid not null, "parent_message_id" uuid null, constraint "messages_pkey" primary key ("id"));`,
        );
        this.addSql(`create index "messages_message_index" on "messages" ("message");`);
        this.addSql(`create index "messages_chat_id_number_index" on "messages" using btree ("chat_id", "number");`);

        this.addSql(
            `create table "files" ("id" uuid not null default uuid_generate_v4(), "created_at" timestamptz not null default now(), "key" varchar(255) not null, "original_name" varchar(255) not null, "size" int not null, "mime_type" varchar(255) not null, "file_type" "file_type_enum" not null, "metadata" jsonb null, "message_id" uuid null, "chat_id" uuid null, constraint "files_pkey" primary key ("id"));`,
        );
        this.addSql(`create index "files_id_index" on "files" using HASH ("id");`);

        this.addSql(
            `create table "public_keys" ("public_key_hash" varchar(128) not null, "public_key" varchar(4096) not null, constraint "public_keys_pkey" primary key ("public_key_hash"));`,
        );
        this.addSql(
            `create index "public_keys_public_key_hash_index" on "public_keys" using hash ("public_key_hash");`,
        );

        this.addSql(
            `alter table "chat_keys" add constraint "chat_keys_chat_id_foreign" foreign key ("chat_id") references "chats" ("id") on update cascade;`,
        );

        this.addSql(
            `alter table "messages" add constraint "messages_chat_id_foreign" foreign key ("chat_id") references "chats" ("id") on update cascade;`,
        );
        this.addSql(
            `alter table "messages" add constraint "messages_parent_message_id_foreign" foreign key ("parent_message_id") references "messages" ("id") on update cascade on delete set null;`,
        );

        this.addSql(
            `alter table "files" add constraint "files_message_id_foreign" foreign key ("message_id") references "messages" ("id") on update cascade on delete set null;`,
        );
        this.addSql(
            `alter table "files" add constraint "files_chat_id_foreign" foreign key ("chat_id") references "chats" ("id") on update cascade on delete set null;`,
        );
    }

    override down(): void {
        this.addSql(`alter table "chat_keys" drop constraint "chat_keys_chat_id_foreign";`);

        this.addSql(`alter table "messages" drop constraint "messages_chat_id_foreign";`);

        this.addSql(`alter table "files" drop constraint "files_chat_id_foreign";`);

        this.addSql(`alter table "messages" drop constraint "messages_parent_message_id_foreign";`);

        this.addSql(`alter table "files" drop constraint "files_message_id_foreign";`);

        this.addSql(`drop table if exists "chats" cascade;`);

        this.addSql(`drop table if exists "chat_keys" cascade;`);

        this.addSql(`drop table if exists "messages" cascade;`);

        this.addSql(`drop table if exists "files" cascade;`);

        this.addSql(`drop table if exists "public_keys" cascade;`);

        this.addSql(`drop type "chat_type_enum";`);
        this.addSql(`drop type "message_type_enum";`);
        this.addSql(`drop type "file_type_enum";`);
        this.addSql('drop EXTENSION IF EXISTS uuid-ossp;');
        this.addSql('drop EXTENSION IF EXISTS btree_gin;');
        this.addSql('drop EXTENSION IF EXISTS pg_trgm;');
    }
}
