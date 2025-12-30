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
        query: QueryGetFilesDto,
    ): Promise<{ files: Array<{ fileId: string }>; nextOffset?: number }> {
        const files = await this.fileRepository.findFilesByMediaType(query);

        const result = files.map((file) => ({
            fileId: file.key,
        }));

        const nextOffset = files.length === query.limit && query.limit ? (query.offset || 0) + query.limit : undefined;

        return {
            files: result,
            nextOffset,
        };
    }
}
