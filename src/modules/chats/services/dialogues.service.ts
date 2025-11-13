import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { ChatsRepository } from '../repositories/chats.repository';
import { CreateDialoguesDto } from '../dto/requests/create-dialogues.dto';
import { QueueService } from '../../queue/queue.service';
import { ChatKeysRepository } from '../repositories/chat-keys.repository';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { ChatKeyEntity } from '../entities/chat-key.entity';
import { MessageTypeEnum } from '../types/message-type.enum';
import { SystemMessageLanguageEnum } from '../types/system-message-language.enum';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { EventsEnum } from '../../queue/types/events.enum';
import { ChatsService } from './chats.service';
import { MessagesService } from './messages.service';

@Injectable()
export class DialoguesService {
    constructor(
        private readonly chatKeysRepository: ChatKeysRepository,
        private readonly queueService: QueueService,
        private readonly messagesService: MessagesService,
        private readonly chatsRepository: ChatsRepository,
        private readonly em: EntityManager,
        private readonly chatsService: ChatsService,
    ) {}

    async createDialogue({ encryptionKey, ...body }: CreateDialoguesDto): Promise<DataResponse<ChatEntity | string>> {
        let dialogue = await this.chatKeysRepository.getDialogue(body.senderPublicKeyHash, body.recipientPublicKeyHash);

        if (dialogue) return this.chatsService.findChat(dialogue.id);

        const fork = this.em.fork();
        await fork.begin();

        try {
            const chatEntity = new ChatEntity({
                type: ChatTypeEnum.IS_DIALOGUE,
            } as ChatEntity);

            const chatId = await fork.insert(ChatEntity, chatEntity);

            await fork.insertMany(
                ChatKeyEntity,
                [body.senderPublicKeyHash, body.recipientPublicKeyHash].map((publicKeyHash) => ({
                    chatId,
                    encryptionKey,
                    publicKeyHash,
                })),
            );

            await fork.commit();

            await this.messagesService.createMessage({
                chat: chatEntity,
                chatId: chatEntity.id,
                type: MessageTypeEnum.IS_CREATED_CHAT,
                message: SystemMessageLanguageEnum.DIALOGUE_IS_CREATE,
            });

            dialogue = await this.chatsRepository.getDialogue(chatEntity.id);
        } catch (error) {
            await fork.rollback();
        }

        const response = await this.chatsService.findChat(dialogue!.id);
        this.queueService.sendMessage(TopicsEnum.EMIT, body.recipientPublicKeyHash, EventsEnum.CREATE_CHAT, response);
        this.queueService.sendMessage(TopicsEnum.EMIT, body.senderPublicKeyHash, EventsEnum.CREATE_CHAT, response);

        return response;
    }
}
