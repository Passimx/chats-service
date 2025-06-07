import { Module } from '@nestjs/common';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';
import { WebDAVModule } from 'nestjs-webdav';
import { FilesController } from './files.controller';

@Module({
    imports: [
        FastifyMulterModule,
        WebDAVModule.forRootAsync({
            useFactory: () => {
                return {
                    config: {
                        endpoint: 'http://localhost:8080/remote.php/webdav',
                        username: 'nextclouduser',
                        password: 'example_password',
                    },
                };
            },
        }),
    ],
    controllers: [FilesController],
})
export class FilesModule {}
