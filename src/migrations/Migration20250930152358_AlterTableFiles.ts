import { Migration } from '@mikro-orm/migrations';

export class Migration20250930152358_AlterTableFiles extends Migration {
    override up(): void {
        this.addSql(`alter table "files" alter column "chat_id" drop default;`);
        this.addSql(`alter table "files" alter column "chat_id" type uuid using ("chat_id"::text::uuid);`);
        this.addSql(`alter table "files" alter column "chat_id" drop not null;`);
        this.addSql(
            `alter table "files" add constraint "files_chat_id_foreign" foreign key ("chat_id") references "chats" ("id") on update cascade on delete set null;`,
        );
    }

    override down(): void {
        this.addSql(`alter table "files" alter column "chat_id" type text using ("chat_id"::text);`);

        this.addSql(`alter table "files" drop constraint "files_chat_id_foreign";`);

        this.addSql(`alter table "files" alter column "chat_id" type varchar(255) using ("chat_id"::varchar(255));`);
        this.addSql(`alter table "files" alter column "chat_id" set not null;`);
    }
}
