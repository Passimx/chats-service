import { Migration } from '@mikro-orm/migrations';

export class Migration20250622190742_files extends Migration {
    up(): void {
        this.addSql(
            'create table "files" ("id" uuid not null default uuid_generate_v4(), "created_at" timestamptz not null default now(), "original_name" varchar(255) not null, "size" int not null, "mime_type" varchar(255) not null, "message_id" uuid null, constraint "files_pkey" primary key ("id"));',
        );
        this.addSql('create index "files_id_index" on "files" using HASH ("id");');

        this.addSql(
            'alter table "files" add constraint "files_message_id_foreign" foreign key ("message_id") references "messages" ("id") on update cascade on delete set null;',
        );

        this.addSql(
            'alter table "messages" add constraint "messages_chat_id_foreign" foreign key ("chat_id") references "chats" ("id") on update cascade;',
        );
        this.addSql(
            'alter table "messages" add constraint "messages_parent_message_id_foreign" foreign key ("parent_message_id") references "messages" ("id") on update cascade on delete set null;',
        );
    }

    down(): void {
        this.addSql('drop table if exists "files" cascade;');

        this.addSql('alter table "messages" drop constraint "messages_chat_id_foreign";');
        this.addSql('alter table "messages" drop constraint "messages_parent_message_id_foreign";');
    }
}
