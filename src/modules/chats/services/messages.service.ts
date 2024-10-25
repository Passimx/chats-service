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

    async createMessage(
        encryptMessage: string,
        chatId: number,
        message: string,
        parentMessageId?: number,
    ): Promise<MessageEntity | string> {
        const chat = await this.chatRepository.findOne({ id: chatId });

        if (chat) {
            chat.countMessages++;

            if (parentMessageId) {
                const parentMessage = await this.messageRepository.findOne({ id: parentMessageId });

                if (!parentMessage) {
                    return 'Родительское сообщение не найдено';
                }
            }

            const messageEntity = new MessageEntity(
                encryptMessage,
                chatId,
                message,
                chat.countMessages,
                parentMessageId,
            );
            await this.messageRepository.insert(messageEntity);
            await this.chatRepository.nativeUpdate({ id: chatId }, { countMessages: chat.countMessages });

            return messageEntity;
        } else {
            return 'Чат не найден';
        }
    }

    async getMessages(chatId: number, limit: number, offset: number): Promise<MessageEntity[]> {
        return this.messageRepository.find(
            { chatId },
            { limit: limit, offset: offset, orderBy: { createdAt: 'DESC' }, populate: ['parentMessage'] },
        );
    }
}
