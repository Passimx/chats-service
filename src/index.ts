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

        // ✅ Регистрируем CORS правильно
        await app.register(cors, {
            origin: (origin, callback) => {
                // ⚠ Разрешаем только определённые домены
                const allowedOrigins = ['https://tons-chat.ru', 'http://localhost:3006'];

                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);  // ✅ Разрешено
                } else {
                    callback(new Error('CORS not allowed'), false);  // ❌ Блокируем
                }
            },
            methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // ⚠ Добавил HEAD (может быть нужен)
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true, // ✅ Нужно, если используете куки или авторизацию
            preflightContinue: false, // ✅ Fastify сам отправит preflight-ответ
            optionsSuccessStatus: 204, // ✅ Должно быть 204, иначе браузер жалуется
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
