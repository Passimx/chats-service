import { Migration } from '@mikro-orm/migrations';

export class Migration20251226091403_AddEnumFileType extends Migration {
    up(): void {
        this.addSql(`alter type "file_type_enum" add value if not exists 'is_video' after 'is_media';`);

        this.addSql(`alter type "file_type_enum" add value if not exists 'is_audio' after 'is_video';`);

        this.addSql(`alter type "file_type_enum" add value if not exists 'is_document' after 'is_audio';`);

        this.addSql(`alter type "file_type_enum" add value if not exists 'is_photo' after 'is_document';`);
    }
}
