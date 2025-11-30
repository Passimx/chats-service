import { SqlEntityRepository } from '@mikro-orm/postgresql';
import { FileEntity } from '../entities/file.entity';

export class FilesRepository extends SqlEntityRepository<FileEntity> {
    getFile(publicKeyHash: string, body: Partial<FileEntity>): Promise<FileEntity | null> {
        const qb = this.createQueryBuilder('file');

        qb.andWhere(body);

        return qb.getSingleResult();
    }
}
