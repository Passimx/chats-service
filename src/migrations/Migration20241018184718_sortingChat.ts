import { Migration } from '@mikro-orm/migrations';

export class Migration20241018184718_sortingChat extends Migration {
    up(): void {
        this.addSql('alter table "messages" alter column "number" drop default;');
        this.addSql('alter table "messages" alter column "number" type int using ("number"::int);');
    }

    down(): void {
        this.addSql('alter table "messages" alter column "number" type int4 using ("number"::int4);');
        this.addSql('alter table "messages" alter column "number" set default 1;');
    }
}
