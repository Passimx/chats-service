import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Envs } from '../../common/envs/env';
import { QueueService } from './queue.service';
import { InjectEnum } from './types/inject.enum';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: InjectEnum.NOTIFICATIONS_MICROSERVICE,
                transport: Transport.KAFKA,
                options: {
                    client: {
                        brokers: [`${Envs.kafka.host}:${Envs.kafka.port}`],
                        sasl: {
                            username: Envs.kafka.user,
                            password: Envs.kafka.password,
                            mechanism: 'plain',
                        },
                    },
                    producerOnlyMode: true,
                },
            },
        ]),
    ],
    providers: [QueueService],
    exports: [QueueService],
})
export class QueueModule {}
