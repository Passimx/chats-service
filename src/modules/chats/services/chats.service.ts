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
import { MessageTypeEnum } from '../types/message-type.enum';
import { SystemMessageLanguageEnum } from '../types/system-message-language.enum';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { Mutable } from '../../../common/types/mutable.type';
import { ChatKeyEntity } from '../entities/chat-key.entity';
import { KeepKeyDto } from '../dto/requests/keep-key.dto';
import { UsersRepository } from '../../users/repositories/users.repository';
import { UpdateReadChatType } from '../dto/response/update-read-chat.dto';
import { ChatKeysRepository } from '../repositories/chat-keys.repository';
import { MessagesService } from './messages.service';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(MessageEntity)
        readonly messageRepository: EntityRepository<MessageEntity>,
        private readonly chatKeysRepository: ChatKeysRepository,
        private readonly queueService: QueueService,
        private readonly messagesService: MessagesService,
        private readonly usersRepository: UsersRepository,
        private readonly chatsRepository: ChatsRepository,
    ) {}

    public async createChat(userId: string, { title }: CreateOpenChatDto): Promise<DataResponse<ChatEntity>> {
        const chatEntity = new ChatEntity({ title });

        await this.chatsRepository.insert(chatEntity);
        await this.chatsRepository.nativeUpdate({ id: chatEntity.id }, { name: chatEntity.id });
        await this.chatKeysRepository.insert({ chatId: chatEntity.id, userId } as ChatKeyEntity);

        const messageResponse = await this.messagesService.createMessage({
            chat: chatEntity,
            chatId: chatEntity.id,
            type: MessageTypeEnum.IS_CREATED_CHAT,
            message: SystemMessageLanguageEnum.CHAT_IS_CREATE,
            userId,
        });

        if (!messageResponse.success) return new DataResponse<ChatEntity>(MessageErrorEnum.MESSAGE_NOT_FOUND);

        const createChat = await this.chatsRepository.findOne({ id: chatEntity.id }, { populate: ['message'] });

        await this.joinUserToChat(userId, chatEntity.id);

        return new DataResponse<ChatEntity>(createChat!);
    }

    public async getChats(userId: string, query: QueryGetChatsDto): Promise<DataResponse<ChatEntity[]>> {
        const chats = await this.chatsRepository.findChats(userId, query);
        const data = chats.map((chat) => this.prepareDialogue(userId, chat));

        if (!data.length) {
            const chat = await this.getDialogueByKeys(userId, query.search);
            const userKey = chat?.keys.getItems().find((chetKey) => chetKey.userId === userId);

            if (chat && !userKey?.isMember) data.push(chat);
        }

        return new DataResponse(data);
    }

    public async findChatByName(name: string, userId: string): Promise<DataResponse<string | ChatEntity>> {
        let chat = await this.chatsRepository.findChatByName(userId, name);

        if (chat) return new DataResponse(this.prepareDialogue(userId, chat));

        chat = await this.getDialogueByKeys(userId, name);

        if (!chat) return new DataResponse(MessageErrorEnum.CHAT_WITH_ID_NOT_FOUND);

        return new DataResponse(chat);
    }

    public async listenChats(userId: string, sessionId: string): Promise<DataResponse<ChatEntity[]>> {
        const chatEntities = await this.chatsRepository.getUserChats(userId);

        const chatIds = chatEntities?.map((chat) => chat.id);

        await this.queueService.sendMessage(
            TopicsEnum.JOIN_USER_TO_CHAT,
            userId,
            EventsEnum.JOIN_CHAT,
            new DataResponse<string[]>(chatIds),
        );

        await this.queueService.sendMessage(
            TopicsEnum.JOIN_CONNECTION_TO_USER_ROOM,
            `${sessionId}${userId}`,
            EventsEnum.JOIN_CHAT,
            new DataResponse<string>(userId),
        );

        const chats = chatEntities.map((chat) => this.prepareDialogue(userId, chat));

        return new DataResponse<ChatEntity[]>(chats);
    }

    public async getDialogueByKeys(userId: string, secondUserId?: string) {
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

    public async getSystemChats(): Promise<DataResponse<string | ChatEntity[]>> {
        const systemChats = await this.chatsRepository.getSystemChats();

        if (!systemChats) return new DataResponse(MessageErrorEnum.CHAT_WITH_ID_NOT_FOUND);

        return new DataResponse<ChatEntity[]>(systemChats);
    }

    public prepareDialogue(userId: string, chat: ChatEntity): ChatEntity {
        if (chat.type !== ChatTypeEnum.IS_DIALOGUE) return chat;

        const chatKey = chat.keys.find((key) => key.userId !== userId);

        if (!chatKey) return chat;

        const payload: Mutable<ChatEntity> = { ...chat };

        payload.title = chatKey.user.name;
        payload.name = chatKey.user.userName;

        return payload;
    }

    public async receiveKey(chatId: string, userId: string): Promise<void> {
        await this.chatKeysRepository.nativeUpdate({ chatId, userId }, { received: true });
    }

    public async readMessage(userId: string, chatId: string, readMessageNumber: number): Promise<void> {
        await this.chatKeysRepository.nativeUpdate(
            { chatId, userId, readMessageNumber: { $lt: readMessageNumber } },
            { readMessageNumber },
        );

        await this.queueService.sendMessage(
            TopicsEnum.EMIT_TO_USER_ROOM,
            userId,
            EventsEnum.UPDATE_CHAT,
            new DataResponse<UpdateReadChatType>({ id: chatId, readMessage: readMessageNumber }),
        );
    }

    public async joinConnectionToChat(connectionsName: string, chatId: string) {
        await this.queueService.sendMessage(
            TopicsEnum.JOIN_CONNECTION_TO_CHAT,
            connectionsName,
            EventsEnum.JOIN_CHAT,
            new DataResponse([chatId]),
        );
    }
    public async leaveConnectionFromChat(connectionsName: string, chatId: string) {
        await this.queueService.sendMessage(
            TopicsEnum.LEAVE_CONNECTION_FROM_CHAT,
            connectionsName,
            EventsEnum.LEAVE_CHAT,
            new DataResponse([chatId]),
        );
    }

    public async leaveConnection(connectionsName: string, chatId: string) {
        await this.queueService.sendMessage(
            TopicsEnum.LEAVE_CONNECTION_FROM_CHAT,
            connectionsName,
            EventsEnum.LEAVE_CHAT,
            new DataResponse([chatId]),
        );
    }

    public async keepChatKey(userId: string, chatId: string, body: KeepKeyDto): Promise<void> {
        await this.chatKeysRepository.findOneOrFail(
            {
                userId,
                chatId,
                chat: { type: { $in: [ChatTypeEnum.IS_FAVORITES, ChatTypeEnum.IS_DIALOGUE] } },
                encryptionKey: null,
            },
            { populate: ['chat'] },
        );

        const tasks: Promise<unknown>[] = [];

        body.keys.forEach(({ userId, encryptionKey }) => {
            tasks.push(
                this.chatKeysRepository.nativeUpdate({ chatId, userId, encryptionKey: null }, { encryptionKey }),
            );
            tasks.push(
                this.queueService.sendMessage(
                    TopicsEnum.JOIN_USER_TO_CHAT,
                    userId,
                    EventsEnum.JOIN_CHAT,
                    new DataResponse<string[]>([chatId]),
                ),
            );
        });

        await Promise.all(tasks);
    }

    public async joinUserToChat(userId: string, chatId: string): Promise<void> {
        const [chat] = await this.chatsRepository.findChats(userId, { chatIds: [chatId] });

        if (!chat) return;

        const chatKey = await this.chatKeysRepository.upsert(
            {
                chatId,
                userId,
                readMessageNumber: chat.countMessages,
                isMember: true,
                createdAt: 'NOW()' as unknown as Date,
            } as ChatKeyEntity,
            {
                onConflictFields: ['userId', 'chatId'],
            },
        );
        chat.keys.add(chatKey);

        await this.queueService.sendMessage(
            TopicsEnum.EMIT_TO_USER_ROOM,
            userId,
            EventsEnum.JOIN_CHAT,
            new DataResponse<ChatEntity>(this.prepareDialogue(userId, chat)),
        );
        await this.queueService.sendMessage(
            TopicsEnum.JOIN_USER_TO_CHAT,
            userId,
            EventsEnum.JOIN_CHAT,
            new DataResponse<string[]>([chatId]),
        );
    }

    public async leaveUserAllChats(userId: string): Promise<void> {
        const chatKeys = await this.chatKeysRepository.getUserIds(userId);
        const chatIds = chatKeys.map((chatKey) => chatKey.id!);

        await this.chatKeysRepository.nativeUpdate({ userId, isMember: true }, { isMember: false });

        await this.queueService.sendMessage(
            TopicsEnum.EMIT_TO_USER_ROOM,
            userId,
            EventsEnum.LEAVE_CHAT,
            new DataResponse<string[]>(chatIds),
        );
        await this.queueService.sendMessage(
            TopicsEnum.LEAVE_USER_FROM_CHAT,
            userId,
            EventsEnum.LEAVE_CHAT,
            new DataResponse<string[]>(chatIds),
        );
    }

    public async leaveUserFromChat(userId: string, chatId: string): Promise<void> {
        await this.chatKeysRepository.nativeUpdate({ chatId, userId, isMember: true }, { isMember: false });

        await this.queueService.sendMessage(
            TopicsEnum.EMIT_TO_USER_ROOM,
            userId,
            EventsEnum.LEAVE_CHAT,
            new DataResponse<string[]>([chatId]),
        );
        await this.queueService.sendMessage(
            TopicsEnum.LEAVE_USER_FROM_CHAT,
            userId,
            EventsEnum.LEAVE_CHAT,
            new DataResponse<string[]>([chatId]),
        );
    }
}
