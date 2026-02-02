import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../../modules/auth/auth.service';
import { CryptoUtils } from '../../utils/crypto.utils';
import { IS_PUBLIC_METADATA_KEY } from './cerification-type.metadata-key';
import { CustomFastifyRequest } from './custom-fastify-request.type';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.getVerificationType(context);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest<CustomFastifyRequest>();
        const payload = await this.getJWTPayloadByContext(context);

        if (!payload) return false;

        request.userId = CryptoUtils.getHash(payload.rsaPublicKey);
        request.sessionId = payload.sessionId;

        return true;
    }

    private getJWTPayloadByContext(context: ExecutionContext): ReturnType<typeof this.authService.verifyTokenAsync> {
        const token = context.getArgs()[0]?.headers?.authorization as string;

        return this.authService.verifyTokenAsync(token);
    }

    private getVerificationType(context: ExecutionContext): boolean {
        return (
            this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_METADATA_KEY, [
                context.getHandler(),
                context.getClass(),
            ]) ?? false
        );
    }
}
