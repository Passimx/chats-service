import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventPattern } from '@nestjs/microservices';
import { ApiData } from '../../common/swagger/api-data.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/requests/create-user.dto';
import { UsersService } from '../users/users.service';
import { ApiDataEmpty } from '../../common/swagger/api-data-empty.decorator';
import { Public } from '../../common/guards/auth/public.decorator';
import { SessionId } from '../../common/guards/auth/session.decorator';
import { UserId } from '../../common/guards/auth/user.decorator';
import { TopicsEnum } from '../queue/types/topics.enum';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/requests/login.dto';
import { OnlineDto } from './dto/requests/online.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Post('logout')
    @ApiDataEmpty()
    logout(@SessionId() sessionId: string, @UserId() userId: string): ReturnType<typeof this.authService.logout> {
        return this.authService.logout(sessionId, userId);
    }

    @Post('login')
    @Public()
    login(@Body() body: LoginDto): ReturnType<typeof this.authService.login> {
        return this.authService.login(body);
    }

    @Post('create')
    @ApiData(UserEntity)
    @Public()
    create(@Body() body: CreateUserDto): ReturnType<typeof this.usersService.createUser> {
        return this.usersService.createUser(body);
    }

    @EventPattern(TopicsEnum.LOGOUT)
    queueLogout(@Body() body: OnlineDto): ReturnType<typeof this.authService.logout> {
        return this.authService.logout(body.sessionId, body.userId);
    }

    @EventPattern(TopicsEnum.ONLINE)
    online(@Body() body: OnlineDto): ReturnType<typeof this.authService.online> {
        return this.authService.online(body);
    }

    @EventPattern(TopicsEnum.OFFLINE)
    offline(@Body() body: OnlineDto): ReturnType<typeof this.authService.offline> {
        return this.authService.offline(body);
    }
}
