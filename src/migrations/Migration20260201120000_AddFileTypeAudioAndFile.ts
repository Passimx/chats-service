import { Migration } from '@mikro-orm/migrations';

export class Migration20260201120000_AddFileTypeAudioAndFile extends Migration {
    up(): void {
        this.addSql(`ALTER TYPE "file_type_enum" ADD VALUE IF NOT EXISTS 'is_audio';`);
        this.addSql(`ALTER TYPE "file_type_enum" ADD VALUE IF NOT EXISTS 'is_file';`);
    }
}
