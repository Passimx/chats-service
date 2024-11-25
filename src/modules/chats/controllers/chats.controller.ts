import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { ChatsService } from '../services/chats.service';
import { CreateOpenChatDto } from '../dto/requests/create-open-chat.dto';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { ApiData } from '../../../common/swagger/api-data.decorator';

@Controller('chats')
export class ChatsController {
    constructor(private readonly chatsService: ChatsService) {}

    @ApiData(ChatEntity)
    @Post()
    createChat(
        @Body() body: CreateOpenChatDto,
        @Headers('socket_id') socketId: string,
    ): Promise<DataResponse<ChatEntity>> {
        return this.chatsService.createOpenChat(body.title, socketId);
    }

    @ApiData(ChatEntity, true)
    @Get()
    async getChats(@Query() query: QueryGetChatsDto): Promise<DataResponse<ChatEntity[]>> {
        return await this.chatsService.getOpenChats(query.title, query.offset, query.limit);
    }

    @ApiData(ChatEntity, true)
    @Get(':id')
    async getChat(@Param('id') id: number): Promise<DataResponse<string | ChatEntity>> {
        return this.chatsService.findChat(id);
    }
}
