import { Migration } from '@mikro-orm/migrations';

export class Migration20241028183319_indexGetMessages extends Migration {
    up(): void {
        this.addSql('create index "messages_message_index" on "messages" ("message");');
    }

    down(): void {
        this.addSql('drop index "messages_message_index";');
    }
}
