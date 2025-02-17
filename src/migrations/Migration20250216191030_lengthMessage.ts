import { Migration } from '@mikro-orm/migrations';

export class Migration20250216191030_lengthMessage extends Migration {
    up(): void {
        this.addSql('alter table "chats" alter column "max_users_online" type int using ("max_users_online"::int);');
        this.addSql('alter table "chats" alter column "max_users_online" set default 1;');

        this.addSql(
            'alter table "messages" alter column "message" type varchar(4096) using ("message"::varchar(4096));',
        );
    }

    down(): void {
        this.addSql('alter table "chats" alter column "max_users_online" type int4 using ("max_users_online"::int4);');
        this.addSql('alter table "chats" alter column "max_users_online" set default 0;');

        this.addSql('alter table "messages" alter column "message" type varchar(255) using ("message"::varchar(255));');
    }
}
