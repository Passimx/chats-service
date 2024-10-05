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

    async getOpenChats(title: string, limit?: number): Promise<ChatEntity[]> {
        return await this.chatRepository.find({ title: { $ilike: `%${title}%` } }, { limit });
    }
}
