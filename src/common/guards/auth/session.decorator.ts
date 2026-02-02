import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomFastifyRequest } from './custom-fastify-request.type';

export const SessionId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<CustomFastifyRequest>();

    return request?.sessionId;
});
