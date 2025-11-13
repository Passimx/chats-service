import { Migration } from '@mikro-orm/migrations';

export class Migration20251112114859_Del extends Migration {
    override up(): void {
        this.addSql(`alter table "chat_keys" drop constraint "chat_keys_chat_id_public_key_unique";`);
        this.addSql(`drop index "chat_keys_public_key_chat_id_index";`);

        this.addSql(`alter table "chat_keys" rename column "public_key" to "public_key_hash";`);
        this.addSql(
            `create index "chat_keys_public_key_hash_chat_id_index" on "chat_keys" using btree ("public_key_hash", "chat_id");`,
        );
        this.addSql(
            `alter table "chat_keys" add constraint "chat_keys_chat_id_public_key_hash_unique" unique ("chat_id", "public_key_hash");`,
        );
    }

    override down(): void {
        this.addSql(`drop index "chat_keys_public_key_hash_chat_id_index";`);
        this.addSql(`alter table "chat_keys" drop constraint "chat_keys_chat_id_public_key_hash_unique";`);

        this.addSql(`alter table "chat_keys" rename column "public_key_hash" to "public_key";`);
        this.addSql(
            `alter table "chat_keys" add constraint "chat_keys_chat_id_public_key_unique" unique ("chat_id", "public_key");`,
        );
        this.addSql(`create index "chat_keys_public_key_chat_id_index" on "chat_keys" ("public_key", "chat_id");`);
    }
}
