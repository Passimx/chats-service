import { Migration } from '@mikro-orm/migrations';

export class Migration20241225131344_Index_search_messages extends Migration {

  async up(): Promise<void> {
    this.addSql('create index "messages_chat_id_number_index" on "messages" using btree ("chat_id", "number");');
  }

  async down(): Promise<void> {
    this.addSql('drop index "messages_chat_id_number_index";');
  }

}
