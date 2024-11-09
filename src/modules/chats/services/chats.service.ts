import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { EventsEnum } from '../../queue/types/events.enum';
import { QueueService } from '../../queue/queue.service';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(ChatEntity)
        private readonly chatRepository: EntityRepository<ChatEntity>, // chatRepository - это объект для запросов в бд
        private readonly queueService: QueueService,
    ) {}

    async createOpenChat(title: string, socketId?: string): Promise<DataResponse<ChatEntity>> {
        const chatEntity = new ChatEntity(title);

        const response = new DataResponse<ChatEntity>(chatEntity);

        await this.chatRepository.insert(chatEntity);

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
                    orderBy: { title: 'ASC', messages: { number: 'DESC NULLS LAST' }, createdAt: 'DESC' },
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
                    orderBy: { messages: { number: 'DESC' }, createdAt: 'DESC' },
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

        return new DataResponse(`Chat with ID' + ${id} + 'not found`);
    }
}
