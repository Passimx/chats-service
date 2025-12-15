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
import { ChatKeyEntity } from '../entities/chat-key.entity';
import { KeepKeyDto } from '../dto/requests/keep-key.dto';
import { UsersRepository } from '../../users/repositories/users.repository';
import { MessagesService } from './messages.service';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(MessageEntity)
        readonly messageRepository: EntityRepository<MessageEntity>,
        @InjectRepository(ChatKeyEntity)
        private readonly chatKeysRepository: EntityRepository<ChatKeyEntity>,
        private readonly queueService: QueueService,
        private readonly messagesService: MessagesService,
        private readonly usersRepository: UsersRepository,
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
            userId: socketId,
        });

        if (!messageResponse.success) return new DataResponse<ChatEntity>(MessageErrorEnum.MESSAGE_NOT_FOUND);

        const createChat = await this.chatsRepository.findOne({ id: chatEntity.id }, { populate: ['message'] });

        const response = new DataResponse<ChatEntity>(createChat!);
        await this.queueService.sendMessage(TopicsEnum.EMIT, socketId, EventsEnum.CREATE_CHAT, response);
        const chatId: string[] = [chatEntity.id];

        await this.queueService.sendMessage(
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

            if (chat && !query.notFavoriteChatIds?.includes(chat.id)) data.push(chat);
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

    public async getPublicKeyAsDialogue(userId: string, secondUserId: string) {
        const dialogue = await this.chatsRepository.getDialogueByKeys([{ userId }, { userId: secondUserId }]);

        if (dialogue) return this.prepareDialogue(userId, dialogue);

        const user = await this.usersRepository.findOne({ $and: [{ id: { $ne: userId } }, { id: secondUserId }] });

        if (!user) return null;

        const chatEntity = new ChatEntity({ type: ChatTypeEnum.IS_DIALOGUE });
        await this.chatsRepository.insert(chatEntity);
        await this.chatsRepository.nativeUpdate({ id: chatEntity.id }, { name: chatEntity.id });
        await this.chatKeysRepository.insertMany([
            {
                chatId: chatEntity.id,
                userId,
            },
            { userId: user.id, chatId: chatEntity.id },
        ] as ChatKeyEntity[]);

        const chatWithKeys = await this.chatsRepository.getChatById(chatEntity.id);

        return this.prepareDialogue(userId, chatWithKeys!);
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

        const promises = chats.map(async ({ chatId, lastMessage, maxUsersOnline }) => {
            const chat = await this.chatsRepository.getChatById(chatId);

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
        await this.queueService.sendMessage(
            TopicsEnum.SYSTEM_CHATS,
            undefined,
            EventsEnum.GET_SYSTEM_CHAT,
            new DataResponse(chatIds),
        );
    }

    public prepareDialogue(socketId: string, chat: ChatEntity): ChatEntity {
        if (chat.type !== ChatTypeEnum.IS_DIALOGUE) return chat;

        const chatKey = chat.keys.find((key) => key.userId !== socketId);

        if (!chatKey) return chat;

        const payload: Mutable<ChatEntity> = { ...chat };

        payload.title = chatKey.user.name;
        payload.name = chatKey.user.name;

        return payload;
    }

    public async receiveKey(chatId: string, userId: string): Promise<void> {
        await this.chatKeysRepository.nativeUpdate({ chatId, userId }, { received: true });
    }

    public async keepChatKey(userId: string, chatId: string, body: KeepKeyDto): Promise<void> {
        await this.chatKeysRepository.findOneOrFail(
            { userId, chatId, chat: { type: { $in: [ChatTypeEnum.IS_FAVORITES, ChatTypeEnum.IS_DIALOGUE] } } },
            { populate: ['chat'] },
        );

        const tasks: Promise<unknown>[] = [];

        body.keys.forEach(({ userId, encryptionKey }) => {
            tasks.push(
                this.chatKeysRepository.nativeUpdate({ chatId, userId, encryptionKey: null }, { encryptionKey }),
            );
            tasks.push(
                this.queueService.sendMessage(
                    TopicsEnum.JOIN,
                    userId,
                    EventsEnum.JOIN_CHAT,
                    new DataResponse<string[]>([chatId]),
                ),
            );
        });

        await Promise.all(tasks);
    }
}
