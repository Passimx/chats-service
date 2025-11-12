import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { ChatKeyEntity } from '../entities/chat-key.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { MessageEntity } from '../entities/message.entity';
import { ChatsRepository } from '../repositories/chats.repository';
import { CreateDialoguesDto } from '../dto/requests/create-dialogues.dto';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { MessageTypeEnum } from '../types/message-type.enum';
import { SystemMessageLanguageEnum } from '../types/system-message-language.enum';
import { MessageErrorLanguageEnum } from '../types/message-error-language.enum';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { QueueService } from '../../queue/queue.service';
import { EventsEnum } from '../../queue/types/events.enum';
import { MessagesService } from './messages.service';

@Injectable()
export class DialoguesService {
    constructor(
        @InjectRepository(MessageEntity)
        readonly messageRepository: EntityRepository<MessageEntity>,
        private readonly queueService: QueueService,
        private readonly messagesService: MessagesService,
        readonly chatsRepository: ChatsRepository,
        private readonly em: EntityManager,
    ) {}

    async createDialogue(socketId: string, keys: CreateDialoguesDto): Promise<DataResponse<ChatEntity | string>> {
        // Проверяем, не существует ли уже диалог между этими пользователями
        const existingDialogue = await this.findExistingDialogue(keys.senderPublicKey, keys.recipientPublicKey);

        if (existingDialogue) {
            return new DataResponse<ChatEntity>(existingDialogue);
        }

        const chatEntity = new ChatEntity({
            type: ChatTypeEnum.IS_DIALOGUE,
        });

        await this.chatsRepository.insert(chatEntity);

        const chatKeys = [
            new ChatKeyEntity({
                chatId: chatEntity.id,
                publicKey: keys.senderPublicKey,
                encryptionKey: keys.encryptionKey,
                received: true,
            }),
            new ChatKeyEntity({
                chatId: chatEntity.id,
                publicKey: keys.recipientPublicKey,
                encryptionKey: keys.encryptionKey,
                received: false,
            }),
        ];

        await this.em.persistAndFlush(chatKeys);

        const messageResponse = await this.messagesService.createMessage({
            chat: chatEntity,
            chatId: chatEntity.id,
            type: MessageTypeEnum.IS_CREATED_DIALOGUES,
            message: SystemMessageLanguageEnum.create_dialogue,
        });

        if (!messageResponse.success) return new DataResponse<ChatEntity>(MessageErrorLanguageEnum.MESSAGE_NOT_FOUND);

        const createChat = await this.chatsRepository.findOne({ id: chatEntity.id }, { populate: ['message'] });

        const response = new DataResponse<ChatEntity>(createChat!);
        this.queueService.sendMessage(TopicsEnum.EMIT, socketId, EventsEnum.CREATE_CHAT, response);

        const chatId: string[] = [chatEntity.id];
        this.queueService.sendMessage(
            TopicsEnum.JOIN,
            socketId,
            EventsEnum.JOIN_CHAT,
            new DataResponse<string[]>(chatId),
        );

        return response;
    }

    private async findExistingDialogue(yourPublicKey: string, hisPublicKey: string): Promise<ChatEntity | null> {
        const knex = this.em.getConnection().getKnex();

        const qb = knex
            .select(knex.raw('DISTINCT ck1.chat_id as chat_id'))
            .from('chat_keys as ck1')
            .innerJoin('chat_keys as ck2', 'ck1.chat_id', '=', 'ck2.chat_id')
            .where('ck1.public_key', '=', yourPublicKey)
            .where('ck2.public_key', '=', hisPublicKey)
            .limit(1);

        const result = (await qb) as Array<{ chat_id: string }>;

        if (result.length > 0) {
            const chatId = result[0].chat_id;

            return this.chatsRepository.findOne({ id: chatId }, { populate: ['message'] });
        }

        return null;
    }

    async getDialogues(publicKey: string): Promise<DataResponse<string[]>> {
        const chatKeys = await this.em.find(ChatKeyEntity, {
            publicKey: publicKey,
            received: false,
        });

        const chatIds = chatKeys.map((key) => key.chatId);

        return new DataResponse<string[]>(chatIds);
    }

    async updateDialoguesReceived(publicKey: string, chatIds: string[]): Promise<DataResponse<boolean>> {
        if (chatIds.length !== 0) {
            await this.em.nativeUpdate(
                ChatKeyEntity,
                {
                    publicKey: publicKey,
                    chatId: { $in: chatIds },
                    received: false,
                },
                {
                    received: true,
                },
            );
        }

        return new DataResponse<boolean>(true);
    }
}
