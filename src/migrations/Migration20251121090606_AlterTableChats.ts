import { Migration } from '@mikro-orm/migrations';

export class Migration20251121090606_AlterTableChats extends Migration {
    override up(): void {
        this.addSql(`alter table "chats" add column "name" varchar(64) null;`);
        this.addSql(`create index "chats_id_index" on "chats" using hash ("name");`);
    }

    override down(): void {
        this.addSql(`drop index "chats_id_index";`);
        this.addSql(`alter table "chats" drop column "name";`);
    }
}
