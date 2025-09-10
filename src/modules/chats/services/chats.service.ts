import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { EventsEnum } from '../../queue/types/events.enum';
import { QueueService } from '../../queue/services/queue.service';
import { MessageTypeEnum } from '../types/message-type.enum';
import { MessageErrorLanguageEnum } from '../types/message-error-language.enum';
import { SystemMessageLanguageEnum } from '../types/system-message-language.enum';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { MessageEntity } from '../entities/message.entity';
import { ChatsRepository } from '../repositories/chats.repository';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { CreateOpenChatDto } from '../dto/requests/create-open-chat.dto';
import { ChatDto } from '../dto/requests/post-favorites-chat.dto';
import { MessagesService } from './messages.service';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(MessageEntity)
        readonly messageRepository: EntityRepository<MessageEntity>,
        private readonly queueService: QueueService,
        private readonly messagesService: MessagesService,
        readonly chatsRepository: ChatsRepository,
    ) {}

    async createOpenChat(socketId: string, { title }: CreateOpenChatDto): Promise<DataResponse<ChatEntity>> {
        const chatEntity = new ChatEntity(title);

        await this.chatsRepository.insert(chatEntity);

        await this.messagesService.createMessage(
            chatEntity.id,
            MessageTypeEnum.IS_CREATED_CHAT,
            undefined,
            SystemMessageLanguageEnum.create_chat,
            undefined,
        );
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

    async getOpenChats(query: QueryGetChatsDto): Promise<DataResponse<ChatEntity[]>> {
        const chats = await this.chatsRepository.findChats(query);

        return new DataResponse(chats);
    }

    async findChat(id: string): Promise<DataResponse<string | ChatEntity>> {
        const chat = await this.chatsRepository.findChatById(id);

        if (!chat) return new DataResponse(MessageErrorLanguageEnum.CHAT_WITH_ID_NOT_FOUND);

        return new DataResponse(chat);
    }

    async join(chats: ChatDto[], socketId: string): Promise<DataResponse<string | ChatEntity[]>> {
        const response: ChatEntity[] = [];
        const chatIdsSet = new Set<string>();

        const promises = chats.map(async ({ chatId, lastMessage, maxUsersOnline }) => {
            if (chatIdsSet.has(chatId)) return;

            chatIdsSet.add(chatId);

            const chat = await this.chatsRepository.findOne(
                { id: chatId },
                {
                    orderBy: { message: { createdAt: 'DESC NULLS LAST' } },
                    populate: ['message'],
                },
            );

            if (chat && (chat.countMessages > lastMessage || chat.maxUsersOnline > maxUsersOnline)) response.push(chat);
        });

        await Promise.allSettled(promises);

        const responseChats = new DataResponse<string[]>(Array.from(chatIdsSet));
        this.queueService.sendMessage(TopicsEnum.JOIN, socketId, EventsEnum.JOIN_CHAT, responseChats);

        return new DataResponse<ChatEntity[]>(response);
    }

    async leave(chatIds: string[], socketId: string): Promise<DataResponse<object>> {
        const filterLeaveChat = await this.chatsRepository.find({
            id: { $in: chatIds },
        });

        const chatIdsFound = filterLeaveChat.map((chat) => chat.id);
        const response: DataResponse<string[]> = new DataResponse<string[]>(chatIdsFound);
        this.queueService.sendMessage(TopicsEnum.LEAVE, socketId, EventsEnum.LEAVE_CHAT, response);

        return new DataResponse<object>({});
    }

    updateMaxUsersOnline(chatId: string, maxOnline: number): Promise<number> {
        return this.chatsRepository.nativeUpdate(
            {
                id: chatId,
                maxUsersOnline: { $lt: maxOnline },
            },
            { maxUsersOnline: maxOnline },
        );
    }

    async getSystemChats(): Promise<DataResponse<string | ChatEntity[]>> {
        const systemChats = await this.chatsRepository.getSystemChats();

        if (!systemChats) return new DataResponse(MessageErrorLanguageEnum.CHAT_WITH_ID_NOT_FOUND);

        return new DataResponse<ChatEntity[]>(systemChats);
    }

    async putSystemcChats() {
        const response = await this.getSystemChats();

        if (typeof response.data === 'string') {
            return;
        }

        const chatIds = response.data.map((chat) => chat.id);
        this.queueService.sendMessage(
            TopicsEnum.SYSTEM_CHATS,
            undefined,
            EventsEnum.GET_SYSTEM_CHAT,
            new DataResponse(chatIds),
        );
    }
}
