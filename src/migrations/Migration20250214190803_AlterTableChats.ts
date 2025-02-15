import { Migration } from '@mikro-orm/migrations';

export class Migration20250214190803_AlterTableChats extends Migration {
    up(): void {
        this.addSql('alter table "chats" alter column "max_users_online" type int using ("max_users_online"::int);');
        this.addSql('alter table "chats" alter column "max_users_online" set default 1;');
    }

    down(): void {
        this.addSql('alter table "chats" alter column "max_users_online" type int4 using ("max_users_online"::int4);');
        this.addSql('alter table "chats" alter column "max_users_online" set default 0;');
    }
}
