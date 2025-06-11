import { Injectable } from '@nestjs/common';
import { InjectWebDAV, WebDAV } from 'nestjs-webdav';
import { File } from '@nest-lab/fastify-multer';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { FilesEntity } from '../entity/files.entity';

@Injectable()
export class FilesService {
    constructor(
        // @ts-ignore
        @InjectWebDAV()
        private readonly webDav: WebDAV,
        @InjectRepository(FilesEntity)
        private readonly fileRepository: EntityRepository<FilesEntity>,
    ) {}

    async uploadFile(file: File): Promise<FilesEntity> {
        const fileEntity = new FilesEntity(file.originalname, file.mimetype, file.size);
        await this.fileRepository.insert(fileEntity);
        const filePath = fileEntity.id;
        await this.webDav.putFileContents(filePath, file.buffer);

        return fileEntity;
    }
}
