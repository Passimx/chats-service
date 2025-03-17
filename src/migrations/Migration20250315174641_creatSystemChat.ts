import { Migration } from '@mikro-orm/migrations';

export class Migration20250315174641_creatSystemChat extends Migration {
    up(): void {
        this.addSql(`
            INSERT INTO "chats" (title, count_messages, type, max_users_online)
            VALUES ('PassimX', 1, 'is_system', 1);
        `);

        this.addSql(`
            INSERT INTO "messages" (chat_id, number, type, encrypt_message, message, parent_message_id)
            VALUES ((SELECT id FROM "chats" WHERE title = 'PassimX' AND type = 'is_system'),
                    1,
                    'IS_SYSTEM',
                    NULL,
                    'Hello PassimX',
                    NULL);
        `);
    }

    down(): void {
        this.addSql(`
            DELETE
            FROM "messages"
            WHERE chat_id = (SELECT id FROM "chats" WHERE title = 'PassimX' AND type = 'is_system')
              AND number = 1
              AND type = 'IS_SYSTEM'
              AND message = 'Hello PassimX';
        `);

        this.addSql(`
            DELETE
            FROM "chats"
            WHERE title = 'PassimX'
              AND type = 'is_system';
        `);
    }
}
