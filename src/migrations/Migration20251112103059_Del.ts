import { Migration } from '@mikro-orm/migrations';

export class Migration20251112103059_Del extends Migration {
    override up(): void {
        this.addSql(`alter type "chat_type_enum" add value if not exists 'is_dialogue' after 'is_system';`);

        this.addSql(
            `alter table "chat_keys" add constraint "chat_keys_chat_id_foreign" foreign key ("chat_id") references "chats" ("id") on update cascade;`,
        );

        this.addSql(
            `alter type "message_type_enum" add value if not exists 'is_created_dialogues' after 'is_created_chat';`,
        );
    }

    override down(): void {
        this.addSql(`alter table "chat_keys" drop constraint "chat_keys_chat_id_foreign";`);
    }
}
