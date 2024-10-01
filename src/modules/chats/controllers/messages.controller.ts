import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { CreateMessageDto } from '../dto/requests/create-post-message';
import { MessagesService } from '../services/messages.service';
import { MessageEntity } from '../entities/message.entity';

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
}
