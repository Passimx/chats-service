import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { version } from '../package.json';
import { AppModule } from './modules/app.module';
import { Envs } from './common/envs/env';
import { MigrationService } from './common/config/mikro-orm/migration.service';
import { logger } from './common/logger/logger';
import { useSwagger } from './common/swagger/swagger';
import { useKafka } from './common/config/kafka/use-kafka';
import cors from '@fastify/cors';

export class App {
    private readonly ADDRESS: string;
    private readonly PORT: number;

    constructor(PORT: number, ADDRESS: string) {
        this.PORT = PORT;
        this.ADDRESS = ADDRESS;
    }

    public async run() {
        const app = await App.createNestApp();

        if (Envs.postgres.migrationsRun) {
            const migrationService = app.get(MigrationService);

            if (Envs.postgres.migrationsRun) await migrationService.migrate();
        }

        await app.register(cors, {
            origin: ['https://tons-chat.ru', 'http://localhost:3006'], // Разрешённые источники
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Разрешённые методы
            allowedHeaders: ['Content-Type', 'Authorization'], // Разрешённые заголовки
            credentials: true, // Разрешаем отправку кук и заголовков с токенами
        });

        app.useGlobalPipes(
            new ValidationPipe({
                validateCustomDecorators: true,
                whitelist: true,
                transform: true,
                transformOptions: { enableImplicitConversion: true },
                // forbidNonWhitelisted: true,
                skipMissingProperties: false,
                validationError: {
                    target: true,
                    value: true,
                },
            }),
        );

        if (Envs.swagger.isWriteConfig) useSwagger(app);

        await useKafka(app);

        await app.listen(this.PORT, this.ADDRESS);

        this.logInformationAfterStartServer(await app.getUrl());
    }

    public static createNestApp(): Promise<NestFastifyApplication> {
        return NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
            bufferLogs: true,
        });
    }

    private logInformationAfterStartServer(url: string) {
        logger.info(`Server is running on url: ${url} at ${Date()}. Version: '${version}'.`);

        if (Envs.swagger.isWriteConfig)
            logger.info(`Swagger is running on url: ${url}/${Envs.swagger.path} at ${Date()}. Version: '${version}'.`);
    }
}
