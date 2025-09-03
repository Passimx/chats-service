import { Migration } from '@mikro-orm/migrations';

export class Migration20250903131748_voice extends Migration {
    up(): void {
        this.addSql('alter table "files" add column "duration" int null, add column "loudness_data" jsonb null;');
    }

    down(): void {
        this.addSql('alter table "files" drop column "duration", drop column "loudness_data";');
    }
}
