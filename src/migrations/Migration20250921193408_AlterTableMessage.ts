import { Migration } from '@mikro-orm/migrations';

export class Migration20250921193408_AlterTableMessage extends Migration {
    up(): void {
        this.addSql(
            'alter table "messages" alter column "type" type "message_type_enum" using ("type"::"message_type_enum");',
        );
        this.addSql('alter table "messages" alter column "type" set default \'is_user\';');

        this.addSql('alter table "files" add column "duration" int null, add column "loudness_data" jsonb null;');
    }

    down(): void {
        this.addSql('alter table "files" drop column "duration", drop column "loudness_data";');

        this.addSql('alter table "messages" alter column "type" drop default;');
        this.addSql(
            'alter table "messages" alter column "type" type "message_type_enum" using ("type"::"message_type_enum");',
        );
    }
}
