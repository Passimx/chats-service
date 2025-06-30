import { Transport } from '@nestjs/microservices';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Envs } from '../../envs/env';

export async function useKafka(app: NestFastifyApplication) {
    if (Envs.kafka.kafkaIsConnect) {
        app.connectMicroservice({
            name: 'CLIENT_KAFKA',
            transport: Transport.KAFKA,
            options: {
                createTopics: true,
                client: {
                    brokers: [`${Envs.kafka.host}:${Envs.kafka.port}`],
                    sasl: {
                        username: Envs.kafka.user,
                        password: Envs.kafka.password,
                        mechanism: 'plain',
                    },
                },
                consumer: {
                    groupId: 'tit-chat-service',
                },
            },
        });

        await app.startAllMicroservices();
    }
}
