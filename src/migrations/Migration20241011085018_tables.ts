import { Migration } from '@mikro-orm/migrations';

export class Migration20241011085018_tables extends Migration {
    up(): void {
        this.addSql(
            'alter table "messages" alter column "encrypt_message" type varchar(1000) using ("encrypt_message"::varchar(1000));',
        );
        this.addSql('alter table "messages" alter column "encrypt_message" drop not null;');
        this.addSql('alter table "messages" alter column "number" type int using ("number"::int);');
        this.addSql('alter table "messages" alter column "number" set default 1;');
        this.addSql('alter table "messages" alter column "message" type varchar(255) using ("message"::varchar(255));');
        this.addSql('alter table "messages" alter column "message" drop not null;');
    }

    down(): void {
        this.addSql(
            'alter table "messages" alter column "encrypt_message" type varchar(1000) using ("encrypt_message"::varchar(1000));',
        );
        this.addSql('alter table "messages" alter column "encrypt_message" set not null;');
        this.addSql('alter table "messages" alter column "number" drop default;');
        this.addSql('alter table "messages" alter column "number" type int4 using ("number"::int4);');
        this.addSql('alter table "messages" alter column "message" type varchar(255) using ("message"::varchar(255));');
        this.addSql('alter table "messages" alter column "message" set not null;');
    }
}
