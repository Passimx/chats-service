import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { MessageEntity } from '../entities/message.entity';
import { ChatEntity } from '../entities/chat.entity';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(MessageEntity)
        private readonly messageRepository: EntityRepository<MessageEntity>,
        @InjectRepository(ChatEntity)
        private readonly chatRepository: EntityRepository<ChatEntity>,
    ) {}
    async createMessage(message: string, id: number): Promise<MessageEntity | string> {
        const messageEntity = new MessageEntity(message, id);
        const chat = await this.chatRepository.findOne({ id: id });

        if (chat?.id) {
            await this.messageRepository.insert(messageEntity);

            return messageEntity;
        } else {
            return 'Чат не найден';
        }
    }

    async getMessages(chatId: number, limit: number, offset: number): Promise<MessageEntity[]> {
        return await this.messageRepository.find(
            { chatId },
            { limit: limit, offset: offset, orderBy: { createdAt: 'DESC' } },
        );
    }
}
