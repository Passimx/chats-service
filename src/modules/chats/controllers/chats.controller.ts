import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatsService } from '../services/chats.service';
import { CreateOpenChatDto } from '../dto/requests/create-open-chat.dto';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { ApiData } from '../../../common/swagger/api-data.decorator';
import { ApiDataEmpty } from '../../../common/swagger/api-data-empty.decorator';
import { KeepKeyDto } from '../dto/requests/keep-key.dto';
import { ReadMessageDto } from '../dto/requests/read-message.dto';
import { SocketIdDto } from '../dto/requests/socket-id.dto';
import { UserId } from '../../../common/guards/auth/user.decorator';
import { SessionId } from '../../../common/guards/auth/session.decorator';

@ApiTags('Chats')
@Controller('chats')
export class ChatsController {
    constructor(private readonly chatsService: ChatsService) {}

    @Post('listen')
    @ApiDataEmpty()
    listenChats(@UserId() userId: string, @SessionId() sessionId: string) {
        return this.chatsService.listenChats(userId, sessionId);
    }

    @Post('all/leave')
    @ApiDataEmpty()
    leaveUserAllChats(@UserId() userId: string) {
        return this.chatsService.leaveUserAllChats(userId);
    }

    @Post()
    @ApiData(ChatEntity)
    createChat(@Body() body: CreateOpenChatDto, @UserId() userId: string): Promise<DataResponse<string | ChatEntity>> {
        return this.chatsService.createChat(userId, body);
    }

    @Get()
    @ApiData(ChatEntity, true)
    getChats(@Query() query: QueryGetChatsDto, @UserId() userId: string): Promise<DataResponse<ChatEntity[]>> {
        return this.chatsService.getChats(userId, query);
    }

    @Get(':name')
    @ApiData(ChatEntity, true)
    getChatByName(@Param('name') name: string, @UserId() userId: string): Promise<DataResponse<string | ChatEntity>> {
        return this.chatsService.findChatByName(name, userId);
    }

    @Post(':id/keys/keep')
    @ApiDataEmpty()
    keepChatKey(
        @Param('id', ParseUUIDPipe) chatId: string,
        @UserId() userId: string,
        @Body() body: KeepKeyDto,
    ): Promise<void> {
        return this.chatsService.keepChatKey(userId, chatId, body);
    }

    @Post(':chatId/keys/receive')
    @ApiDataEmpty()
    receiveKey(@Param('chatId', ParseUUIDPipe) chatId: string, @UserId() userId: string) {
        return this.chatsService.receiveKey(chatId, userId);
    }

    @Post(':chatId/listen')
    @ApiDataEmpty()
    joinConnectionToChat(@Param('chatId', ParseUUIDPipe) chatId: string, @Body() body: SocketIdDto) {
        return this.chatsService.joinConnectionToChat(body.socketId, chatId);
    }

    @Post(':chatId/no_listen')
    @ApiDataEmpty()
    leaveConnectionFromChat(@Param('chatId', ParseUUIDPipe) chatId: string, @Body() body: SocketIdDto) {
        return this.chatsService.leaveConnectionFromChat(body.socketId, chatId);
    }

    @Get('system_chats')
    @ApiData(ChatEntity, true)
    getSystemChats(): Promise<DataResponse<string | ChatEntity[]>> {
        return this.chatsService.getSystemChats();
    }

    @Post(':chatId/messages/read')
    @ApiDataEmpty()
    readMessage(
        @UserId() userId: string,
        @Param('chatId', ParseUUIDPipe) chatId: string,
        @Body() body: ReadMessageDto,
    ) {
        return this.chatsService.readMessage(userId, chatId, body.number);
    }

    @Post(':chatId/join')
    @ApiDataEmpty()
    joinUserToChat(@UserId() userId: string, @Param('chatId', ParseUUIDPipe) chatId: string) {
        return this.chatsService.joinUserToChat(userId, chatId);
    }

    @Post(':chatId/leave')
    @ApiDataEmpty()
    leaveUserFromChat(@UserId() userId: string, @Param('chatId', ParseUUIDPipe) chatId: string) {
        return this.chatsService.leaveUserFromChat(userId, chatId);
    }
}
