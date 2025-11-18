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
            .andWhere({ type: { $in: [ChatTypeEnum.IS_OPEN] } })
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

    public async findChatById(id: string, publicKeyHash: string): Promise<ChatEntity | null> {
        const qb = this.createQueryBuilder('chats')
            .leftJoinAndSelect('chats.message', 'message', lastMessageCondition)
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('parentMessage.files', 'parentMessageFiles')
            .leftJoinAndSelect('message.files', 'files')
            .leftJoinAndSelect('chats.keys', 'keys')
            .leftJoin('chats.keys', 'userKey')
            .where('chats.id = ?', [id])
            .andWhere({
                $or: [
                    { type: { $in: [ChatTypeEnum.IS_OPEN] } },
                    {
                        type: { $in: [ChatTypeEnum.IS_DIALOGUE, ChatTypeEnum.IS_FAVORITES] },
                        'userKey.publicKeyHash': publicKeyHash,
                    },
                ],
            });

        return qb.getSingleResult();
    }

    public async getSystemChats(): Promise<string | ChatEntity[]> {
        return await this.createQueryBuilder('chats')
            .leftJoinAndSelect('chats.message', 'message', lastMessageCondition)
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('message.files', 'files')
            .where({ type: ChatTypeEnum.IS_SYSTEM })
            .getResult();
    }

    public async getDialogue(id: string): Promise<ChatEntity | null> {
        return this.findOne({ id }, { populate: ['keys'] });
    }

    public async getDialogueByKeys(keys: CreateDialogueKeyDto[]) {
        const qb = this.createQueryBuilder('chats');

        if (keys.length === 1) qb.andWhere({ 'chats.type': ChatTypeEnum.IS_FAVORITES });

        keys.forEach(({ publicKeyHash }, index) => {
            const alias = `key_${index}`;
            qb.innerJoin('chats.keys', alias, { [`${alias}.public_key_hash`]: publicKeyHash });
        });

        return qb.getSingleResult();
    }

    public async getNotReceivedChats(publicKeyHash: string): Promise<ChatEntity[]> {
        return this.createQueryBuilder('chats')
            .where({ type: ChatTypeEnum.IS_DIALOGUE })
            .innerJoinAndSelect('chats.message', 'message', lastMessageCondition)
            .leftJoinAndSelect('message.files', 'files')
            .leftJoinAndSelect('chats.keys', 'keys')
            .innerJoin('chats.keys', 'key', { 'key.public_key_hash': publicKeyHash, 'key.received': false })
            .orderBy({
                'files.createdAt': QueryOrder.ASC_NULLS_LAST,
            })
            .getResult();
    }
}
