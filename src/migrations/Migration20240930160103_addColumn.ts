import { Migration } from '@mikro-orm/migrations';

export class Migration20240930160103_addColumn extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'alter table "messages" add column "encrypt_message" varchar(1000) not null, add column "chat_id" int not null;',
        );
    }

    async down(): Promise<void> {
        this.addSql('alter table "messages" drop column "encrypt_message", drop column "chat_id";');
    }
}
