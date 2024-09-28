import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChatsService } from './services/chats.service';
import { CreateOpenChatDto } from './dto/responses/create-open-chat.dto';
import { QueryGetChatsDto } from './dto/responses/query-get-chats.dto';

@Controller('chats')
export class ChatsController {
    constructor(private readonly chatsService: ChatsService) {}
    @Post()
    createChat(@Body() body: CreateOpenChatDto) {
        return this.chatsService.createOpenChat(body.title);
    }

    @Get()
    async getChats(@Query() query: QueryGetChatsDto) {
        return await this.chatsService.getOpenChats(query.title, query.limit);
    }
}
