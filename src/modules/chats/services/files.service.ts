import { Injectable } from '@nestjs/common';
import { FilesRepository } from '../repositories/files.repository';
import { QueryGetFilesDto } from '../dto/requests/query-get-files.dto';

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
        const files = await this.fileRepository.findFilesByMediaType(userId, query);

        const result = files.map((file) => ({
            fileId: file.key,
            chatId: file.chatId,
        }));

        const nextOffset = files.length === query.limit && files.length > 0 ? files[files.length - 1].id : undefined;

        return {
            files: result,
            nextOffset,
        };
    }
}
