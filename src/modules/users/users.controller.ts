import { Body, Controller, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../common/swagger/api-data.decorator';
import { ApiDataEmpty } from '../../common/swagger/api-data-empty.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/requests/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { MeDto } from './dto/requests/me.dto';
import { GetMeDto } from './dto/responses/get-me.dto';
import { UpdateDto } from './dto/requests/update.dto';
import { GetUserDto } from './dto/responses/get-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get(':userName')
    @ApiData(GetUserDto)
    getUserByUserName(@Param('userName') userName: string): ReturnType<typeof this.usersService.getUserByUserName> {
        return this.usersService.getUserByUserName(userName);
    }

    @Post('me')
    @ApiData(GetMeDto)
    getMe(@Body() body: MeDto): ReturnType<typeof this.usersService.getMe> {
        return this.usersService.getMe(body);
    }

    @Post('create')
    @ApiData(UserEntity)
    createUser(@Body() body: CreateUserDto): ReturnType<typeof this.usersService.createUser> {
        return this.usersService.createUser(body);
    }

    @Patch('update')
    @ApiDataEmpty()
    updateUser(@Headers('x-socket-id') userId: string, @Body() body: UpdateDto) {
        return this.usersService.updateUser({ id: userId, ...body });
    }
}
