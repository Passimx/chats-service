import { QueryOrder, raw, SqlEntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { CreateDialogueKeyDto } from '../dto/requests/create-dialogues.dto';

// eslint-disable-next-line
const lastMessageCondition = { 'chats.count_messages': raw('"message".number') };

export class ChatsRepository extends SqlEntityRepository<ChatEntity> {
    public findChats(
        publicKeyHash: string,
        { search, limit, offset, notFavoriteChatIds }: QueryGetChatsDto,
    ): Promise<ChatEntity[]> {
        const qb = this.createQueryBuilder('chats')
            .leftJoinAndSelect('chats.message', 'message', lastMessageCondition)
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('message.files', 'files')
            .leftJoinAndSelect('chats.keys', 'keys', { 'chats.type': ChatTypeEnum.IS_DIALOGUE })
            .leftJoinAndSelect('keys.publicKey', 'publicKey')
            .leftJoin('chats.keys', 'userKey', { 'userKey.publicKeyHash': publicKeyHash })
            .where({ id: { $nin: notFavoriteChatIds } })
            .andWhere({
                $or: [{ 'chats.type': { $in: [ChatTypeEnum.IS_OPEN] } }, { 'userKey.publicKeyHash': publicKeyHash }],
            })
            .orderBy({
                maxUsersOnline: QueryOrder.DESC_NULLS_LAST,
                message: { createdAt: QueryOrder.DESC_NULLS_LAST },
            })
            .limit(limit)
            .offset(offset);

        if (search?.length) {
            const queryWords = search.toLowerCase().split(' ');
            const arrayWords = queryWords.map((word) => ({
                $or: [{ title: { $ilike: `${word}%` } }, { title: { $ilike: `% ${word}%` } }],
            }));

            qb.andWhere({
                $or: [{ 'publicKey.name': { $ilike: `%${search}%` } }, { 'chats.name': search }, arrayWords],
            });
        }

        return qb.getResult();
    }

    public async findChatById(id: string, publicKeyHash?: string): Promise<ChatEntity | null> {
        const qb = this.createQueryBuilder('chats')
            .leftJoinAndSelect('chats.message', 'message', lastMessageCondition)
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('parentMessage.files', 'parentMessageFiles')
            .leftJoinAndSelect('message.files', 'files')
            .leftJoinAndSelect('chats.keys', 'keys')
            .leftJoinAndSelect('keys.publicKey', 'publicKey')
            .leftJoin('chats.keys', 'userKey', { 'userKey.publicKeyHash': publicKeyHash })
            .where('chats.id = ?', [id]);

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
            .leftJoinAndSelect('keys.publicKey', 'publicKey')
            .innerJoin('chats.keys', 'key', { 'key.public_key_hash': publicKeyHash, 'key.received': false })
            .orderBy({
                'files.createdAt': QueryOrder.ASC_NULLS_LAST,
            })
            .getResult();
    }
}
