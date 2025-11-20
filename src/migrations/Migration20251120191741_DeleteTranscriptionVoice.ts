import { Migration } from '@mikro-orm/migrations';

export class Migration20251120191741_DeleteTranscriptionVoice extends Migration {
    up(): void {
        this.addSql('alter table "files" drop column "transcription_voice";');
    }

    down(): void {
        this.addSql('alter table "files" add column "transcription_voice" text null;');
    }
}
