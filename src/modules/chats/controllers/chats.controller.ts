import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';
import { ChatsService } from '../services/chats.service';
import { CreateOpenChatDto } from '../dto/requests/create-open-chat.dto';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { ApiData } from '../../../common/swagger/api-data.decorator';
import { FavoriteChatsDto } from '../dto/requests/post-favorites-chat.dto';
import { LeaveChatsDto } from '../dto/requests/post-leave-chat.dto';
import { ApiDataEmpty } from '../../../common/swagger/api-data-empty.decorator';
import { TopicsEnum } from '../../queue/types/topics.enum';
import { OnlineCountUsers } from '../types/max-online-users';

@ApiTags('Chats')
@Controller('chats')
export class ChatsController {
    constructor(private readonly chatsService: ChatsService) {}

    @Post()
    @ApiData(ChatEntity)
    createChat(
        @Body() body: CreateOpenChatDto,
        @Headers('x-socket-id') socketId: string,
    ): Promise<DataResponse<string | ChatEntity>> {
        return this.chatsService.createChat(socketId, body);
    }

    @Get()
    @ApiData(ChatEntity, true)
    getChats(
        @Query() query: QueryGetChatsDto,
        @Headers('x-socket-id') socketId: string,
    ): Promise<DataResponse<ChatEntity[]>> {
        return this.chatsService.getChats(socketId, query);
    }

    @Get(':name')
    @ApiData(ChatEntity, true)
    getChatByName(
        @Param('name') name: string,
        @Headers('x-socket-id') socketId: string,
    ): Promise<DataResponse<string | ChatEntity>> {
        return this.chatsService.findChatByName(name, socketId);
    }

    @Post('join')
    @ApiData(ChatEntity, true)
    join(
        @Body() favoriteChatsDto: FavoriteChatsDto,
        @Headers('x-socket-id') socketId: string,
    ): Promise<DataResponse<string | ChatEntity[]>> {
        return this.chatsService.join(favoriteChatsDto.chats, socketId);
    }

    @Post('leave')
    @ApiDataEmpty()
    leave(
        @Body() leaveChatsDto: LeaveChatsDto,
        @Headers('x-socket-id') socketId: string,
    ): Promise<DataResponse<object>> {
        return this.chatsService.leave(leaveChatsDto.chatIds, socketId);
    }

    @MessagePattern(TopicsEnum.ONLINE)
    onlineCountUsers(message: OnlineCountUsers) {
        const { roomName, onlineUsers } = message.data;
        this.chatsService.updateMaxUsersOnline(roomName, onlineUsers);
    }

    @MessagePattern(TopicsEnum.PUT_SYSTEM_CHATS)
    putSystemChats() {
        this.chatsService.putSystemcChats();
    }

    @Get('system_chats')
    @ApiData(ChatEntity, true)
    getSystemChats(): Promise<DataResponse<string | ChatEntity[]>> {
        return this.chatsService.getSystemChats();
    }
}
