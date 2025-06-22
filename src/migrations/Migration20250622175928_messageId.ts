import { Migration } from '@mikro-orm/migrations';

export class Migration20250622175928_messageId extends Migration {
    up(): void {
        this.addSql(
            'alter table "messages" add constraint "messages_chat_id_foreign" foreign key ("chat_id") references "chats" ("id") on update cascade;',
        );
        this.addSql(
            'alter table "messages" add constraint "messages_parent_message_id_foreign" foreign key ("parent_message_id") references "messages" ("id") on update cascade on delete set null;',
        );

        this.addSql('alter table "files" add column "message_id" uuid null;');
        this.addSql(
            'alter table "files" add constraint "files_message_id_foreign" foreign key ("message_id") references "messages" ("id") on update cascade on delete set null;',
        );
    }

    down(): void {
        this.addSql('alter table "files" drop constraint "files_message_id_foreign";');

        this.addSql('alter table "messages" drop constraint "messages_chat_id_foreign";');
        this.addSql('alter table "messages" drop constraint "messages_parent_message_id_foreign";');

        this.addSql('alter table "files" drop column "message_id";');
    }
}
