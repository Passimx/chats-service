import { Migration } from '@mikro-orm/migrations';

export class Migration20241005165003_tables extends Migration {
    up(): void {
        this.addSql(
            'create table "chats" ("id" serial primary key, "created_at" timestamptz not null default now(), "title" varchar(255) not null, "count_messages" int not null default 0, "created_user_id" int null);',
        );

        this.addSql(
            'create table "chat_members" ("id" serial primary key, "created_at" timestamptz not null default now(), "chat_id" int not null, "user_id" int not null, "last_number_message" int not null);',
        );

        this.addSql(
            'create table "messages" ("id" serial primary key, "created_at" timestamptz not null default now(), "encrypt_message" varchar(1000) not null, "chat_id" int not null, "number" int not null, "message" varchar(255) not null);',
        );

        this.addSql(
            'create table "users" ("id" serial primary key, "created_at" timestamptz not null default now(), "password_hash" varchar(255) not null);',
        );
    }

    down(): void {
        this.addSql('drop table if exists "chats" cascade;');

        this.addSql('drop table if exists "chat_members" cascade;');

        this.addSql('drop table if exists "messages" cascade;');

        this.addSql('drop table if exists "users" cascade;');
    }
}
