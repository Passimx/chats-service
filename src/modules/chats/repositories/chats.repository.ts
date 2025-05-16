import { QueryOrder, SqlEntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';

export class ChatsRepository extends SqlEntityRepository<ChatEntity> {
    public findChats({ title, limit, offset, notFavoriteChatIds }: QueryGetChatsDto): Promise<ChatEntity[]> {
        const qb = this.createQueryBuilder('chats')
            .leftJoinAndSelect('chats.message', 'message')
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .where('chats.count_messages = message.number')
            .andWhere({ id: { $nin: notFavoriteChatIds } })
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

    findChatById(id: string): Promise<ChatEntity | null> {
        return this.createQueryBuilder('chats')
            .leftJoinAndSelect('chats.message', 'message')
            .leftJoinAndSelect('message.parentMessage', 'parentMessage')
            .where('chats.count_messages = message.number')
            .andWhere('chats.id = ?', [id])
            .getSingleResult();
    }
}
