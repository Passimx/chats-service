import { QueryOrder, raw, SqlEntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { CreateDialogueKeyDto } from '../dto/requests/create-dialogues.dto';

// eslint-disable-next-line
const lastMessageCondition = { 'chats.count_messages': raw('"message".number') };

export class ChatsRepository extends SqlEntityRepository<ChatEntity> {
    public findChats({ title, limit, offset, notFavoriteChatIds }: QueryGetChatsDto): Promise<ChatEntity[]> {
        const qb = this.createQueryBuilder('chats')

            .leftJoinAndSelect('chats.message', 'message', lastMessageCondition)
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('message.files', 'files')
            .where({ id: { $nin: notFavoriteChatIds } })
            .andWhere({ title: { $ne: null } })
            .orderBy({
                maxUsersOnline: QueryOrder.DESC_NULLS_LAST,
                message: { createdAt: QueryOrder.DESC_NULLS_LAST },
            })
            .limit(limit)
            .offset(offset);

        if (title?.length) {
            const queryWords = title.toLowerCase().split(' ');
            const arrayWords = queryWords.map((word) => ({
                $or: [{ title: { $ilike: `${word}%` } }, { title: { $ilike: `% ${word}%` } }],
            }));

            qb.andWhere({ $and: arrayWords });
        }

        return qb.getResult();
    }

    async findChatById(id: string): Promise<ChatEntity | null> {
        return this.createQueryBuilder('chats')
            .leftJoinAndSelect('chats.message', 'message', lastMessageCondition)
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('message.files', 'files')
            .leftJoinAndSelect('chats.keys', 'keys')
            .where('chats.id = ?', [id])
            .getSingleResult();
    }

    async getSystemChats(): Promise<string | ChatEntity[]> {
        return await this.createQueryBuilder('chats')
            .leftJoinAndSelect('chats.message', 'message', lastMessageCondition)
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('message.files', 'files')
            .where({ type: ChatTypeEnum.IS_SYSTEM })
            .getResult();
    }

    async getDialogues(publicKey: string): Promise<string[]> {
        const result = await this.em.getConnection().execute(
            `SELECT chat_id
             FROM chat_keys
             WHERE public_key = ?
               AND received = false`,
            [publicKey],
        );

        return result.map((row: Record<string, unknown>) => row.chat_id as string);
    }

    public async getDialogue(id: string): Promise<ChatEntity | null> {
        return this.findOne({ id }, { populate: ['keys'] });
    }

    public async getDialogueByKeys(keys: CreateDialogueKeyDto[]) {
        const qb = this.createQueryBuilder('chats');

        keys.forEach(({ publicKeyHash }, index) => {
            const alias = `key_${index}`;
            qb.innerJoin('chats.keys', alias, { [`${alias}.public_key_hash`]: publicKeyHash });
        });

        return qb.getSingleResult();
    }
}
