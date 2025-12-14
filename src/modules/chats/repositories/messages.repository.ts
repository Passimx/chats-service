import { SqlEntityRepository } from '@mikro-orm/postgresql';
import { MessageEntity } from '../entities/message.entity';
import { QueryGetMessagesDto } from '../dto/requests/query-get-messages.dto';
import { ChatTypeEnum } from '../types/chat-type.enum';

export class MessagesRepository extends SqlEntityRepository<MessageEntity> {
    public findMessages(userId: string, query: QueryGetMessagesDto): Promise<MessageEntity[]> {
        const qb = this.createQueryBuilder('messages')
            .innerJoin('messages.chat', 'chat', { 'chat.id': query.chatId })
            .leftJoin('chat.keys', 'userKey', { 'userKey.userId': userId })
            .leftJoinAndSelect('messages.parentMessage', 'parentMessage')
            .leftJoinAndSelect('messages.files', 'files')
            .leftJoinAndSelect('messages.user', 'user')
            .leftJoinAndSelect('messages.parentMessage', 'parentMessageFiles')
            .limit(query.limit)
            .orderBy({ 'messages.number': 'ASC', 'files.createdAt': 'ASC', 'parentMessageFiles.createdAt': 'ASC' });

        qb.andWhere({
            $or: [
                { 'chat.type': { $in: [ChatTypeEnum.IS_OPEN, ChatTypeEnum.IS_SYSTEM] } },
                { 'userKey.userId': userId },
            ],
        });

        if (query.offset) qb.andWhere({ 'messages.number': { $gt: query.offset } });

        return qb.getResultList();
    }
}
