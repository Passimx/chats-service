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

    async createMessage(encryptMessage: string, id: number, message: string): Promise<MessageEntity | string> {
        const messageEntity = new MessageEntity(encryptMessage, id, message);
        const chat = await this.chatRepository.findOne({ id: id });

        if (chat?.id) {
            const countMessages = chat.countMessages || 0;
            chat.countMessages = countMessages + 1;

            await this.messageRepository.insert(messageEntity);

            return messageEntity;
        } else {
            return 'Чат не найден';
        }
    }

    async getMessages(chatId: number, limit: number, offset: number): Promise<MessageEntity[]> {
        return this.messageRepository.find(
            { chatId },
            { limit: limit, offset: offset, orderBy: { createdAt: 'DESC' } },
        );
    }
}
