import { QueryOrder, raw, SelectQueryBuilder, SqlEntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { ChatKeyEntity } from '../entities/chat-key.entity';

// eslint-disable-next-line
const lastMessageCondition = { 'chats.count_messages': raw('"message".number') };

export class ChatsRepository extends SqlEntityRepository<ChatEntity> {
    public findChats(userId: string, { search, limit, offset, chatIds }: QueryGetChatsDto): Promise<ChatEntity[]> {
        const qb = this.getSubChats()
            .orderBy({
                maxUsersOnline: QueryOrder.DESC_NULLS_LAST,
                message: { createdAt: QueryOrder.DESC },
            })
            .andWhere(
                'NOT EXISTS(SELECT * FROM chat_keys WHERE user_id = ? AND chat_id = "chats".id AND is_member IS ?)',
                [userId, true],
            )
            .limit(limit)
            .offset(offset);

        if (chatIds?.length) {
            qb.andWhere('chats.id IN (?)', [chatIds]);
        }

        if (search?.length) {
            const queryWords = search.toLowerCase().split(' ');
            const arrayWords = queryWords.map((word) => [
                {
                    title: { $ilike: `${word}%` },
                },
                { title: { $ilike: `% ${word}%` } },
            ]);
            qb.andWhere({
                'chats.type': { $in: [ChatTypeEnum.IS_OPEN] },
                $or: arrayWords,
            });
        }

        return qb.getResult();
    }

    public async findChatByName(userId: string, name: string): Promise<ChatEntity | null> {
        const qb = this.getSubChats()
            .where('chats.name = ?', [name])
            .andWhere({
                $or: [
                    { type: { $in: [ChatTypeEnum.IS_OPEN] } },
                    {
                        'keys.userId': userId,
                    },
                ],
            })
            .andWhere(
                'NOT EXISTS(SELECT * FROM chat_keys WHERE user_id = ? AND chat_id = "chats".id AND is_member IS ?)',
                [userId, true],
            )
            .orderBy({
                message: {
                    files: { createdAt: QueryOrder.ASC },
                    parentMessage: { files: { createdAt: QueryOrder.ASC } },
                },
            });

        return qb.getSingleResult();
    }

    public async getSystemChats(): Promise<string | ChatEntity[]> {
        return await this.getSubChats()
            .where({ type: ChatTypeEnum.IS_SYSTEM })
            .orderBy({
                message: {
                    files: { createdAt: QueryOrder.ASC },
                    parentMessage: { files: { createdAt: QueryOrder.ASC } },
                },
            })
            .getResult();
    }

    public async getDialogueByKeys(keys: Partial<ChatKeyEntity>[]): Promise<ChatEntity | null> {
        const qb = this.getSubChats()
            .andWhere('chats.type IN (?)', [[ChatTypeEnum.IS_FAVORITES, ChatTypeEnum.IS_DIALOGUE]])
            .orderBy({
                message: {
                    files: { createdAt: QueryOrder.ASC },
                    parentMessage: { files: { createdAt: QueryOrder.ASC } },
                },
            });

        if (keys.length === 1 || keys[0]?.userId === keys[1]?.userId)
            qb.andWhere({ 'chats.type': ChatTypeEnum.IS_FAVORITES, 'keys.userId': keys[0]?.userId });

        keys.forEach(({ userId }, index) => {
            const alias = `key_${index}`;
            qb.innerJoin('chats.keys', alias, { [`${alias}.user_id`]: userId });
        });

        return qb.getSingleResult();
    }
    public async getChatById(id: string): Promise<ChatEntity | null> {
        const qb = this.getSubChats()
            .orderBy({
                message: {
                    files: { createdAt: QueryOrder.ASC },
                    parentMessage: { files: { createdAt: QueryOrder.ASC } },
                },
            })
            .andWhere({ 'chats.id': id });

        return qb.getSingleResult();
    }

    public getUserChats(userId: string): Promise<ChatEntity[]> {
        return this.getSubChats()
            .andWhere({
                $or: [{ 'chats.type': { $in: [ChatTypeEnum.IS_DIALOGUE] } }, { 'keys.userId': userId }],
            })
            .addSelect(raw('GREATEST(message.created_at, keys.created_at) AS "max_date"'))
            .innerJoin('chats.keys', 'userKey', { 'userKey.userId': userId, 'userKey.isMember': true })
            .orderBy({
                maxDate: QueryOrder.DESC,
                message: {
                    createdAt: QueryOrder.DESC,
                    files: { createdAt: QueryOrder.ASC },
                    parentMessage: { files: { createdAt: QueryOrder.ASC } },
                },
            })
            .getResultList();
    }

    private getSubChats(): SelectQueryBuilder<ChatEntity> {
        const qb = this.createQueryBuilder('chats')
            .leftJoinAndSelect('chats.message', 'message', lastMessageCondition)
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('message.files', 'files')
            .leftJoinAndSelect('message.user', 'messageUser')
            .leftJoinAndSelect('parentMessage.files', 'parentMessageFiles')
            .leftJoinAndSelect('chats.keys', 'keys')
            .leftJoinAndSelect('keys.user', 'keyUser');

        return qb;
    }
}
