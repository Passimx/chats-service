import { QueryOrder, raw, SelectQueryBuilder, SqlEntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { KeyDto } from '../dto/requests/keep-key.dto';

// eslint-disable-next-line
const lastMessageCondition = { 'chats.count_messages': raw('"message".number') };

export class ChatsRepository extends SqlEntityRepository<ChatEntity> {
    public findChats(
        publicKeyHash: string,
        { search, limit, offset, notFavoriteChatIds }: QueryGetChatsDto,
    ): Promise<ChatEntity[]> {
        const qb = this.getSubChats()
            .leftJoin('chats.keys', 'userKey', { 'userKey.publicKeyHash': publicKeyHash })
            .where({ id: { $nin: notFavoriteChatIds } })
            .andWhere({
                $or: [
                    { 'chats.type': { $in: [ChatTypeEnum.IS_OPEN, ChatTypeEnum.IS_SYSTEM] } },
                    { 'userKey.publicKeyHash': publicKeyHash },
                ],
            })
            .orderBy({
                maxUsersOnline: QueryOrder.DESC_NULLS_LAST,
                message: { createdAt: QueryOrder.DESC },
            })
            .limit(limit)
            .offset(offset);

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
                        'publicKey.name': search,
                        'chats.type': ChatTypeEnum.IS_DIALOGUE,
                        'publicKey.publicKeyHash': { $ne: publicKeyHash },
                    },
                ],
            });
        }

        return qb.getResult();
    }

    public async findChatByName(name: string, publicKeyHash?: string): Promise<ChatEntity | null> {
        const qb = this.getSubChats()
            .leftJoin('chats.keys', 'userKey', { 'userKey.publicKeyHash': publicKeyHash })
            .where('chats.name = ?', [name])
            .orderBy({
                message: {
                    files: { createdAt: QueryOrder.ASC },
                    parentMessage: { files: { createdAt: QueryOrder.ASC } },
                },
            });

        if (publicKeyHash)
            qb.andWhere({
                $or: [
                    { type: { $nin: [ChatTypeEnum.IS_DIALOGUE, ChatTypeEnum.IS_FAVORITES] } },
                    {
                        'userKey.publicKeyHash': publicKeyHash,
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

    public async getDialogueByKeys(keys: KeyDto[]): Promise<ChatEntity | null> {
        const qb = this.createQueryBuilder('chats')
            .leftJoinAndSelect('chats.keys', 'keys')
            .leftJoinAndSelect('keys.publicKey', 'publicKey')
            .orderBy({
                message: {
                    files: { createdAt: QueryOrder.ASC },
                    parentMessage: { files: { createdAt: QueryOrder.ASC } },
                },
            });

        if (keys.length === 1) qb.andWhere({ 'chats.type': ChatTypeEnum.IS_FAVORITES });

        keys.forEach(({ publicKeyHash }, index) => {
            const alias = `key_${index}`;
            qb.innerJoin('chats.keys', alias, { [`${alias}.public_key_hash`]: publicKeyHash });
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

    public async getNotReceivedChats(publicKeyHash: string): Promise<ChatEntity[]> {
        return this.getSubChats()
            .innerJoin('chats.keys', 'key', { 'key.public_key_hash': publicKeyHash, 'key.received': false })
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
            .leftJoinAndSelect('parentMessage.files', 'parentMessageFiles')
            .leftJoinAndSelect('message.files', 'files')
            .leftJoinAndSelect('chats.keys', 'keys')
            .leftJoinAndSelect('keys.publicKey', 'publicKey');
    }
}
