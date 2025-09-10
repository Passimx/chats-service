import { Module, forwardRef } from '@nestjs/common';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';
import { WebDAVModule } from 'nestjs-webdav';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Envs } from '../../common/envs/env';
import { QueueModule } from '../queue/queue.module';

import { FilesService } from './services/files.service';
import { FilesController } from './controllers/files.controller';
import { FileEntity } from './entity/file.entity';

@Module({
    imports: [
        MikroOrmModule.forFeature([FileEntity]),
        FastifyMulterModule,
        WebDAVModule.forRootAsync({
            useFactory: () => {
                return {
                    config: {
                        endpoint: `${Envs.webdev.host}:${Envs.webdev.port}`,
                        username: Envs.webdev.user,
                        password: Envs.webdev.password,
                    },
                };
            },
        }),
        forwardRef(() => QueueModule),
    ],
    controllers: [FilesController],
    providers: [FilesService],
    exports: [FilesService],
})
export class FilesModule {}
