import { Transport } from '@nestjs/microservices';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Envs } from '../../envs/env';

export async function useKafka(app: NestFastifyApplication) {
    if (Envs.kafka.kafkaIsConnect) {
        app.connectMicroservice({
            name: 'CLIENT_KAFKA',
            transport: Transport.KAFKA,
            connectionTimeout: 10000, // Увеличиваем таймаут до 10 сек
            retry: {
                initialRetryTime: 300, // Первый повтор через 300ms
                retries: 10, // Увеличиваем количество попыток
            },
            options: {
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
