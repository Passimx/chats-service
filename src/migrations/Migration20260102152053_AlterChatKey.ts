import { Migration } from '@mikro-orm/migrations';

export class Migration20260102152053_AlterChatKey extends Migration {
    override up(): void {
        this.addSql(`alter table "chat_keys" add column "read_message_number" int not null default 0;`);
        this.addSql(`alter table "chat_keys" add column "is_member" boolean not null default true;`);
    }

    override down(): void {
        this.addSql(`alter table "chat_keys" drop column "is_member";`);
        this.addSql(`alter table "chat_keys" drop column "read_message_number";`);
    }
}
