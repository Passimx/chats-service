import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { FileEntity } from '../entities/file.entity';

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
}
