import { QueryOrder, SqlEntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { ChatTypeEnum } from '../types/chat-type.enum';

export class ChatsRepository extends SqlEntityRepository<ChatEntity> {
    public findChats({ title, limit, offset, notFavoriteChatIds }: QueryGetChatsDto): Promise<ChatEntity[]> {
        const qb = this.createQueryBuilder('chats')

            // .leftJoinAndSelect('chats.message', 'message', { 'chats.count_messages': raw('"message".number') })
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('message.files', 'files')
            .where({ id: { $nin: notFavoriteChatIds } })
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
        return (
            this.createQueryBuilder('chats')
                // .leftJoinAndSelect('chats.message', 'message', { 'chats.count_messages': raw('"message".number') })
                .leftJoinAndSelect('message.parentMessage', 'parentMessage')
                .leftJoinAndSelect('message.files', 'files')
                .where('chats.id = ?', [id])
                .getSingleResult()
        );
    }

    async getSystemChats(): Promise<string | ChatEntity[]> {
        return await this.createQueryBuilder('chats')
            // .leftJoinAndSelect('chats.message', 'message', { 'chats.count_messages': raw('"message".number') })
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .leftJoinAndSelect('message.files', 'files')
            .where({ type: ChatTypeEnum.IS_SYSTEM })
            .getResult();
    }
}
