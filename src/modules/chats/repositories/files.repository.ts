import { FilterQuery, QueryOrder, SqlEntityRepository } from '@mikro-orm/postgresql';
import { FileEntity } from '../entities/file.entity';
import { QueryGetFilesDto } from '../dto/requests/query-get-files.dto';
import { FileEnum } from '../types/file.enum';
import { getMimeTypeFilter } from '../utils/file.utils';

export class FilesRepository extends SqlEntityRepository<FileEntity> {
    getFile(publicKeyHash: string, body: Partial<FileEntity>): Promise<FileEntity | null> {
        return this.findOne(body);
    }

    public async findFilesByMediaType({ chatId, mediaType, limit, offset }: QueryGetFilesDto): Promise<FileEntity[]> {
        const where: FilterQuery<FileEntity> = {
            chatId,
            ...getMimeTypeFilter(mediaType),
        };

        const options: { orderBy: { createdAt: QueryOrder }; limit?: number; offset?: number } = {
            orderBy: { createdAt: QueryOrder.ASC },
        };

        if (limit) {
            options.limit = limit;
            options.offset = offset || 0;
        }

        return this.find(where, options);
    }

    public async findNextFile(
        chatId: string,
        currentCreatedAt: Date,
        mediaType?: FileEnum,
    ): Promise<FileEntity | null> {
        const where: FilterQuery<FileEntity> = {
            chatId,
            createdAt: { $gt: currentCreatedAt },
            ...getMimeTypeFilter(mediaType),
        };

        return this.findOne(where, {
            orderBy: { createdAt: QueryOrder.ASC },
        });
    }

    public async findPrevFile(
        chatId: string,
        currentCreatedAt: Date,
        mediaType?: FileEnum,
    ): Promise<FileEntity | null> {
        const where: FilterQuery<FileEntity> = {
            chatId: chatId,
            createdAt: { $lt: currentCreatedAt },
            ...getMimeTypeFilter(mediaType),
        };

        return this.findOne(where, {
            orderBy: { createdAt: QueryOrder.DESC },
        });
    }
}
