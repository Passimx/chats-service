import { Injectable } from '@nestjs/common';
import { InjectWebDAV, WebDAV } from 'nestjs-webdav';
import { File } from '@nest-lab/fastify-multer';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { FileEntity } from '../entity/file.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';

@Injectable()
export class FilesService {
    constructor(
        // @ts-ignore
        @InjectWebDAV()
        private readonly webDav: WebDAV,
        @InjectRepository(FileEntity)
        private readonly fileRepository: EntityRepository<FileEntity>,
    ) {}

    async uploadFiles(files: Array<File>): Promise<DataResponse<string[]>> {
        const arrayFiles = await Promise.all(files.map((file) => this.uploadFile(file)));

        return new DataResponse(arrayFiles.map((fileEntity) => fileEntity.id));
    }

    async uploadFile(file: File): Promise<FileEntity> {
        const fileEntity = new FileEntity(file.originalname, file.mimetype, file.size);
        await this.fileRepository.insert(fileEntity);
        const filePath = fileEntity.id;
        await this.webDav.putFileContents(filePath, file.buffer);

        return fileEntity;
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
