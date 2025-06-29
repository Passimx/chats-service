import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateMessageDto } from '../dto/requests/create-post-message.dto';
import { MessagesService } from '../services/messages.service';
import { MessageEntity } from '../entities/message.entity';
import { QueryGetMessagesDto } from '../dto/requests/query-get-messages.dto';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { MessageTypeEnum } from '../types/message-type.enum';
import { ApiData } from '../../../common/swagger/api-data.decorator';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Post()
    @ApiData(MessageEntity)
    createMessage(@Body() message: CreateMessageDto): Promise<DataResponse<MessageEntity | string>> {
        return this.messagesService.createMessage(
            message.chatId,
            MessageTypeEnum.IS_USER,
            message.encryptMessage,
            message.message,
            message.parentMessageId,
            message.fileIds,
        );
    }

    @Get()
    @ApiData(MessageEntity, true)
    getMessages(@Query() query: QueryGetMessagesDto): Promise<DataResponse<MessageEntity[]>> {
        return this.messagesService.getMessages(query.chatId, query.limit, query.offset);
    }
}
