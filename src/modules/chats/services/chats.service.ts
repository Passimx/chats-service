// @ts-ignore

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { EventsEnum } from '../../queue/types/events.enum';
import { QueueService } from '../../queue/queue.service';
import { MessageTypeEnum } from '../types/message-type.enum';
import { MessageErrorLanguageEnum } from '../types/message-error-language.enum';
import { SystemMessageLanguageEnum } from '../types/system-message-language.enum';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { MessagesService } from './messages.service';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(ChatEntity)
        private readonly chatRepository: EntityRepository<ChatEntity>, // chatRepository - это объект для запросов в бд
        private readonly queueService: QueueService,
        private readonly messagesService: MessagesService,
    ) {}

    async createOpenChat(title: string, socketId?: string): Promise<DataResponse<ChatEntity>> {
        const chatEntity = new ChatEntity(title);

        const response = new DataResponse<ChatEntity>(chatEntity);

        await this.chatRepository.insert(chatEntity);

        await this.messagesService.createMessage(
            chatEntity.id,
            MessageTypeEnum.IS_SYSTEM,
            undefined,
            SystemMessageLanguageEnum.create_chat,
            undefined,
        );

        this.queueService.sendMessage(socketId, EventsEnum.CREATE_CHAT, response);

        return response;
    }

    async getOpenChats(title: string, offset: number, limit?: number): Promise<DataResponse<ChatEntity[]>> {
        if (title) {
            const getChatTitle = await this.chatRepository.find(
                { title: { $ilike: `%${title}%` } },
                {
                    limit,
                    offset: offset,

                    orderBy: { title: 'ASC', messages: { createdAt: 'DESC NULLS LAST' } },
                    populate: ['messages'],
                },
            );

            return new DataResponse(getChatTitle);
        } else {
            const getChatNotTitle = await this.chatRepository.find(
                {},
                {
                    limit,
                    offset: offset,
                    orderBy: { messages: { createdAt: 'DESC NULLS LAST' } },
                    populate: ['messages'],
                },
            );

            return new DataResponse(getChatNotTitle);
        }
    }

    async findChat(id: number): Promise<DataResponse<string | ChatEntity>> {
        const chat = await this.chatRepository.findOne(id);

        if (chat) {
            return new DataResponse(chat);
        }

        return new DataResponse(MessageErrorLanguageEnum.CHAT_WITH_ID_NOT_FOUND);
    }

    async favoriteChats(favoriteChatIds: number[], socketId?: string) {
        const newFavoriteChats = await this.chatRepository.find({
            id: { $in: favoriteChatIds },
            type: ChatTypeEnum.IS_OPEN,
        });
        const newFavoriteChatIds = newFavoriteChats.map((chat) => chat.id);

        if (favoriteChatIds.length !== newFavoriteChatIds.length) {
            return newFavoriteChatIds.join() + ' часть чатов не найдена';
        }

        const response: DataResponse<number[]> = new DataResponse<number[]>(favoriteChatIds);
        this.queueService.sendMessage(socketId, EventsEnum.JOIN_CHAT, response);

        return newFavoriteChatIds;
    }
}
