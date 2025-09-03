import { Module } from '@nestjs/common';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';
import { WebDAVModule } from 'nestjs-webdav';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Envs } from '../../common/envs/env';
import { AudioProcessor } from '../queueBullMQ/services/queueBullMQ.service';
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
        BullModule.forRoot({
            connection: {
                host: Envs.redis.host,
                port: Envs.redis.port,
            },
        }),
        BullModule.registerQueue({
            name: 'audio_analysis_queue',
        }),
    ],
    controllers: [FilesController],
    providers: [FilesService, AudioProcessor],
    exports: [FilesService],
})
export class FilesModule {}
