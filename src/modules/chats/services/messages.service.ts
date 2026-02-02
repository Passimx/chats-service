import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { raw } from '@mikro-orm/postgresql';
import { EntityManager } from '@mikro-orm/core';
import { MessageEntity } from '../entities/message.entity';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { QueueService } from '../../queue/queue.service';
import { EventsEnum } from '../../queue/types/events.enum';
import { MessageErrorEnum } from '../types/message-error.enum';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { FileEntity } from '../entities/file.entity';
import { FileEnum } from '../types/file.enum';
import { logger } from '../../../common/logger/logger';
import { CreateFileDto } from '../dto/requests/create-file.dto';
import { ChatsRepository } from '../repositories/chats.repository';
import { MessagesRepository } from '../repositories/messages.repository';
import { FilesRepository } from '../repositories/files.repository';
import { QueryGetMessagesDto } from '../dto/requests/query-get-messages.dto';
import { UserEntity } from '../../users/entities/user.entity';
import { ChatKeysRepository } from '../repositories/chat-keys.repository';
import { ChatsService } from './chats.service';

@Injectable()
export class MessagesService {
    constructor(
        private readonly messageRepository: MessagesRepository,
        private readonly queueService: QueueService,
        private readonly em: EntityManager,
        @Inject(forwardRef(() => ChatsService))
        private readonly chatsService: ChatsService,
        private readonly chatsRepository: ChatsRepository,
        private readonly filesRepository: FilesRepository,
        private readonly chatKeysRepository: ChatKeysRepository,
    ) {}

    public async createMessage(
        payload: Partial<MessageEntity>,
        files?: CreateFileDto[],
    ): Promise<DataResponse<MessageEntity | string>> {
        if (!payload.message?.trim() && (!files || files.length === 0)) {
            return new DataResponse(MessageErrorEnum.INVALID_DATA);
        }

        const { parentMessageId, chatId } = payload;
        const fork = this.em.fork();
        await fork.begin();

        try {
            const parentMessage = parentMessageId
                ? await fork.findOneOrFail(MessageEntity, { id: parentMessageId, chatId })
                : undefined;

            const user = await fork.findOneOrFail(UserEntity, { id: payload.userId });

            await fork.nativeUpdate(
                ChatEntity,
                { id: chatId, type: { $ne: ChatTypeEnum.IS_SYSTEM } },
                { countMessages: raw('count_messages + 1') },
            );

            const chat = await fork.findOneOrFail(ChatEntity, { id: chatId });

            const messageEntity = new MessageEntity({
                ...payload,
                chat: chat,
                number: chat.countMessages,
                user,
                parentMessage: parentMessage ?? undefined,
            });

            await fork.populate(messageEntity, ['parentMessage', 'files']);

            await fork.insert(MessageEntity, messageEntity);

            let transcriptionVoice = undefined;

            if (![ChatTypeEnum.IS_OPEN].includes(chat.type)) transcriptionVoice = null;

            if (files?.length)
                await fork.insertMany(
                    files.map(
                        (file, index) =>
                            new FileEntity({
                                ...file,
                                chatId,
                                chat,
                                message: messageEntity,
                                createdAt: new Date(Date.now() + index),
                                metadata: { ...file.metadata, transcriptionVoice },
                            }),
                    ),
                );

            await fork.commit();

            const newMessageEntity: MessageEntity | null = await this.messageRepository.findOneOrFail(
                { id: messageEntity.id },
                {
                    populate: ['parentMessage', 'files', 'parentMessage.files', 'user'],
                    orderBy: { files: { createdAt: 'ASC' }, parentMessage: { files: { createdAt: 'ASC' } } },
                },
            );

            const response = new DataResponse<MessageEntity | string>(newMessageEntity);

            // Отправляем запросы на транскрипцию для голосовых файлов
            if (transcriptionVoice !== null) await this.sendTranscriptionRequests(messageEntity.files.getItems());

            if (newMessageEntity.number === 1) {
                await this.chatKeysRepository.nativeUpdate({ chatId, isMember: false }, { isMember: true });
                const chat = await this.chatsRepository.getChatById(chatId!);

                const tasks: Promise<unknown>[] = chat!.keys.map(({ userId }) => {
                    const response = new DataResponse<ChatEntity>(this.chatsService.prepareDialogue(userId, chat!));

                    return this.queueService.sendMessage(
                        TopicsEnum.EMIT_TO_USER_ROOM,
                        userId,
                        EventsEnum.JOIN_CHAT,
                        response,
                    );
                });
                await Promise.all(tasks);
            } else
                await this.queueService.sendMessage(
                    TopicsEnum.EMIT_TO_CHAT,
                    String(chatId),
                    EventsEnum.CREATE_MESSAGE,
                    response,
                );

            return response;
        } catch (e) {
            logger.error(e);
            await fork.rollback();

            return new DataResponse(MessageErrorEnum.MESSAGE_NOT_FOUND);
        }
    }

    public async getMessages(userId: string, query: QueryGetMessagesDto): Promise<DataResponse<MessageEntity[]>> {
        const messages = await this.messageRepository.findMessages(userId, query);

        return new DataResponse(messages);
    }

    public async getFile(
        publicKeyHash: string,
        messageId: string,
        fileId: string,
    ): Promise<DataResponse<FileEntity | string>> {
        const file = await this.filesRepository.getFile(publicKeyHash, { messageId, id: fileId });

        if (!file) return new DataResponse('file not found');

        return new DataResponse(file);
    }

    private async sendTranscriptionRequests(files: FileEntity[]) {
        const voiceFiles = files.filter((file) => file.fileType === FileEnum.IS_VOICE);

        for (const file of voiceFiles) {
            await this.queueService.sendMessage(
                TopicsEnum.AUDIO_TRANSCRIPTION_REQUEST,
                file.chatId,
                EventsEnum.TRANSCRIBE_AUDIO,
                new DataResponse({
                    fileId: file.key,
                    chatId: file.chatId,
                }),
            );
        }
    }
}
