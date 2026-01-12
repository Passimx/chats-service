import { SqlEntityRepository } from '@mikro-orm/postgresql';
import { ChatKeyEntity } from '../entities/chat-key.entity';

export class ChatKeysRepository extends SqlEntityRepository<ChatKeyEntity> {
    public getUserIds(uerId: string) {
        return this.createQueryBuilder('keys')
            .addSelect('keys.chat_id')
            .where('keys.user_id = ?', [uerId])
            .andWhere('keys.is_member IS ?', [true])
            .execute<Partial<ChatKeyEntity>[]>();
    }
}
