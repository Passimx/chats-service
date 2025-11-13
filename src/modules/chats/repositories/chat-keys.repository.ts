import { SqlEntityRepository } from '@mikro-orm/postgresql';
import { ChatKeyEntity } from '../entities/chat-key.entity';
import { ChatEntity } from '../entities/chat.entity';

export class ChatKeysRepository extends SqlEntityRepository<ChatKeyEntity> {
    async getDialogue(senderPublicKeyHash: string, recipientPublicKeyHash: string): Promise<ChatEntity | null> {
        const chatKey = await this.createQueryBuilder('senderKey')
            .where('"senderKey".public_key_hash = ?', [senderPublicKeyHash])
            .innerJoinAndSelect('senderKey.chat', 'chat')
            .innerJoinAndSelect('chat.keys', 'recipientPublicKey', {
                'recipientPublicKey.public_key_hash': recipientPublicKeyHash,
            })
            .getSingleResult();

        return chatKey?.chat ?? null;
    }
}
