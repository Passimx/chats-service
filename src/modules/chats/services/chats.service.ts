import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(ChatEntity)
        private readonly chatRepository: EntityRepository<ChatEntity>, // chatRepository - это объект для запросов в бд
    ) {}

    async createOpenChat(title: string): Promise<ChatEntity> {
        const chatEntity = new ChatEntity();

        chatEntity.title = title;

        await this.chatRepository.insert(chatEntity);

        return chatEntity;
    }

    async getOpenChats(title: string, offset: number, limit?: number): Promise<ChatEntity[]> {
        if (title) {
            return await this.chatRepository.find(
                { title: { $ilike: `%${title}%` } },
                {
                    limit,
                    offset: offset,
                    orderBy: { title: 'ASC', messages: { number: 'DESC NULLS LAST' }, createdAt: 'DESC' },
                    populate: ['messages'],
                },
            );
        } else {
            return await this.chatRepository.find(
                {},
                {
                    limit,
                    offset: offset,
                    orderBy: { messages: { number: 'DESC' }, createdAt: 'DESC' },
                    populate: ['messages'],
                },
            );
        }
    }
    async findChat(id: number): Promise<string | ChatEntity> {
        const chat = await this.chatRepository.findOne(id);

        if (chat) {
            return chat;
        }

        return `Chat with ID' + ${id} + 'not found`;
    }
}
