import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { MessageEntity } from '../entities/message.entity';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { QueueService } from '../../queue/queue.service';
import { EventsEnum } from '../../queue/types/events.enum';
import { MessageTypeEnum } from '../types/message-type.enum';
import { MessageErrorLanguageEnum } from '../types/message-error-language.enum';

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
        chatId: number,
        type: MessageTypeEnum,
        encryptMessage?: string,
        message?: string,
        parentMessageId?: number,
    ): Promise<DataResponse<MessageEntity | string>> {
        const chat = await this.chatRepository.findOne({ id: chatId });

        if (!chat) return new DataResponse(MessageErrorLanguageEnum.CHAT_NOT_FOUND);

        chat.countMessages++;

        if (parentMessageId) {
            const parentMessage = await this.messageRepository.findOne({ id: parentMessageId });

            if (!parentMessage) {
                return new DataResponse(MessageErrorLanguageEnum.PARENT_MESSAGE_NOT_FOUND);
            }
        }

        const messageEntity = new MessageEntity(
            chatId,
            chat.countMessages,
            type,
            encryptMessage,
            message,
            parentMessageId,
        );
        const response = new DataResponse<MessageEntity>(messageEntity);
        await this.messageRepository.insert(messageEntity);
        await this.chatRepository.nativeUpdate({ id: chatId }, { countMessages: chat.countMessages });
        this.queueService.sendMessage(String(chatId), EventsEnum.CREATE_MESSAGE, response);

        return response;
    }

    async getMessages(
        chatId: number,
        limit: number,
        offset: number,
        search?: string,
    ): Promise<DataResponse<MessageEntity[]>> {
        if (search) {
            const getMessageSearch = await this.messageRepository.find(
                { chatId, message: { $ilike: `%${search}%` } },
                { limit: limit, offset: offset, orderBy: { createdAt: 'DESC' }, populate: ['parentMessage'] },
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
