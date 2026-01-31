import { Injectable, NotFoundException } from '@nestjs/common';
import { FilesRepository } from '../repositories/files.repository';
import { QueryGetFilesDto } from '../dto/requests/query-get-files.dto';
import { FileEntity } from '../entities/file.entity';

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

    public async getFilesByMediaType(query: QueryGetFilesDto): Promise<{ files: FileEntity[]; nextOffset?: number }> {
        const files = await this.fileRepository.findFilesByMediaType(query);

        const nextOffset = files.length === query.limit && query.limit ? (query.offset || 0) + query.limit : undefined;

        return {
            files,
            nextOffset,
        };
    }

    public async getNextFilesByMediaType(query: QueryGetFilesDto): Promise<FileEntity | null> {
        if (!query.createdAt) {
            return null;
        }

        const file = await this.fileRepository.findNextFile(query.chatId, query.createdAt, query.mediaType);

        return file;
    }

    public async getPrevFilesByMediaType(query: QueryGetFilesDto): Promise<FileEntity | null> {
        if (!query.createdAt) {
            return null;
        }

        const file = await this.fileRepository.findPrevFile(query.chatId, query.createdAt, query.mediaType);

        return file;
    }

    public async getFileById(fileId: string, chatId: string): Promise<FileEntity> {
        const file = await this.fileRepository.findOne({ key: fileId, chatId });

        if (!file) {
            throw new NotFoundException('File not found');
        }

        return file;
    }
}
