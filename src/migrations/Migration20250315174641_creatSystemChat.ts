import { Migration } from '@mikro-orm/migrations';

export class Migration20250315174641_creatSystemChat extends Migration {
    up(): void {
        this.addSql(`
            INSERT INTO "chats" (title, type)
            VALUES ('PassimX', 'is_system');
        `);

        this.addSql(`
            INSERT INTO "messages" (chat_id, number, type, encrypt_message, message, parent_message_id)
            VALUES ((SELECT id FROM "chats" WHERE title = 'PassimX' AND type = 'is_system'),
                    1,
                    'IS_OPEN',
                    NULL,
                    'message_hello',
                    NULL);
        `);
    }

    down(): void {
        this.addSql(`
            DELETE
            FROM "messages"
            WHERE chat_id = (SELECT id FROM "chats" WHERE title = 'PassimX' AND type = 'is_system')
              AND number = 1
              AND type = 'IS_OPEN'
              AND message = 'message_hello';
        `);

        this.addSql(`
            DELETE
            FROM "chats"
            WHERE title = 'PassimX'
              AND type = 'is_system';
        `);
    }
}
