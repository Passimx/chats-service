import { Migration } from '@mikro-orm/migrations';

export class Migration20250114135108_max_users_online extends Migration {
    up(): void {
        this.addSql('alter table "chats" add column "max_users_online" int not null default 0;');
    }

    down(): void {
        this.addSql('alter table "chats" drop column "max_users_online";');
    }
}
