import { Migration } from '@mikro-orm/migrations';

export class Migration20241115152254_messageTypeEnum extends Migration {
    up(): void {
        this.addSql("create type \"message_type_enum\" as enum ('IS_SYSTEM', 'IS_USER');");
        this.addSql('alter table "messages" add column "type" "message_type_enum" null;');
    }

    down(): void {
        this.addSql('alter table "messages" drop column "type";');

        this.addSql('drop type "message_type_enum";');
    }
}
