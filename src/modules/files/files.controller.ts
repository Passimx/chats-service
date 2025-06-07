import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, File } from '@nest-lab/fastify-multer';
import { InjectWebDAV, WebDAV } from 'nestjs-webdav';

@Controller('files')
export class FilesController {
    // @ts-ignore
    constructor(@InjectWebDAV() private readonly webDav: WebDAV) {}
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: File) {
        if (!(await this.webDav.exists('uploads'))) await this.webDav.createDirectory('/uploads');

        await this.webDav.putFileContents(`/uploads/${file.originalname}`, file.buffer);
    }
}
