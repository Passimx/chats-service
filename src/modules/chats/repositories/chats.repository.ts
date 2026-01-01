import { QueryOrder, raw, SelectQueryBuilder, SqlEntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { ChatKeyEntity } from '../entities/chat-key.entity';

// eslint-disable-next-line
const lastMessageCondition = { 'chats.count_messages': raw('"message".number') };

export class ChatsRepository extends SqlEntityRepository<ChatEntity> {
    public findChats(
        userId: string,
        { search, limit, offset, chatIds, notFavoriteChatIds }: QueryGetChatsDto,
    ): Promise<ChatEntity[]> {
        const qb = this.getSubChats()
            .leftJoin('chats.keys', 'userKey', { 'userKey.userId': userId })
            .where({ id: { $nin: notFavoriteChatIds } })
            .andWhere({
                $or: [
                    { 'chats.type': { $in: [ChatTypeEnum.IS_OPEN, ChatTypeEnum.IS_SYSTEM] } },
                    { 'userKey.userId': userId },
                ],
            })
            .orderBy({
                maxUsersOnline: QueryOrder.DESC_NULLS_LAST,
                message: { createdAt: QueryOrder.DESC },
            })
            .limit(limit)
            .offset(offset);

        if (chatIds?.length) {
            qb.andWhere('chats.id IN (?)', [chatIds]);
        }

        if (search?.length) {
            const queryWords = search.toLowerCase().split(' ');
            const arrayWords = queryWords.map((word) => ({
                $or: [{ title: { $ilike: `${word}%` } }, { title: { $ilike: `% ${word}%` } }],
            }));
            qb.andWhere({
                $or: [
                    arrayWords,
                    { 'chats.name': search },
                    {
                        'user.name': search,
                        'chats.type': ChatTypeEnum.IS_DIALOGUE,
                        'user.id': { $ne: userId },
                    },
                ],
            });
        }

        return qb.getResult();
    }

    public async findChatByName(name: string, userId?: string): Promise<ChatEntity | null> {
        const qb = this.getSubChats()
            .leftJoin('chats.keys', 'userKey', { 'userKey.userId': userId })
            .where('chats.name = ?', [name])
            .orderBy({
                message: {
                    files: { createdAt: QueryOrder.ASC },
                    parentMessage: { files: { createdAt: QueryOrder.ASC } },
                },
            });

        if (userId)
            qb.andWhere({
                $or: [
                    { type: { $nin: [ChatTypeEnum.IS_DIALOGUE, ChatTypeEnum.IS_FAVORITES] } },
                    {
                        'userKey.userId': userId,
                    },
                ],
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
        const qb = this.getSubChats().orderBy({
            message: {
                files: { createdAt: QueryOrder.ASC },
                parentMessage: { files: { createdAt: QueryOrder.ASC } },
            },
        });

        if (keys.length === 1 || keys[0]?.userId === keys[1]?.userId)
            qb.andWhere({ 'chats.type': ChatTypeEnum.IS_FAVORITES });

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

    public async getNotReceivedChats(userId: string): Promise<ChatEntity[]> {
        return this.getSubChats()
            .innerJoin('chats.keys', 'key', { 'key.userId': userId, 'key.received': false })
            .where({ type: ChatTypeEnum.IS_DIALOGUE })
            .orderBy({
                message: {
                    files: { createdAt: QueryOrder.ASC },
                    parentMessage: { files: { createdAt: QueryOrder.ASC } },
                },
            })
            .getResult();
    }

    public getSubChats(): SelectQueryBuilder<ChatEntity> {
        return this.createQueryBuilder('chats')
            .leftJoinAndSelect('chats.message', 'message', lastMessageCondition)
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('message.files', 'files')
            .leftJoinAndSelect('message.user', 'messageUser')
            .leftJoinAndSelect('parentMessage.files', 'parentMessageFiles')
            .leftJoinAndSelect('chats.keys', 'keys')
            .leftJoinAndSelect('keys.user', 'user');
    }
}
