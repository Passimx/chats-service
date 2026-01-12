import { FilterQuery, QueryOrder, SqlEntityRepository } from '@mikro-orm/postgresql';
import { FileEntity } from '../entities/file.entity';
import { QueryGetFilesDto } from '../dto/requests/query-get-files.dto';
import { FileEnum } from '../types/file.enum';

export class FilesRepository extends SqlEntityRepository<FileEntity> {
    getFile(publicKeyHash: string, body: Partial<FileEntity>): Promise<FileEntity | null> {
        return this.findOne(body);
    }

    public async findFilesByMediaType({ chatId, mediaType, limit, offset }: QueryGetFilesDto): Promise<FileEntity[]> {
        const where: FilterQuery<FileEntity> = { chatId };

        switch (mediaType) {
            case FileEnum.IS_PHOTO:
                where.mimeType = { $like: 'image/%' };
                break;
            case FileEnum.IS_VIDEO:
                where.mimeType = { $like: 'video/%' };
                break;
            case FileEnum.IS_AUDIO:
                where.mimeType = { $like: 'audio/%' };
                break;
        }

        const options: { orderBy: { number: QueryOrder }; limit?: number; offset?: number } = {
            orderBy: { number: QueryOrder.ASC },
        };

        if (limit) {
            options.limit = limit;
            options.offset = offset || 0;
        }

        return this.find(where, options);
    }

    public async findFileByNumber(chatId: string, mediaType: FileEnum, number: number): Promise<FileEntity | null> {
        const where: FilterQuery<FileEntity> = { chatId, number };

        switch (mediaType) {
            case FileEnum.IS_PHOTO:
                where.mimeType = { $like: 'image/%' };
                break;
            case FileEnum.IS_VIDEO:
                where.mimeType = { $like: 'video/%' };
                break;
            case FileEnum.IS_AUDIO:
                where.mimeType = { $like: 'audio/%' };
                break;
        }

        return this.findOne(where);
    }

    public async findNextFile(chatId: string, mediaType: FileEnum, currentNumber: number): Promise<FileEntity | null> {
        return this.findFileByNumber(chatId, mediaType, currentNumber + 1);
    }

    public async findPrevFile(chatId: string, mediaType: FileEnum, currentNumber: number): Promise<FileEntity | null> {
        return this.findFileByNumber(chatId, mediaType, currentNumber - 1);
    }
}
