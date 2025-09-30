import { Migration } from '@mikro-orm/migrations';

export class Migration20250930111739_AlterTableFiles extends Migration {
    override up(): void {
        this.addSql(`alter table "files" alter column "id" type text using ("id"::text);`);

        this.addSql(`alter table "files" alter column "id" drop default;`);
        this.addSql(`alter table "files" alter column "id" type varchar(255) using ("id"::varchar(255));`);
        this.addSql(`alter table "files" rename column "url" to "chat_id";`);
    }

    override down(): void {
        this.addSql(`alter table "files" alter column "id" drop default;`);
        this.addSql(`alter table "files" alter column "id" type uuid using ("id"::text::uuid);`);
        this.addSql(`alter table "files" alter column "id" set default uuid_generate_v4();`);
        this.addSql(`alter table "files" rename column "chat_id" to "url";`);
    }
}
