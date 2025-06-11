import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { File, FileInterceptor } from '@nest-lab/fastify-multer';
import { FilesService } from '../services/files.service';
import { FilesEntity } from '../entity/files.entity';
import { ApiData } from '../../../common/swagger/api-data.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Post('upload')
    @ApiData(FilesEntity)
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: File): Promise<FilesEntity> {
        return await this.filesService.uploadFile(file);
    }
}
