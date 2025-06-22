import { Controller, Get, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { File, FilesInterceptor } from '@nest-lab/fastify-multer';
import { ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { FilesService } from '../services/files.service';
import { FileEntity } from '../entity/file.entity';
import { ApiData } from '../../../common/swagger/api-data.decorator';

@ApiTags('Files')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Post('upload')
    @ApiData(FileEntity)
    @UseInterceptors(FilesInterceptor('files'))
    async upload(@UploadedFiles() files: Array<File>): Promise<string[]> {
        return await this.filesService.uploadFiles(files);
    }

    @Get(':id')
    async downFile(@Param('id') id: string, @Res() reply: FastifyReply) {
        const { info, buffer } = await this.filesService.getFileData(id);

        const encodedFilename = this.filesService.encodeRFC5987ValueChars(info.originalName);

        reply.headers({
            'Content-Type': info.mimeType,
            'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
            'Content-Length': buffer.length,
        });

        reply.send(buffer);
    }
}
