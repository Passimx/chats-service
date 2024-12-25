import { Migration } from '@mikro-orm/migrations';

export class Migration20241224192916_changed_id_to_uuid extends Migration {
    up(): void {
        this.addSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        this.addSql('alter table "messages" alter column "chat_id" drop default;');
        this.addSql('alter table "messages" alter column "chat_id" type uuid using ("chat_id"::text::uuid);');
        this.addSql('alter table "messages" alter column "parent_message_id" drop default;');
        this.addSql(
            'alter table "messages" alter column "parent_message_id" type uuid using ("parent_message_id"::text::uuid);',
        );

        this.addSql('drop table if exists "chat_members" cascade;');

        this.addSql('drop table if exists "users" cascade;');

        this.addSql('alter table "chats" alter column "id" drop default;');
        this.addSql('alter table "chats" alter column "id" type uuid using ("id"::text::uuid);');
        this.addSql('alter table "chats" alter column "id" set default uuid_generate_v4();');

        this.addSql('alter table "messages" alter column "id" drop default;');
        this.addSql('alter table "messages" alter column "id" type uuid using ("id"::text::uuid);');
        this.addSql('alter table "messages" alter column "id" set default uuid_generate_v4();');
    }

    down(): void {
        this.addSql(
            'create table "chat_members" ("id" serial primary key, "created_at" timestamptz(6) not null default now(), "chat_id" int4 not null, "user_id" int4 not null, "last_number_message" int4 not null);',
        );

        this.addSql(
            'create table "users" ("id" serial primary key, "created_at" timestamptz(6) not null default now(), "password_hash" varchar(255) not null);',
        );

        this.addSql('alter table "chats" alter column "id" type text using ("id"::text);');

        this.addSql('alter table "messages" alter column "id" type text using ("id"::text);');

        this.addSql('alter table "chats" alter column "id" drop default;');
        this.addSql('alter table "chats" alter column "id" type int4 using ("id"::int4);');
        this.addSql('create sequence if not exists "chats_id_seq";');
        this.addSql('select setval(\'chats_id_seq\', (select max("id") from "chats"));');
        this.addSql('alter table "chats" alter column "id" set default nextval(\'chats_id_seq\');');

        this.addSql('alter table "messages" alter column "id" drop default;');
        this.addSql('alter table "messages" alter column "id" type int4 using ("id"::int4);');
        this.addSql('create sequence if not exists "messages_id_seq";');
        this.addSql('select setval(\'messages_id_seq\', (select max("id") from "messages"));');
        this.addSql('alter table "messages" alter column "id" set default nextval(\'messages_id_seq\');');

        this.addSql('alter table "messages" alter column "chat_id" type text using ("chat_id"::text);');
        this.addSql(
            'alter table "messages" alter column "parent_message_id" type text using ("parent_message_id"::text);',
        );

        this.addSql('alter table "messages" alter column "chat_id" type varchar(255) using ("chat_id"::varchar(255));');
        this.addSql(
            'alter table "messages" alter column "parent_message_id" type varchar(255) using ("parent_message_id"::varchar(255));',
        );
        this.addSql('DROP EXTENSION IF EXISTS "uuid-ossp";');
    }
}
