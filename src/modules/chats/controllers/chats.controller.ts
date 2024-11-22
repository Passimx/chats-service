import { applyDecorators, Body, Controller, Get, Headers, Param, Post, Query, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ChatsService } from '../services/chats.service';
import { CreateOpenChatDto } from '../dto/requests/create-open-chat.dto';
import { QueryGetChatsDto } from '../dto/requests/query-get-chats.dto';
import { ChatEntity } from '../entities/chat.entity';
import { DataResponse } from '../../../common/swagger/data-response.dto';
import { MessageEntity } from '../entities/message.entity';

export function ApiData(type: Type, isArray = false) {
    const array = {
        type: 'array',
        items: { $ref: getSchemaPath(type) },
    };

    const notArray = { $ref: getSchemaPath(type) };

    return applyDecorators(
        ApiExtraModels(ChatEntity, MessageEntity),
        ApiOkResponse({
            schema: {
                anyOf: [
                    {
                        type: 'object',
                        properties: {
                            success: { type: 'boolean', example: true },
                            data: isArray ? array : notArray,
                        },
                        required: ['success', 'data'],
                    },

                    {
                        type: 'object',

                        properties: {
                            success: { type: 'boolean', example: false },
                            data: {
                                type: 'string',
                            },
                        },
                        required: ['success', 'data'],
                    },
                ],
            },
        }),
    );
}

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
