import { Migration } from '@mikro-orm/migrations';

export class Migration20250927073157_AlterTableFiles extends Migration {
    override up(): void {
        this.addSql(`alter table "files" add column "url" varchar(255) not null;`);
    }

    override down(): void {
        this.addSql(`alter table "files" drop column "url";`);
    }
}
