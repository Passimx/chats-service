import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { ChatsRepository } from '../repositories/chats.repository';
import { CreateDialoguesDto } from '../dto/requests/create-dialogues.dto';
import { QueueService } from '../../queue/queue.service';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { MessageTypeEnum } from '../types/message-type.enum';
import { SystemMessageLanguageEnum } from '../types/system-message-language.enum';
import { ChatKeyEntity } from '../../keys/entities/chat-key.entity';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { EventsEnum } from '../../queue/types/events.enum';
import { ChatsService } from './chats.service';
import { MessagesService } from './messages.service';

@Injectable()
export class DialoguesService {
    constructor(
        private readonly queueService: QueueService,
        private readonly messagesService: MessagesService,
        private readonly chatsRepository: ChatsRepository,
        private readonly em: EntityManager,
        private readonly chatsService: ChatsService,
    ) {}

    async createDialogue(socketId: string, { keys }: CreateDialoguesDto): Promise<DataResponse<ChatEntity | string>> {
        let dialogue = await this.chatsRepository.getDialogueByKeys(keys);

        if (dialogue) {
            const response = await this.chatsService.findChat(dialogue.id);
            this.queueService.sendMessage(
                TopicsEnum.JOIN,
                socketId,
                EventsEnum.JOIN_CHAT,
                new DataResponse<string[]>([dialogue.id]),
            );
            this.queueService.sendMessage(TopicsEnum.EMIT, socketId, EventsEnum.CREATE_DIALOGUE, response);

            return this.chatsService.findChat(dialogue.id);
        }

        let message = SystemMessageLanguageEnum.DIALOGUE_IS_CREATE;
        const fork = this.em.fork();
        await fork.begin();

        try {
            let chatType: ChatTypeEnum = ChatTypeEnum.IS_DIALOGUE;
            let title = undefined;

            if (keys.length === 1 || keys[0].publicKeyHash === keys[1].publicKeyHash) {
                chatType = ChatTypeEnum.IS_FAVORITES;
                title = 'favorites';
                message = SystemMessageLanguageEnum.FAVORITE_IS_CREATE;
            }

            const chatEntity = new ChatEntity({
                type: chatType,
                title,
            } as ChatEntity);

            const chatId = await fork.insert(ChatEntity, chatEntity);

            await fork.insertMany(
                ChatKeyEntity,
                keys.map(({ publicKeyHash, encryptionKey }) => ({
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
                message,
            });

            dialogue = await this.chatsRepository.getDialogue(chatEntity.id);
        } catch (error) {
            await fork.rollback();
        }

        const response = await this.chatsService.findChat(dialogue!.id);

        keys.map(({ publicKeyHash }) =>
            this.queueService.sendMessage(
                TopicsEnum.JOIN,
                publicKeyHash,
                EventsEnum.JOIN_CHAT,
                new DataResponse<string[]>([dialogue!.id]),
            ),
        );

        keys.map(({ publicKeyHash }) =>
            this.queueService.sendMessage(TopicsEnum.EMIT, publicKeyHash, EventsEnum.CREATE_DIALOGUE, response),
        );

        return response;
    }
}
