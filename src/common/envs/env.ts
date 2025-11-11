import * as process from 'process';
import { config } from 'dotenv';
import { NumbersUtils } from '../utils/numbers.utils';
import { BooleanUtils } from './boolean.utils';

config();

export const Envs = {
    main: {
        host: '0.0.0.0',
        appPort: NumbersUtils.toNumberOrDefault(process.env.CHATS_SERVICE_APP_PORT, 6020),
        blackListTitles: process.env.CHATS_SERVICE_FORBIDDEN_TITLES,
    },

    postgres: {
        host: process.env.PG_HOST || 'postgres',
        port: NumbersUtils.toNumberOrDefault(process.env.PG_PORT, 5432),
        name: process.env.PG_DATABASE || 'postgres',
        username: process.env.PG_USERNAME || 'postgres',
        password: process.env.PG_PASSWORD || 'postgres',
        migrationsRun: BooleanUtils.strToBoolWithDefault(process.env.PG_MIGRATIONS_RUN, true),
        logging: BooleanUtils.strToBoolWithDefault(process.env.PG_LOGGING, false),
    },

    swagger: {
        path: process.env.SWAGGER_PATH || 'docs',
        isWriteConfig: BooleanUtils.strToBoolWithDefault(process.env.SWAGGER_IS_WRITE_CONFIG, false),
        url: `http://localhost:${process.env.APP_PORT ?? 3000}`,
        description: 'development',
    },

    kafka: {
        host: process.env.KAFKA_HOST || 'kafka',
        port: process.env.KAFKA_EXTERNAL_PORT || 9094,
        user: String(process.env.KAFKA_CLIENT_USERS) || 'user',
        password: String(process.env.KAFKA_USER_PASSWORD) || 'bitnami',
        groupId: String(process.env.CHATS_SERVICE_KAFKA_GROUP_ID) || 'chat-service',
        kafkaIsConnect: BooleanUtils.strToBoolWithDefault(process.env.KAFKA_IS_CONNECT, true),
    },
};
