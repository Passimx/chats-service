import { Migration } from '@mikro-orm/migrations';

export class Migration20250326083922_Init extends Migration {
    up(): void {
        this.addSql('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
        this.addSql('CREATE EXTENSION IF NOT EXISTS btree_gin;');
        this.addSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        this.addSql(
            "create type \"chat_type_enum\" as enum ('is_open', 'is_shared', 'is_public', 'is_private', 'is_system');",
        );
        this.addSql("create type \"message_type_enum\" as enum ('is_system', 'is_user', 'is_created_chat');");
        this.addSql(
            'create table "chats" ("id" uuid not null default uuid_generate_v4(), "created_at" timestamptz not null default now(), "title" varchar(255) not null, "count_messages" int not null default 0, "type" "chat_type_enum" not null default \'is_open\', "max_users_online" int not null default 1, constraint "chats_pkey" primary key ("id"));',
        );
        this.addSql('create index "chats_title_index" on "chats" using GIN ("title");');
        this.addSql(
            'create table "messages" ("id" uuid not null default uuid_generate_v4(), "created_at" timestamptz not null default now(), "encrypt_message" varchar(1000) null, "chat_id" uuid not null, "number" int not null, "message" varchar(4096) null, "parent_message_id" uuid null, "type" "message_type_enum" null, constraint "messages_pkey" primary key ("id"));',
        );
        this.addSql('create index "messages_message_index" on "messages" ("message");');
        this.addSql('create index "messages_chat_id_number_index" on "messages" using btree ("chat_id", "number");');
        this.addSql(`
            INSERT INTO "chats" (title, count_messages, type, max_users_online)
            VALUES ('PassimX', 1, 'is_system', 1);
        `);
        this.addSql(`
            INSERT INTO "messages" (chat_id, number, type, encrypt_message, message, parent_message_id)
            VALUES ((SELECT id FROM "chats" WHERE title = 'PassimX' AND type = 'is_system'),
                    1,
                    'is_system',
                    NULL,
                    'message_hello',
                    NULL);
        `);
    }

    down(): void {
        this.addSql(`
            DELETE
            FROM "messages"
            WHERE chat_id = (SELECT id FROM "chats" WHERE title = 'PassimX' AND type = 'is_system')
              AND number = 1
              AND type = 'IS_USER'
              AND message = 'message_hello';
        `);
        this.addSql(`
            DELETE
            FROM "chats"
            WHERE title = 'PassimX'
              AND type = 'is_system';
        `);
        this.addSql('drop table if exists "chats" cascade;');
        this.addSql('drop table if exists "messages" cascade;');
        this.addSql('drop type "chat_type_enum";');
        this.addSql('drop type "message_type_enum";');
        this.addSql('drop EXTENSION IF EXISTS uuid-ossp;');
        this.addSql('drop EXTENSION IF EXISTS btree_gin;');
        this.addSql('drop EXTENSION IF EXISTS pg_trgm;');
    }
}
