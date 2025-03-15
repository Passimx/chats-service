import { Migration } from '@mikro-orm/migrations';

export class Migration20250313200532_chatTypeEnum extends Migration {
    up(): void {
        this.addSql('alter type "chat_type_enum" add value if not exists \'is_system;\';');
    }
}
