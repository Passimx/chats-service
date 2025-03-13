import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, raw } from '@mikro-orm/postgresql';

import { MessageEntity } from '../entities/message.entity';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { QueueService } from '../../queue/queue.service';
import { EventsEnum } from '../../queue/types/events.enum';
import { MessageTypeEnum } from '../types/message-type.enum';
import { MessageErrorLanguageEnum } from '../types/message-error-language.enum';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { ChatTypeEnum } from '../types/chat-type.enum';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(MessageEntity)
        private readonly messageRepository: EntityRepository<MessageEntity>,
        @InjectRepository(ChatEntity)
        private readonly chatRepository: EntityRepository<ChatEntity>,
        private readonly queueService: QueueService,
    ) {}

    async createMessage(
        chatId: string,
        type: MessageTypeEnum,
        encryptMessage?: string,
        message?: string,
        parentMessageId?: string,
    ): Promise<DataResponse<MessageEntity | string>> {
        if (parentMessageId) {
            const parentMessage = await this.messageRepository.findOne({ id: parentMessageId });

            if (!parentMessage) {
                return new DataResponse(MessageErrorLanguageEnum.PARENT_MESSAGE_NOT_FOUND);
            }
        }

        const chat = await this.chatRepository
            .createQueryBuilder('chats')
            .update({ countMessages: raw('count_messages + 1') })
            .where('id = ? AND type != ?', [chatId, ChatTypeEnum.IS_SYSTEM])
            .returning('*')
            .getSingleResult();

        if (!chat) return new DataResponse(MessageErrorLanguageEnum.CHAT_NOT_FOUND);

        const messageEntity = new MessageEntity(
            chatId,
            chat.countMessages,
            type,
            encryptMessage,
            message,
            parentMessageId,
        );

        await this.messageRepository.insert(messageEntity);

        const response = new DataResponse<MessageEntity>(messageEntity);

        this.queueService.sendMessage(TopicsEnum.EMIT, String(chatId), EventsEnum.CREATE_MESSAGE, response);

        return response;
    }

    async getMessages(
        chatId: string,
        limit: number,
        offset: number,
        search?: string,
    ): Promise<DataResponse<MessageEntity[]>> {
        if (search) {
            const getMessageSearch = await this.messageRepository.find(
                { chatId, message: { $ilike: `%${search}%` }, number: { $gt: offset } },
                { limit: limit, orderBy: { number: 'DESC' }, populate: ['parentMessage'] },
            );

            return new DataResponse(getMessageSearch);
        }

        const getMessageNotSearch = await this.messageRepository.find(
            { chatId },
            { limit: limit, offset: offset, orderBy: { createdAt: 'DESC' }, populate: ['parentMessage'] },
        );

        return new DataResponse(getMessageNotSearch);
    }
}
