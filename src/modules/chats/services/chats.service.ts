import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { EventsEnum } from '../../queue/types/events.enum';
import { QueueService } from '../../queue/queue.service';
import { MessageErrorEnum } from '../types/message-error.enum';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { MessageEntity } from '../entities/message.entity';
import { ChatsRepository } from '../repositories/chats.repository';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { CreateOpenChatDto } from '../dto/requests/create-open-chat.dto';
import { ChatDto } from '../dto/requests/post-favorites-chat.dto';
import { MessageTypeEnum } from '../types/message-type.enum';
import { SystemMessageLanguageEnum } from '../types/system-message-language.enum';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { Mutable } from '../../../common/types/mutable.type';
import { PublicKeyEntity } from '../../keys/entities/public-key.entity';
import { MessagesService } from './messages.service';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(MessageEntity)
        readonly messageRepository: EntityRepository<MessageEntity>,
        @InjectRepository(PublicKeyEntity)
        private readonly publicKeysRepository: EntityRepository<PublicKeyEntity>,
        private readonly queueService: QueueService,
        private readonly messagesService: MessagesService,
        readonly chatsRepository: ChatsRepository,
    ) {}

    public async createChat(socketId: string, { title }: CreateOpenChatDto): Promise<DataResponse<ChatEntity>> {
        const chatEntity = new ChatEntity({ title });

        await this.chatsRepository.insert(chatEntity);
        await this.chatsRepository.nativeUpdate({ id: chatEntity.id }, { name: chatEntity.id });

        const messageResponse = await this.messagesService.createMessage({
            chat: chatEntity,
            chatId: chatEntity.id,
            type: MessageTypeEnum.IS_CREATED_CHAT,
            message: SystemMessageLanguageEnum.CHAT_IS_CREATE,
        });

        if (!messageResponse.success) return new DataResponse<ChatEntity>(MessageErrorEnum.MESSAGE_NOT_FOUND);

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

    public async getChats(socketId: string, query: QueryGetChatsDto): Promise<DataResponse<ChatEntity[]>> {
        const chats = await this.chatsRepository.findChats(socketId, query);
        const data = chats.map((chat) => this.prepareDialogue(socketId, chat));

        if (!chats.length) {
            const chat = await this.getPublicKeyAsDialogue(socketId, query.search);

            if (chat) data.push(chat);
        }

        return new DataResponse(data);
    }

    public async findChatByName(name: string, publicKeyHash: string): Promise<DataResponse<string | ChatEntity>> {
        let chat = await this.chatsRepository.findChatByName(name, publicKeyHash);

        if (chat) return new DataResponse(this.prepareDialogue(publicKeyHash, chat));

        chat = await this.getPublicKeyAsDialogue(publicKeyHash, name);

        if (!chat) return new DataResponse(MessageErrorEnum.CHAT_WITH_ID_NOT_FOUND);

        return new DataResponse(chat);
    }

    public async getPublicKeyAsDialogue(publicKeyHash: string, name: string) {
        const publicKey = await this.publicKeysRepository.findOne({ name, publicKeyHash: { $ne: publicKeyHash } });

        if (!publicKey) return null;

        return {
            title: publicKey.metadata.name,
            name: publicKey.publicKeyHash,
            countMessages: 0,
            type: ChatTypeEnum.IS_DIALOGUE,
            maxUsersOnline: 0,
        } as ChatEntity;
    }

    public async join(chats: ChatDto[], socketId: string): Promise<DataResponse<string | ChatEntity[]>> {
        const response: ChatEntity[] = [];
        const chatIdsSet = new Set<string>();

        // новые чаты
        const notReceivedChats = await this.chatsRepository.getNotReceivedChats(socketId);
        notReceivedChats?.forEach((chat) => {
            response.push(this.prepareDialogue(socketId, chat));
            chatIdsSet.add(chat.id);
        });

        const promises = chats.map(async ({ name, lastMessage, maxUsersOnline }) => {
            const chat = await this.chatsRepository.findChatByName(name, socketId);

            if (!chat || chatIdsSet.has(chat?.id)) return;

            if (chat) chatIdsSet.add(chat.id);

            if (chat && (chat.countMessages > lastMessage || chat.maxUsersOnline > maxUsersOnline)) {
                response.push(this.prepareDialogue(socketId, chat));
            }
        });

        await Promise.allSettled(promises);

        const responseChats = new DataResponse<string[]>(Array.from(chatIdsSet));
        this.queueService.sendMessage(TopicsEnum.JOIN, socketId, EventsEnum.JOIN_CHAT, responseChats);

        return new DataResponse<ChatEntity[]>(response);
    }

    public async leave(chatIds: string[], socketId: string): Promise<DataResponse<object>> {
        const filterLeaveChat = await this.chatsRepository.find({
            id: { $in: chatIds },
        });

        const chatIdsFound = filterLeaveChat.map((chat) => chat.id);
        const response: DataResponse<string[]> = new DataResponse<string[]>(chatIdsFound);
        this.queueService.sendMessage(TopicsEnum.LEAVE, socketId, EventsEnum.LEAVE_CHAT, response);

        return new DataResponse<object>({});
    }

    public updateMaxUsersOnline(chatId: string, maxOnline: number): Promise<number> {
        return this.chatsRepository.nativeUpdate(
            {
                id: chatId,
                maxUsersOnline: { $lt: maxOnline },
            },
            { maxUsersOnline: maxOnline },
        );
    }

    public async getSystemChats(): Promise<DataResponse<string | ChatEntity[]>> {
        const systemChats = await this.chatsRepository.getSystemChats();

        if (!systemChats) return new DataResponse(MessageErrorEnum.CHAT_WITH_ID_NOT_FOUND);

        return new DataResponse<ChatEntity[]>(systemChats);
    }

    public async putSystemcChats() {
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

    public prepareDialogue(socketId: string, chat: ChatEntity): ChatEntity {
        if (chat.type !== ChatTypeEnum.IS_DIALOGUE) return chat;

        const chatKey = chat.keys.find((key) => key.publicKeyHash !== socketId);

        if (!chatKey) return chat;

        const payload: Mutable<ChatEntity> = chat;

        payload.title = chatKey.publicKey.name;

        return payload;
    }
}
