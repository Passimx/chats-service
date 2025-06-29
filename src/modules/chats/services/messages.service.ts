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
import { FileEntity } from '../../files/entity/file.entity';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(MessageEntity)
        private readonly messageRepository: EntityRepository<MessageEntity>,
        @InjectRepository(ChatEntity)
        private readonly chatRepository: EntityRepository<ChatEntity>,
        private readonly queueService: QueueService,
        @InjectRepository(FileEntity)
        private readonly fileRepository: EntityRepository<FileEntity>,
    ) {}

    async createMessage(
        chatId: string,
        type: MessageTypeEnum,
        encryptMessage?: string,
        message?: string,
        parentMessageId?: string,
        fileIds?: string[],
    ): Promise<DataResponse<MessageEntity | string>> {
        let parentMessage: MessageEntity | null = null;

        if (parentMessageId) {
            parentMessage = await this.messageRepository.findOne({ id: parentMessageId, chatId });

            if (!parentMessage) {
                return new DataResponse(MessageErrorLanguageEnum.PARENT_MESSAGE_NOT_FOUND);
            }
        }

        const chat = await this.chatRepository
            .createQueryBuilder('chats')
            .update({ countMessages: raw('count_messages + 1') })
            .where({ id: chatId })
            .andWhere('chats.type != ?', [ChatTypeEnum.IS_SYSTEM])
            .returning('*')
            .getSingleResult();

        if (!chat) return new DataResponse(MessageErrorLanguageEnum.CHAT_NOT_FOUND);

        const messageEntity = new MessageEntity(
            chatId,
            chat.countMessages,
            type,
            chat,
            parentMessage,
            encryptMessage,
            message,
        );

        await this.messageRepository.populate(messageEntity, ['parentMessage']);

        await this.messageRepository.insert(messageEntity);

        if (fileIds) {
            await this.fileRepository.nativeUpdate(
                {
                    id: { $in: fileIds },
                    messageId: null,
                },
                { messageId: messageEntity.id },
            );
        }

        const newMessageEntity: MessageEntity | null = await this.messageRepository.findOne(
            { id: messageEntity.id },
            { populate: ['parentMessage', 'files', 'parentMessage.files'] },
        );

        if (!newMessageEntity) {
            return new DataResponse(MessageErrorLanguageEnum.MESSAGE_NOT_FOUND);
        }

        const response = new DataResponse<MessageEntity | string>(newMessageEntity);

        this.queueService.sendMessage(TopicsEnum.EMIT, String(chatId), EventsEnum.CREATE_MESSAGE, response);

        return response;
    }

    async getMessages(chatId: string, limit: number, offset: number): Promise<DataResponse<MessageEntity[]>> {
        const getMessageNotSearch = await this.messageRepository.find(
            { chat: chatId, number: { $gt: offset ?? undefined } },
            {
                limit: limit,
                orderBy: { number: 'DESC' },
                populate: ['parentMessage', 'files', 'parentMessage.files'],
            },
        );

        return new DataResponse(getMessageNotSearch);
    }
}
