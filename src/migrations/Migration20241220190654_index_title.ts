import { Migration } from '@mikro-orm/migrations';

export class Migration20241220190654_index_title extends Migration {
    up(): void {
        this.addSql('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
        this.addSql('CREATE EXTENSION IF NOT EXISTS btree_gin;');
        this.addSql('create index IF NOT EXISTS "chats_title_index" on "chats" using GIN ("title");');
    }

    down(): void {
        this.addSql('drop index "chats_title_index";');
        this.addSql('drop EXTENSION IF EXISTS btree_gin;');
        this.addSql('drop EXTENSION IF EXISTS pg_trgm;');
    }
}
