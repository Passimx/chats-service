import { Body, Controller, Get, Query, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { CreateMessageDto } from '../dto/requests/create-post-message';
import { MessagesService } from '../services/messages.service';
import { MessageEntity } from '../entities/message.entity';
import { QueryGetMessagesDto } from '../dto/requests/query-get-messages.dto';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}
    @ApiOkResponse({
        type: MessageEntity,
    })
    @Post()
    createMessage(@Body() message: CreateMessageDto) {
        return this.messagesService.createMessage(message.encryptMessage, message.chatId);
    }

    @ApiOkResponse({
        type: MessageEntity,
        isArray: true,
    })
    @Get()
    getMessages(@Query() query: QueryGetMessagesDto) {
        return this.messagesService.getMessages(query.chatId, query.limit, query.offset);
    }
}
