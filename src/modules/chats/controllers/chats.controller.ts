import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatsService } from '../services/chats.service';
import { CreateOpenChatDto } from '../dto/requests/create-open-chat.dto';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { ApiData } from '../../../common/swagger/api-data.decorator';
import { FavoriteChatsDto } from '../dto/requests/post-favorites-chat.dto';
import { LeaveChatsDto } from '../dto/requests/post-leave-chat.dto';

@ApiTags('Chats')
@Controller('chats')
export class ChatsController {
    constructor(private readonly chatsService: ChatsService) {}

    @Post()
    @ApiData(ChatEntity)
    createChat(
        @Body() body: CreateOpenChatDto,
        @Headers('socket_id') socketId: string,
    ): Promise<DataResponse<string | ChatEntity>> {
        return this.chatsService.createOpenChat(body.title, socketId);
    }

    @Get()
    @ApiData(ChatEntity, true)
    async getChats(@Query() query: QueryGetChatsDto): Promise<DataResponse<ChatEntity[]>> {
        return await this.chatsService.getOpenChats(query.title, query.offset, query.limit, query.notFavoriteChatIds);
    }

    @Get(':id')
    @ApiData(ChatEntity, true)
    async getChat(@Param('id') id: string): Promise<DataResponse<string | ChatEntity>> {
        return this.chatsService.findChat(id);
    }

    @Post('join')
    @ApiData(ChatEntity, true)
    async join(
        @Body() favoriteChatsDto: FavoriteChatsDto,
        @Headers('socket_id') socketId: string,
    ): Promise<DataResponse<string | ChatEntity[]>> {
        return this.chatsService.join(favoriteChatsDto.chats, socketId);
    }

    @Post('leave')
    async leave(@Body() leaveChatsDto: LeaveChatsDto, @Headers('socket_id') socketId: string): Promise<void> {
        this.chatsService.leave(leaveChatsDto.chatIds, socketId);
    }
}
