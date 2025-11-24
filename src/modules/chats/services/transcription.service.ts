import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { FileEntity } from '../entities/file.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';

@Injectable()
export class TranscriptionService {
    constructor(
        @InjectRepository(FileEntity)
        private readonly fileRepository: EntityRepository<FileEntity>,
    ) {}

    async addTranscriptionVoice(fileId: string, transcriptionVoice: string): Promise<void> {
        const file = await this.fileRepository.findOne({ key: fileId });

        if (!file || file.metadata?.transcriptionVoice) {
            return;
        }

        await this.fileRepository.nativeUpdate(
            { key: fileId },
            { metadata: { ...(file.metadata || {}), transcriptionVoice } },
        );
    }

    async getTranscriptionVoice(id: string): Promise<DataResponse<{ transcription: string } | string>> {
        const file = await this.fileRepository.findOne({ key: id });

        if (!file || !file.metadata?.transcriptionVoice) {
            return new DataResponse('Voice message not found');
        }

        return new DataResponse({ transcription: file.metadata.transcriptionVoice as string });
    }
}
