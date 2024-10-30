import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(ChatEntity)
        private readonly chatRepository: EntityRepository<ChatEntity>, // chatRepository - это объект для запросов в бд
    ) {}

    async createOpenChat(title: string): Promise<DataResponse<ChatEntity>> {
        const chatEntity = new ChatEntity();

        chatEntity.title = title;

        await this.chatRepository.insert(chatEntity);

        return new DataResponse(chatEntity);
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
