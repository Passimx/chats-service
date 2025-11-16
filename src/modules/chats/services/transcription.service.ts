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

        if (!file) {
            return;
        }

        if (!file.transcriptionVoice || file.transcriptionVoice.trim().length === 0) {
            await this.fileRepository.nativeUpdate({ key: fileId }, { transcriptionVoice: transcriptionVoice });
        }
    }

    async getTranscriptionService(id: string): Promise<DataResponse<{ transcription: string } | string>> {
        const file = await this.fileRepository.findOne({ key: id });

        if (!file || !file.transcriptionVoice) {
            return new DataResponse('Voice message not found');
        }

        return new DataResponse({ transcription: file.transcriptionVoice });
    }
}
