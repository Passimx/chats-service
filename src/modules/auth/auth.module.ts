import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { Envs } from '../../common/envs/env';
import { QueueModule } from '../queue/queue.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [
        QueueModule,
        UsersModule,
        JwtModule.register({
            global: true,
            secret: Envs.main.appSalt,
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule {}
