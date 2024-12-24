import { Migration } from '@mikro-orm/migrations';

export class Migration20241224192916_changed_id_to_uuid extends Migration {
    up(): void {
        this.addSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        this.addSql('alter table "messages" alter column "chat_id" drop default;');
        this.addSql('alter table "messages" alter column "chat_id" type uuid using ("chat_id"::text::uuid);');
        this.addSql('alter table "messages" alter column "parent_message_id" drop default;');
        this.addSql(
            'alter table "messages" alter column "parent_message_id" type uuid using ("parent_message_id"::text::uuid);',
        );
    }

    down(): void {
        this.addSql('alter table "messages" alter column "chat_id" type text using ("chat_id"::text);');
        this.addSql(
            'alter table "messages" alter column "parent_message_id" type text using ("parent_message_id"::text);',
        );

        this.addSql('alter table "messages" alter column "chat_id" type varchar(255) using ("chat_id"::varchar(255));');
        this.addSql(
            'alter table "messages" alter column "parent_message_id" type varchar(255) using ("parent_message_id"::varchar(255));',
        );
        this.addSql('DROP EXTENSION IF NOT EXISTS "uuid-ossp";');
    }
}
