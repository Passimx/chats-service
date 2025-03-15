import { Migration } from '@mikro-orm/migrations';

export class Migration20250314101528_chatTypeEnumFix extends Migration {
    up(): void {
        this.addSql('ALTER TABLE "chats" DROP COLUMN "type";');
        this.addSql('DROP TYPE IF EXISTS "chat_type_enum";');
    }

    down(): void {
        this.addSql('ALTER TABLE "chats" ADD COLUMN "type" VARCHAR;');
        this.addSql(
            "CREATE TYPE \"chat_type_enum\" AS ENUM ('is_open', 'is_shared', 'is_public', 'is_private', 'is_system;');",
        );
    }
}
