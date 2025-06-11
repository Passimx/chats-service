import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { File, FileInterceptor } from '@nest-lab/fastify-multer';
import { FilesService } from '../services/files.service';
import { FilesEntity } from '../entity/files.entity';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: File): Promise<FilesEntity> {
        return await this.filesService.uploadFile(file);
    }
}
