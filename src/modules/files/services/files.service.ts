import { Injectable } from '@nestjs/common';
import { InjectWebDAV, WebDAV } from 'nestjs-webdav';
import { File } from '@nest-lab/fastify-multer';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { EntityManager } from '@mikro-orm/core';
import { FileEntity } from '../entity/file.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { FileEnum } from '../types/file.enum';
import { logger } from '../../../common/logger/logger';

@Injectable()
export class FilesService {
    constructor(
        // @ts-ignore
        @InjectWebDAV()
        private readonly webDav: WebDAV,
        @InjectRepository(FileEntity)
        private readonly fileRepository: EntityRepository<FileEntity>,
        private readonly em: EntityManager,
    ) {}

    async uploadFiles(files: Array<File>, fileType: FileEnum): Promise<DataResponse<string[]>> {
        const arrayFiles: (FileEntity | undefined)[] = await Promise.all(
            files.map((file) => this.uploadFile(file, fileType)),
        );
        const filteredFiles: FileEntity[] = arrayFiles.filter((file) => !!file) as FileEntity[];

        return new DataResponse(filteredFiles.map((fileEntity) => fileEntity.id));
    }

    async uploadFile(file: File, fileType: FileEnum): Promise<FileEntity | undefined> {
        const fork = this.em.fork(); // отдельный EM для транзакции
        await fork.begin();

        try {
            const fileEntity = new FileEntity(file.originalname, file.mimetype, fileType, file.size);
            await fork.insert(FileEntity, fileEntity);
            const filePath = fileEntity.id;

            await this.webDav.putFileContents(filePath, file.buffer);

            await fork.commit();

            return fileEntity;
        } catch (e) {
            logger.error(`Error to upload file '${file.originalname}' with size '${file.size} bytes'.`);
            await fork.rollback();
        }
    }

    async getFileData(id: string): Promise<{
        info: FileEntity;
        buffer: Buffer;
    }> {
        const fileInfo = await this.fileRepository.findOne(id);

        const buffer = (await this.webDav.getFileContents(id)) as Buffer;

        return {
            info: fileInfo as FileEntity,
            buffer,
        };
    }

    encodeRFC5987ValueChars(str: string): string {
        return encodeURIComponent(str)
            .replace(/['()]/g, escape)
            .replace(/\*/g, '%2A')
            .replace(/%(?:7C|60|5E)/g, unescape);
    }
}
