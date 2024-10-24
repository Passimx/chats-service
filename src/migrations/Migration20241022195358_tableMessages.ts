import { Migration } from '@mikro-orm/migrations';

export class Migration20241022195358_tableMessages extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "messages" add column "parent_message_id" int null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "messages" drop column "parent_message_id";');
  }

}
