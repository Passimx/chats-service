import { Migration } from '@mikro-orm/migrations';

export class Migration20241022195358_tableMessages extends Migration {
    up(): void {
        this.addSql('alter table "messages" add column "parent_message_id" int null;');
    }

    down(): void {
        this.addSql('alter table "messages" drop column "parent_message_id";');
    }
}
