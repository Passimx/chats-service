import { Migration } from '@mikro-orm/migrations';

export class Migration20251003104509_AlterTableFiles extends Migration {
    override up(): void {
        this.addSql(`alter table "files" drop column "duration";`);

        this.addSql(`alter table "files" add column "key" varchar(255) not null;`);
        this.addSql(`alter table "files" alter column "id" drop default;`);
        this.addSql(`alter table "files" alter column "id" type uuid using ("id"::text::uuid);`);
        this.addSql(`alter table "files" alter column "id" set default uuid_generate_v4();`);
        this.addSql(`alter table "files" rename column "loudness_data" to "metadata";`);
    }

    override down(): void {
        this.addSql(`alter table "files" alter column "id" type text using ("id"::text);`);

        this.addSql(`alter table "files" drop column "key";`);

        this.addSql(`alter table "files" add column "duration" int4 null;`);
        this.addSql(`alter table "files" alter column "id" drop default;`);
        this.addSql(`alter table "files" alter column "id" type varchar(255) using ("id"::varchar(255));`);
        this.addSql(`alter table "files" rename column "metadata" to "loudness_data";`);
    }
}
