import { Migration } from '@mikro-orm/migrations';

export class Migration20251115192339_FixFiles extends Migration {
    up(): void {
        this.addSql('alter table "files" add column "transcription_voice" text null;');
    }

    down(): void {
        this.addSql('alter table "files" drop column "transcription_voice";');
    }
}
