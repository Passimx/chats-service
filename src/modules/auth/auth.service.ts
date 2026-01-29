import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/repositories/users.repository';
import { DataResponse } from '../../common/swagger/data-response.dto';
import { MessageErrorEnum } from '../chats/types/message-error.enum';
import { SessionsRepository } from '../users/repositories/sessions.repository';
import { SessionEntity } from '../users/entities/session.entity';
import { QueueService } from '../queue/queue.service';
import { TopicsEnum } from '../queue/types/topics.enum';
import { EventsEnum } from '../queue/types/events.enum';
import { LoginDto } from './dto/requests/login.dto';
import { TokenType } from './types/token.type';
import { TokenDto } from './dto/responses/token.dto';
import { OnlineDto } from './dto/requests/online.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly sessionsRepository: SessionsRepository,
        private readonly usersRepository: UsersRepository,
        private readonly jwtService: JwtService,
        private readonly queueService: QueueService,
    ) {}

    public async login(body: LoginDto): Promise<DataResponse<TokenDto>> {
        const { userId, passwordHash, seedPhraseHash, encryptionUserAgent } = body;
        const user = await this.usersRepository.findOne({ id: userId, passwordHash, seedPhraseHash });

        if (!user) return new DataResponse<TokenDto>(MessageErrorEnum.USER_NOT_FOUND);

        const session = new SessionEntity({ user, userId, encryptionUserAgent });
        await this.sessionsRepository.insert(session);

        const payload: TokenType = { sessionId: session.id, rsaPublicKey: user.rsaPublicKey };
        const token = await this.jwtService.signAsync(payload);

        return new DataResponse<TokenDto>({ token });
    }

    public async logout(sessionId: string, userId: string): Promise<void> {
        await this.sessionsRepository.nativeDelete({ id: sessionId });
        await this.queueService.sendMessage(
            TopicsEnum.LEAVE_CONNECTION_FROM_USER_ROOM,
            `${sessionId}${userId}`,
            EventsEnum.LEAVE_CHAT,
            new DataResponse<object>({}),
        );
        await this.sendSessions(userId);
    }

    async verifyTokenAsync(token: string): Promise<TokenType | undefined> {
        try {
            const payload = await this.jwtService.verifyAsync<TokenType>(token);

            await this.sessionsRepository.findOneOrFail({
                id: payload.sessionId,
                user: { rsaPublicKey: payload.rsaPublicKey },
            });

            return payload;
        } catch (e) {
            return undefined;
        }
    }

    public async sendSessions(userId: string): Promise<void> {
        const sessions = await this.sessionsRepository.find({ userId });

        await this.queueService.sendMessage(
            TopicsEnum.EMIT_TO_USER_ROOM,
            userId,
            EventsEnum.UPDATE_ME,
            new DataResponse<Partial<any>>({ sessions }),
        );
    }

    public async online(body: OnlineDto) {
        await this.sessionsRepository.nativeUpdate({ id: body.sessionId }, { isOnline: true, updatedAt: 'NOW()' });
        await this.sendSessions(body.userId);
    }

    public async offline(body: OnlineDto) {
        await this.sessionsRepository.nativeUpdate({ id: body.sessionId }, { isOnline: false, updatedAt: 'NOW()' });
        await this.sendSessions(body.userId);
    }
}
