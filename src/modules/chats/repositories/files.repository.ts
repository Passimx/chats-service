import { SqlEntityRepository, QueryOrder } from '@mikro-orm/postgresql';
import { FileEntity } from '../entities/file.entity';
import { QueryGetFilesDto, MediaTypeEnum } from '../dto/requests/query-get-files.dto';
import { ChatTypeEnum } from '../types/chat-type.enum';

export class FilesRepository extends SqlEntityRepository<FileEntity> {
    getFile(publicKeyHash: string, body: Partial<FileEntity>): Promise<FileEntity | null> {
        const qb = this.createQueryBuilder('file');
        qb.andWhere(body);
        return qb.getSingleResult();
    }

    public async findFilesByMediaType(
        userId: string,
        { chatId, mediaType, limit, offset }: QueryGetFilesDto,
    ): Promise<FileEntity[]> {
        const qb = this.createQueryBuilder('file')
            .innerJoin('file.chat', 'chat', { 'chat.id': chatId })
            .leftJoin('chat.keys', 'userKey', { 'userKey.userId': userId })
            .where({
                $or: [
                    { 'chat.type': { $in: [ChatTypeEnum.IS_OPEN, ChatTypeEnum.IS_SYSTEM] } },
                    { 'userKey.userId': userId },
                ],
            })
            .orderBy({ 'file.createdAt': QueryOrder.DESC })
            .limit(limit);

        // Фильтрация по mimeType
        if (mediaType === MediaTypeEnum.PHOTO) {
            qb.andWhere({ 'file.mimeType': { $like: 'image/%' } });
        } else if (mediaType === MediaTypeEnum.VIDEO) {
            qb.andWhere({ 'file.mimeType': { $like: 'video/%' } });
        } else if (mediaType === MediaTypeEnum.AUDIO) {
            qb.andWhere({ 'file.mimeType': { $like: 'audio/%' } });
        }

        if (offset) {
            qb.andWhere({ 'file.id': { $lt: offset } });
        }

        return qb.getResultList();
    }
}