import { Migration } from '@mikro-orm/migrations';

export class Migration20250216191030_lengthMessage extends Migration {
    up(): void {
        this.addSql(
            'alter table "messages" alter column "message" type varchar(4096) using ("message"::varchar(4096));',
        );
    }

    down(): void {
        this.addSql('alter table "messages" alter column "message" type varchar(255) using ("message"::varchar(255));');
    }
}
