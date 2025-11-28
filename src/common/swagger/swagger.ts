import { writeFileSync } from 'fs';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Envs } from '../envs/env';
import projectInfo from '../../../package.json';

export function useSwagger(app: NestFastifyApplication): void {
    const documentBuilder = new DocumentBuilder();
    documentBuilder.addServer(Envs.swagger.url, Envs.swagger.description);

    const config = documentBuilder
        .setTitle(projectInfo.name)
        .setVersion(projectInfo.version)
        .setLicense(projectInfo.license, projectInfo.description)
        .build();

    const document = SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true,
    });

    SwaggerModule.setup(Envs.swagger.path, app, document, {
        swaggerOptions: {
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            persistAuthorization: true,
        },
    });

    if (Envs.swagger.isWriteConfig) writeFileSync('./api/swagger.json', JSON.stringify(document, null, '\t'));
}
