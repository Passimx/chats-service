import { Migration } from '@mikro-orm/migrations';

export class Migration20251022184254_AlterTableMessages extends Migration {
    override up(): void {
        this.addSql(`alter table "messages" drop column "encrypt_message";`);
    }

    override down(): void {
        this.addSql(`alter table "messages" add column "encrypt_message" varchar(1000) null;`);
    }
}
