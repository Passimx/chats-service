import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, raw } from '@mikro-orm/postgresql';
import { EntityManager } from '@mikro-orm/core';
import { MessageEntity } from '../entities/message.entity';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { QueueService } from '../../queue/queue.service';
import { EventsEnum } from '../../queue/types/events.enum';
import { MessageErrorLanguageEnum } from '../types/message-error-language.enum';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { ChatTypeEnum } from '../types/chat-type.enum';
import { FileEntity } from '../entities/file.entity';
import { FileEnum } from '../types/file.enum';
import { logger } from '../../../common/logger/logger';
import { CreateFileDto } from '../dto/requests/create-file.dto';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(MessageEntity)
        private readonly messageRepository: EntityRepository<MessageEntity>,
        private readonly queueService: QueueService,
        private readonly em: EntityManager,
    ) {}

    async createMessage(
        payload: Partial<MessageEntity>,
        files?: CreateFileDto[],
    ): Promise<DataResponse<MessageEntity | string>> {
        if (!payload.message?.trim() && (!files || files.length === 0)) {
            return new DataResponse(MessageErrorLanguageEnum.INVALID_DATA);
        }

        const { parentMessageId, chatId } = payload;
        const fork = this.em.fork();
        await fork.begin();

        try {
            let parentMessage: MessageEntity | null = null;

            if (parentMessageId) {
                parentMessage = await fork.findOne(MessageEntity, { id: parentMessageId, chatId });

                if (!parentMessage) {
                    await fork.rollback();

                    return new DataResponse(MessageErrorLanguageEnum.PARENT_MESSAGE_NOT_FOUND);
                }
            }

            await fork.nativeUpdate(
                ChatEntity,
                { id: chatId, type: { $ne: ChatTypeEnum.IS_SYSTEM } },
                { countMessages: raw('count_messages + 1') },
            );

            const chat = await fork.findOneOrFail(ChatEntity, { id: chatId });

            if (!chat) {
                await fork.rollback();

                return new DataResponse(MessageErrorLanguageEnum.CHAT_NOT_FOUND);
            }

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
                    files.map((file) => new FileEntity({ ...file, chatId, chat, message: messageEntity })),
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

                return new DataResponse(MessageErrorLanguageEnum.MESSAGE_NOT_FOUND);
            }

            const response = new DataResponse<MessageEntity | string>(newMessageEntity);

            this.queueService.sendMessage(TopicsEnum.EMIT, String(chatId), EventsEnum.CREATE_MESSAGE, response);

            // Отправляем запросы на транскрипцию для голосовых файлов
            if (files?.length && chatId) {
                this.sendTranscriptionRequests(files, chatId);
            }

            return response;
        } catch (e) {
            logger.error(e);
            await fork.rollback();

            return new DataResponse(MessageErrorLanguageEnum.MESSAGE_NOT_FOUND);
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

    private sendTranscriptionRequests(files: CreateFileDto[], chatId: string): void {
        const voiceFiles = files.filter((file) => file.fileType === FileEnum.IS_VOICE);

        for (const file of voiceFiles) {
            try {
                // Отправляем запрос на транскрипцию через Kafka
                // Формат: { data: { fileId: string, chatId: string } }
                this.queueService.sendMessage(
                    TopicsEnum.AUDIO_TRANSCRIPTION_REQUEST,
                    chatId,
                    EventsEnum.TRANSCRIBE_AUDIO,
                    new DataResponse({
                        fileId: file.key,
                        chatId: chatId,
                    }),
                );

                logger.info(`Sent transcription request for fileId: ${file.key}, chatId: ${chatId}`);
            } catch (error: any) {
                logger.error(`Failed to send transcription request for fileId: ${file.key}: ${error.message}`);
            }
        }
    }
}
