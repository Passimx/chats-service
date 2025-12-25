import { Injectable } from '@nestjs/common';
import { FilesRepository } from '../repositories/files.repository';

@Injectable()
export class FilesService {
    constructor(private readonly fileRepository: FilesRepository) {}

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

    public async getFilesByMediaType(
        userId: string,
        query: QueryGetFilesDto,
    ): Promise<{ files: Array<{ fileId: string; chatId: string }>; nextOffset?: string }> {
        const result = await this.fileRepository.findFilesByMediaType(userId, query)

        //дописать логику

        return {
            files: result,
            nextOffset
        }
    }
}
