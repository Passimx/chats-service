import { Migration } from '@mikro-orm/migrations';

export class Migration20250314113139_typeInChats extends Migration {
    up(): void {
        this.addSql(
            "create type \"chat_type_enum\" as enum ('is_open', 'is_shared', 'is_public', 'is_private', 'is_system');",
        );
        this.addSql('alter table "chats" add column "type" "chat_type_enum" not null default \'is_open\';');
    }

    down(): void {
        this.addSql('alter table "chats" drop column "type";');

        this.addSql('drop type "chat_type_enum";');
    }
}
