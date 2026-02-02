import { FastifyRequest } from 'fastify';

export interface CustomFastifyRequest extends FastifyRequest {
    userId: string;
    sessionId: string;
}
