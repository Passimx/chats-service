import { Migration } from '@mikro-orm/migrations';

export class Migration20250810033831_AlterTableFiles extends Migration {
    up(): void {
        this.addSql("create type \"file_type_enum\" as enum ('is_voice', 'is_media');");
        this.addSql('alter table "files" add column "file_type" "file_type_enum" null;');
    }

    down(): void {
        this.addSql('alter table "files" drop column "file_type";');
        this.addSql('drop type "file_type_enum";');
    }
}
