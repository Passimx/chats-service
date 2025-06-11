import { Module } from '@nestjs/common';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';
import { WebDAVModule } from 'nestjs-webdav';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Envs } from '../../common/envs/env';
import { FilesService } from './services/files.service';
import { FilesController } from './controllers/files.controller';
import { FilesEntity } from './entity/files.entity';

@Module({
    imports: [
        MikroOrmModule.forFeature([FilesEntity]),
        FastifyMulterModule,
        WebDAVModule.forRootAsync({
            useFactory: () => {
                return {
                    config: {
                        endpoint: `http://${Envs.webdev.host}:${Envs.webdev.port}`,
                        username: Envs.webdev.user,
                        password: Envs.webdev.password,
                    },
                };
            },
        }),
    ],
    controllers: [FilesController],
    providers: [FilesService],
})
export class FilesModule {}
