import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { EntityManager } from '@mikro-orm/core';
import { ChatEntity } from '../entities/chat.entity';
import { ChatKeyEntity } from '../entities/chat-key.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { MessageEntity } from '../entities/message.entity';
import { ChatsRepository } from '../repositories/chats.repository';
import { CreateDialoguesDto } from '../dto/requests/create-dialogues.dto';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { MessageTypeEnum } from '../types/message-type.enum';
import { SystemMessageLanguageEnum } from '../types/system-message-language.enum';
import { MessageErrorLanguageEnum } from '../types/message-error-language.enum';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { QueueService } from '../../queue/queue.service';
import { EventsEnum } from '../../queue/types/events.enum';
import { MessagesService } from './messages.service';

@Injectable()
export class DialoguesService {
    constructor(
        @InjectRepository(MessageEntity)
        readonly messageRepository: EntityRepository<MessageEntity>,
        private readonly queueService: QueueService,
        private readonly messagesService: MessagesService,
        readonly chatsRepository: ChatsRepository,
        private readonly em: EntityManager,
    ) {}

    async createDialogue(socketId: string, keys: CreateDialoguesDto): Promise<DataResponse<ChatEntity | string>> {
        // Проверяем, не существует ли уже диалог между этими пользователями
        const existingDialogue = await this.findExistingDialogue(keys.your_public_key, keys.his_public_key);

        if (existingDialogue) {
            return new DataResponse<ChatEntity>(existingDialogue);
        }

        const chatEntity = new ChatEntity({
            type: ChatTypeEnum.IS_DIALOGUE,
        });

        await this.chatsRepository.insert(chatEntity);

        const chatKeys = [
            new ChatKeyEntity({
                chatId: chatEntity.id,
                publicKey: keys.your_public_key,
                encryptionKey: keys.encryption_key,
                received: true,
            }),
            new ChatKeyEntity({
                chatId: chatEntity.id,
                publicKey: keys.his_public_key,
                encryptionKey: keys.encryption_key,
                received: false,
            }),
        ];

        await this.em.persistAndFlush(chatKeys);

        const messageResponse = await this.messagesService.createMessage({
            chat: chatEntity,
            chatId: chatEntity.id,
            type: MessageTypeEnum.IS_CREATED_DIALOGUES,
            message: SystemMessageLanguageEnum.create_dialogue,
        });

        if (!messageResponse.success) return new DataResponse<ChatEntity>(MessageErrorLanguageEnum.MESSAGE_NOT_FOUND);

        const createChat = await this.chatsRepository.findOne({ id: chatEntity.id }, { populate: ['message'] });

        const response = new DataResponse<ChatEntity>(createChat!);
        this.queueService.sendMessage(TopicsEnum.EMIT, socketId, EventsEnum.CREATE_CHAT, response);

        const chatId: string[] = [chatEntity.id];
        this.queueService.sendMessage(
            TopicsEnum.JOIN,
            socketId,
            EventsEnum.JOIN_CHAT,
            new DataResponse<string[]>(chatId),
        );

        return response;
    }

    private async findExistingDialogue(publicKey1: string, publicKey2: string): Promise<ChatEntity | null> {
        // Оптимизированный запрос для больших объемов данных
        // Используем EXISTS вместо JOIN для лучшей производительности
        const result = (await this.em.getConnection().execute(
            `
                SELECT c.id
                FROM chats c
                WHERE c.type = 'is_dialogue'
                  AND EXISTS (SELECT 1
                              FROM chat_keys ck1
                              WHERE ck1.chat_id::uuid = c.id
                                AND ck1.public_key = ?)
                  AND EXISTS (SELECT 1
                              FROM chat_keys ck2
                              WHERE ck2.chat_id::uuid = c.id
                                AND ck2.public_key = ?)
                    LIMIT 1
            `,
            [publicKey1, publicKey2],
        )) as Array<{ id: string }>;

        if (result.length > 0) {
            const chatData = result[0];

            return this.chatsRepository.findOne({ id: chatData.id }, { populate: ['message'] });
        }

        return null;
    }
}
