import { Migration } from '@mikro-orm/migrations';

export class Migration20260112150253_AddNumberInFilesEntity extends Migration {
    override up(): void {
        this.addSql(`alter table "files"
            add column "number" int not null;`);
    }

    override down(): void {
        this.addSql(`alter table "files" drop column "number";`);
    }
}
