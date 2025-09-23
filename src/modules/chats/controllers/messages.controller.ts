import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateMessageDto } from '../dto/requests/create-post-message.dto';
import { MessagesService } from '../services/messages.service';
import { MessageEntity } from '../entities/message.entity';
import { QueryGetMessagesDto } from '../dto/requests/query-get-messages.dto';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { ApiData } from '../../../common/swagger/api-data.decorator';
import { MessageTypeEnum } from '../types/message-type.enum';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Post()
    @ApiData(MessageEntity)
    createMessage(@Body() body: CreateMessageDto): Promise<DataResponse<MessageEntity | string>> {
        const { files, ...payload } = body;
        const message: Partial<MessageEntity> = { ...payload, type: MessageTypeEnum.IS_USER };

        return this.messagesService.createMessage(message, files);
    }

    @Get()
    @ApiData(MessageEntity, true)
    getMessages(@Query() query: QueryGetMessagesDto): Promise<DataResponse<MessageEntity[]>> {
        return this.messagesService.getMessages(query.chatId, query.limit, query.offset);
    }
}
