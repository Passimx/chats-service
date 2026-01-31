import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiData } from '../../common/swagger/api-data.decorator';
import { ApiDataEmpty } from '../../common/swagger/api-data-empty.decorator';
import { Public } from '../../common/guards/auth/public.decorator';
import { UserId } from '../../common/guards/auth/user.decorator';
import { UsersService } from './users.service';
import { UpdateDto } from './dto/requests/update.dto';
import { GetUserDto } from './dto/responses/get-user.dto';
import { GetMeDto } from './dto/responses/get-me.dto';
import { MeDto } from './dto/requests/me.dto';

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
    @Public()
    getMe(@Body() body: MeDto): ReturnType<typeof this.usersService.getMe> {
        return this.usersService.getMe(body);
    }

    @Patch('update')
    @ApiDataEmpty()
    updateUser(@UserId() userId: string, @Body() body: UpdateDto) {
        return this.usersService.updateUser({ id: userId, ...body });
    }
}
