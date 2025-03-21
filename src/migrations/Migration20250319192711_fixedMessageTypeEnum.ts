import { Migration } from '@mikro-orm/migrations';

export class Migration20250319192711_fixedMessageTypeEnum extends Migration {
    up(): void {
        this.addSql('alter type "message_type_enum" add value if not exists \'IS_CREATED_CHAT\';');
    }
}
