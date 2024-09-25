import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { Envs } from '../../envs/env';

export default defineConfig({
    allowGlobalContext: true,
    disableIdentityMap: true,
    extensions: [Migrator],
    host: Envs.postgres.host,
    port: Envs.postgres.port,
    user: Envs.postgres.username,
    password: Envs.postgres.password,
    dbName: Envs.postgres.name,
    entities: ['dist/**/*.entity{.ts,.js}'],
    entitiesTs: ['src/**/*.entity{.ts,.js}'],
    driver: PostgreSqlDriver,
    strict: true,
    ignoreUndefinedInQuery: true,
    validate: true,
    forceUtcTimezone: true,
    debug: Envs.postgres.logging,
    verbose: Envs.postgres.logging,
    migrations: {
        path: './dist/src/migrations',
        pathTs: './src/migrations',
        snapshot: false,
        tableName: 'mikro_orm_migrations',
        glob: '!(*.d).{js,ts}',
        transactional: true,
        allOrNothing: true,
        emit: 'ts',
        disableForeignKeys: false,
    },
});
