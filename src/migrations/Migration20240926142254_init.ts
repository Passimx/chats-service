import { Migration } from '@mikro-orm/migrations';

export class Migration20240926142254_init extends Migration {
    up(): void {
        this.addSql(
            'create table "chats" ("id" serial primary key, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "title" varchar(255) null);',
        );

        this.addSql(
            'create table "messages" ("id" serial primary key, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now());',
        );

        this.addSql(
            'create table "users" ("id" serial primary key, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now());',
        );
    }

    down(): void {
        this.addSql('drop table if exists "chats" cascade;');

        this.addSql('drop table if exists "messages" cascade;');

        this.addSql('drop table if exists "users" cascade;');
    }
}
