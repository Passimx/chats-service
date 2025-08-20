import { Migration } from '@mikro-orm/migrations';

export class Migration20250820031555_AlterTableFiles extends Migration {
    up(): void {
        this.addSql("create type \"file_type_enum\" as enum ('is_voice', 'is_media');");
        this.addSql('alter table "files" add column "file_type" "file_type_enum" not null default \'is_voice\';');
        this.addSql('alter table "files" alter column "file_type" drop default;');
        this.addSql(
            'alter table "files" alter column "file_type" type "file_type_enum" using ("file_type"::"file_type_enum");',
        );
    }

    down(): void {
        this.addSql(
            'alter table "files" alter column "file_type" type "file_type_enum" using ("file_type"::"file_type_enum");',
        );
        this.addSql('alter table "files" alter column "file_type" set default \'is_voice\';');
        this.addSql('alter table "files" drop column "file_type";');
        this.addSql('drop type "file_type_enum";');
    }
}
