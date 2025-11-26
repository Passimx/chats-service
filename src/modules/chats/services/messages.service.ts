import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, raw } from '@mikro-orm/postgresql';
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
import { ChatsService } from './chats.service';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(MessageEntity)
        private readonly messageRepository: EntityRepository<MessageEntity>,
        private readonly queueService: QueueService,
        @InjectRepository(ChatEntity)
        private readonly chatRepository: EntityRepository<ChatEntity>,
        private readonly em: EntityManager,
        @Inject(forwardRef(() => ChatsService))
        private readonly chatsService: ChatsService,
        readonly chatsRepository: ChatsRepository,
    ) {}

    async createMessage(
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
                parentMessage: parentMessage ?? undefined,
            });

            await fork.populate(messageEntity, ['parentMessage', 'files']);

            await fork.insert(MessageEntity, messageEntity);

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
                            }),
                    ),
                );

            await fork.commit();

            const newMessageEntity: MessageEntity | null = await this.messageRepository.findOne(
                { id: messageEntity.id },
                {
                    populate: ['parentMessage', 'files', 'parentMessage.files'],
                    orderBy: { files: { createdAt: 'ASC' }, parentMessage: { files: { createdAt: 'ASC' } } },
                },
            );

            if (!newMessageEntity) {
                await fork.rollback();

                return new DataResponse(MessageErrorEnum.MESSAGE_NOT_FOUND);
            }

            const response = new DataResponse<MessageEntity | string>(newMessageEntity);

            // Отправляем запросы на транскрипцию для голосовых файлов
            if (files?.length && chatId) {
                await this.sendTranscriptionRequests(files, chatId);
            }

            if (newMessageEntity.number === 1) {
                const chat = await this.chatsRepository.getChatById(chatId!);

                const tasks: Promise<unknown>[] = chat!.keys.map(({ publicKeyHash }) => {
                    const response = new DataResponse<ChatEntity>(
                        this.chatsService.prepareDialogue(publicKeyHash, chat!),
                    );

                    return this.queueService.sendMessage(
                        TopicsEnum.EMIT,
                        publicKeyHash,
                        EventsEnum.CREATE_DIALOGUE,
                        response,
                    );
                });
                await Promise.all(tasks);
            } else
                await this.queueService.sendMessage(
                    TopicsEnum.EMIT,
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

    async getMessages(chatId: string, limit: number, offset: number): Promise<DataResponse<MessageEntity[]>> {
        const getMessageNotSearch = await this.messageRepository.find(
            { chat: chatId, number: { $gt: offset ?? undefined } },
            {
                limit: limit,
                populate: ['parentMessage', 'files', 'parentMessage.files'],
                orderBy: { number: 'ASC', files: { createdAt: 'ASC' }, parentMessage: { files: { createdAt: 'ASC' } } },
            },
        );

        return new DataResponse(getMessageNotSearch);
    }

    async sendTranscriptionRequests(files: CreateFileDto[], chatId: string) {
        const voiceFiles = files.filter((file) => file.fileType === FileEnum.IS_VOICE);

        const chat = await this.chatRepository.findOne(chatId);

        if (chat?.type === ChatTypeEnum.IS_OPEN) {
            for (const file of voiceFiles) {
                this.queueService.sendMessage(
                    TopicsEnum.AUDIO_TRANSCRIPTION_REQUEST,
                    chatId,
                    EventsEnum.TRANSCRIBE_AUDIO,
                    new DataResponse({
                        fileId: file.key,
                        chatId: chatId,
                    }),
                );
            }
        }
    }
}
